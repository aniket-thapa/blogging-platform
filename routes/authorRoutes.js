const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const User = require('../models/User');
const router = express.Router();

// Display All Blogs of an author by username (/@username)
router.get('/@:author', async (req, res) => {
  const { author } = req.params;
  try {
    const userDoc = await User.findOne({ userId: author });
    if (!userDoc) {
      return res.status(404).render('error', {
        message: 'Author not found',
        user: req.user || null,
      });
    }

    const blogs = await Blog.find({ author: userDoc._id })
      .populate('author', 'username userId')
      .sort({ createdAt: -1 });

    res.render('blogs/index', { blogs, user: req.user || null });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'Internal Server Error',
      user: req.user || null,
    });
  }
});

module.exports = router;
