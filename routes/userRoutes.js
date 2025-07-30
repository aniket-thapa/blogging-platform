const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const User = require('../models/User');
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

router.get('/settings', isAuthenticated, (req, res) => {
  res.render('users/settings', { user: req.user });
});

router.post('/settings/userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already exists' });
    }
    req.user.userId = userId;
    await req.user.save();
    res.status(200).json({ message: 'User ID updated successfully' });
  } catch (err) {
    console.error('Error updating User ID:', err);
    res
      .status(500)
      .json({ message: 'An error occurred while updating User ID' });
  }
});

module.exports = router;
