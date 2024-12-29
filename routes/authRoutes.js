const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register');
  }
});

// Login Route
router.get('/login', (req, res) => res.render('auth/login'));

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/blogs',
    failureRedirect: '/login',
  })
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

module.exports = router;
