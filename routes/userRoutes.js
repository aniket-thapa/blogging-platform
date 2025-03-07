const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const router = express.Router();

// User Profile Route
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    res.render('users/profile', { user: req.user });
  } catch (err) {
    res.redirect('/blogs');
  }
});

// User Profile Route
router.get('/created', isAuthenticated, async (req, res) => {
  try {
    const userBlogs = await Blog.find({ author: req.user._id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.render('users/createdBlogs', { user: req.user, blogs: userBlogs });
  } catch (err) {
    res.redirect('/blogs');
  }
});

module.exports = router;
