const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
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
// app.set('view cache', true);

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const passportconfig = require('./config/passport'); // Passport config
app.use(passportconfig.initialize());
app.use(passportconfig.session());

// Add MethodOverride
app.use(methodOverride('_method'));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// User Routes (for profile)
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// Blog routes
const blogRoutes = require('./routes/blogRoutes');
app.use('/blogs', blogRoutes);

// Author routes
const authorRoutes = require('./routes/authorRoutes');
app.use('/author', authorRoutes);

// Home Route
app.get('/', (req, res) => {
  const user = req.user || null;
  res.render('home', { user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
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
