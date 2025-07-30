const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const User = require('../models/User');
const router = express.Router();

// Display All Blogs of an author
router.get('/:author', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author') // Populate author details like username and userId
      .sort({ createdAt: -1 });
    const user = req.user || null;
    res.render('blogs/index', { blogs, user });
  } catch (err) {
    res.status(500).render('error', {
      message: 'Internal Server Error',
      user: req.user || null,
    });
  }
});

module.exports = router;
