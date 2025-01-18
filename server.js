const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const app = express();
dotenv.config();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
// Setup static files
app.use('/public', express.static(path.join(__dirname, 'public')));
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

// Routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// Home Route
app.get('/', (req, res) => {
  const user = req.user || null;
  res.render('home', { user });
});

// User Routes (for profile)
const userRoutes = require('./routes/userRoutes');
app.use('/profile', userRoutes);

// Blog routes
const blogRoutes = require('./routes/blogRoutes');
app.use('/blogs', blogRoutes);

// Error handling middleware (Optional but recommended)
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
