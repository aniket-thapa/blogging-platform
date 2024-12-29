const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const router = express.Router();

// Display All Blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 });
  res.render('blogs/index', { blogs });
});

// Display Form to Create New Blog
router.get('/new', isAuthenticated, (req, res) => {
  res.render('blogs/new');
});

// Create New Blog
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
    });
    await blog.save();
    res.redirect('/blogs');
  } catch (err) {
    res.redirect('/blogs/new');
  }
});

// Show Single Blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'author',
      'username'
    );
    res.render('blogs/show', { blog });
  } catch (err) {
    res.redirect('/blogs');
  }
});

// Display Form to Edit Blog
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog.author.equals(req.user._id)) {
      return res.redirect('/blogs');
    }
    res.render('blogs/edit', { blog });
  } catch (err) {
    res.redirect('/blogs');
  }
});

// Update Blog
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog.author.equals(req.user._id)) {
      return res.redirect('/blogs');
    }
    blog.title = req.body.title;
    blog.content = req.body.content;
    blog.updatedAt = new Date();
    await blog.save();
    res.redirect(`/blogs/${blog._id}`);
  } catch (err) {
    res.redirect('/blogs');
  }
});

// Delete Blog
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog.author.equals(req.user._id)) {
      return res.redirect('/blogs');
    }
    await blog.deleteOne();
    res.redirect('/blogs');
  } catch (err) {
    res.redirect('/blogs');
  }
});

module.exports = router;
