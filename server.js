const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const connectDB = require('./config/database');

// Initialize app
const app = express();
dotenv.config();

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Template engine
app.set('view engine', 'ejs');

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport authentication
const passportconfig = require('./config/passport');
app.use(passportconfig.initialize());
app.use(passportconfig.session());

// Method override (for PUT/DELETE in forms)
app.use(methodOverride('_method'));

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// User routes (/user/...)
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// Blog routes (/blogs/...)
const blogRoutes = require('./routes/blogRoutes');
app.use('/blogs', blogRoutes);

// Author routes (/@username)
const authorRoutes = require('./routes/authorRoutes');
app.use('/', authorRoutes);

// Home route
app.get('/', (req, res) => {
  const user = req.user || null;
  res.render('home', { user });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

// Server & Database Connection
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    console.log('Database is Connected...');
    app.listen(PORT, () => {
      console.log(`Server is Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('NOT ABLE TO CONNECT TO DATABASE OR SERVER', err);
  });
