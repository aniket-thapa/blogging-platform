const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.get('/register', (req, res) => {
  const user = req.user || null;
  res.render('auth/register', { user });
});

router.post('/register', async (req, res) => {
  const { username, useremail, password } = req.body;

  try {
    const existingUser = await User.findOne({ useremail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const user = new User({ username, useremail, password });
    await user.save();
    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'An error occurred. Please try again later.' });
  }
});

// Login Route
router.get('/login', (req, res) => {
  const user = req.user || null;
  res.render('auth/login', { user });
});

// Handle login with custom returnTo logic
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    res.status(200).json({ message: 'User login successfully!' });
  }
);

// Google OAuth Login
router.get(
  '/auth/google',
  (req, res, next) => {
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect('/user/profile');
  }
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: 'An error occurred while logging out.' });
    }
    res.redirect('/login');
  });
});

module.exports = router;
