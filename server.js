const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

const methodOverride = require('method-override');

dotenv.config();

const app = express();

const connectDB = require('./config/database');
connectDB();

// Middleware
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
const authRoutes = require('./routes/authRoutes'); // Auth routes

app.use(passportconfi.initialize());
app.use(passportconfi.session());

// Use routes
app.use(authRoutes);

// Use MethodOverride in Blogs CRUD Opprations
app.use(methodOverride('_method'));

// Home Route
app.get('/', (req, res) => {
  res.render('home');
});

const userRoutes = require('./routes/userRoutes'); // User Routes

app.use('/profile', userRoutes);

const blogRoutes = require('./routes/blogRoutes'); // Blog routes

app.use('/blogs', blogRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
