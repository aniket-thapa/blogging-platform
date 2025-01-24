const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer'); // For Email OTPs
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const User = require('./models/User');
const app = express();
dotenv.config();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public'))); // Setup static files
app.set('view engine', 'ejs');

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const passportconfi = require('./config/passport'); // Passport config
app.use(passportconfi.initialize());
app.use(passportconfi.session());

// Add MethodOverride
app.use(methodOverride('_method'));

// SEND OTPS
let otps = {}; // Temporary store for OTPs (use a database for production)

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Route
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const user = await User.findOne({ useremail: email });
  if (user) {
    return res.json({ message: 'User already registered with this email' });
  }

  const otp = generateOTP();
  otps[email] = otp; // Save OTP in memory (use DB for production)

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Registration',
      html: `Dear User,<br><br><b>${otp}</b> is your OTP for Registration on Let's Blog.<br><br>It is valid for 5 minutes.<br><br>Thank you.`,
    });
    res.status(200).json({ message: 'OTP sent successfully' });

    // Set OTP expiration
    setTimeout(() => delete otps[email], 5 * 60 * 1000); // Remove OTP after 5 minutes
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify OTP Route
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  if (otps[email] === otp) {
    delete otps[email]; // Remove OTP after successful verification
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid or expired OTP' });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// User Routes (for profile)
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// Blog routes
const blogRoutes = require('./routes/blogRoutes');
app.use('/blogs', blogRoutes);

// Home Route
app.get('/', (req, res) => {
  const user = req.user || null;
  res.render('home', { user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Connect to SERVER and DATABASE
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    console.log('Database is Connected...');
    app.listen(PORT, () => {
      console.log(`Server is Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('NOT ABLE TO CONNECT TO DATABASE AS WELL SERVER', err);
  });
