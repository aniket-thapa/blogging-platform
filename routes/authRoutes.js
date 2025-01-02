const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', async (req, res) => {
  const { username, useremail, password } = req.body;
  try {
    const user = new User({ username, useremail, password });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register');
  }
});

// Login Route
router.get('/login', (req, res) => res.render('auth/login'));

// Handle login with custom returnTo logic
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    // Redirect to the saved URL or default to the dashboard
    const redirectTo = req.session.returnTo || '/blogs';
    delete req.session.returnTo; // Clear the session variable
    res.redirect(redirectTo);
  }
);

// Google OAuth Login
router.get(
  '/auth/google',
  (req, res, next) => {
    if (req.query.returnTo) {
      req.session.returnTo = req.query.returnTo; // Save returnTo from query
    }
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
    const redirectTo = req.session.returnTo || '/blogs';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  }
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

module.exports = router;
