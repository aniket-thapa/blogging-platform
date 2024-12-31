const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
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
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
      });
    const user = req.user || null;
    res.render('blogs/show', { blog, user });
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
    await Comment.deleteMany({ blog: blog._id });
    await blog.deleteOne();
    res.redirect('/blogs');
  } catch (err) {
    res.redirect('/blogs');
  }
});

// Like a Blog
router.post('/:id/like', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // Prevent multiple likes by the same user
    if (blog.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    blog.likes.push(req.user._id);
    await blog.save();

    res.status(200).json({ likes: blog.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a Comment to a Blog
router.post('/:id/comments', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send('Blog not found');
    }
    // Create a new comment
    const newComment = new Comment({
      content: req.body.content,
      author: req.user._id,
      blog: blog._id,
    });

    await newComment.save();

    blog.comments.push(newComment._id);
    await blog.save();
    res.redirect(`/blogs/${blog._id}`);
  } catch (err) {
    res.redirect('/blogs');
  }
});

module.exports = router;
