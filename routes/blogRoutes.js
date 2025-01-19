const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const BlogView = require('../models/BlogView');
const User = require('../models/User');
const router = express.Router();

// Display All Blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 });
  const user = req.user || null;
  res.render('blogs/index', { blogs, user });
});

// Display Form to Create New Blog
router.get('/new', isAuthenticated, (req, res) => {
  const user = req.user || null;
  res.render('blogs/new', { user });
});

// GET route for displaying saved blogs
router.get('/saved', isAuthenticated, async (req, res) => {
  try {
    // Fetch saved blogs for the logged-in user
    const userId = req.user._id; // Assuming `req.user` contains authenticated user's info
    const user = await User.findById(userId).populate({
      path: 'savedBlogs', // Populate savedBlogs
      populate: {
        path: 'author', // Nested populate for the author field in Blog
        select: 'username useremail', // Select specific fields from author
      },
    }); // Replace `savedBlogs` with your actual field name.
    if (!user || !user.savedBlogs) {
      return res.status(404).render('savedBlogs', { savedBlogs: [] }); // No saved blogs found
    }

    // Render the savedBlogs.ejs page and pass the blogs to it
    res.render('blogs/savedBlogs', { savedBlogs: user.savedBlogs, user: user });
  } catch (error) {
    console.error('Error fetching saved blogs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create New Blog
router.post('/new', isAuthenticated, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const tagArray = tags.split(',').map((tag) => tag.trim().toLowerCase());
    const blog = new Blog({
      title: title,
      content: content,
      tags: tagArray,
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
        populate: { path: 'author', select: ['username', 'useremail'] },
      });
    const user = req.user || null;
    res.render('blogs/show', { blog, user });
  } catch (err) {
    res.redirect('/blogs');
  }
});

// Show Single Blog filter with tag / tags
router.get('/tags/:tag', async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase();
    const blogs = await Blog.find({ tags: tag });
    const user = req.user || null;
    res.render('blogs/index', { blogs, user }); // Adjust view as necessary
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Display Form to Edit Blog
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog.author.equals(req.user._id)) {
      return res.redirect('/blogs');
    }
    const user = req.user || null;
    res.render('blogs/edit', { blog, user });
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

    const userId = req.user._id;

    if (blog.likes.includes(userId)) {
      blog.likes.pull(userId);
      await blog.save();
      return res
        .status(200)
        .json({ likes: blog.likes.length, message: 'Unliked' });
    } else {
      blog.likes.push(userId);
      await blog.save();
      return res
        .status(200)
        .json({ likes: blog.likes.length, message: 'Liked' });
    }
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

// Save or Bookmark a Blog
router.post('/:id/save', async (req, res) => {
  try {
    const blogId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user.savedBlogs.includes(blogId)) {
      user.savedBlogs.push(blogId);
      await user.save();
      res.json({ success: true, message: 'Blog saved successfully!' });
    } else {
      res.json({ success: false, message: 'Blog already saved.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
});

// Remove a Blog from Saved
router.post('/:id/unsave', async (req, res) => {
  try {
    const blogId = req.params.id;
    const user = await User.findById(req.user._id);

    user.savedBlogs = user.savedBlogs.filter((id) => id.toString() !== blogId);
    await user.save();
    res.json({ success: true, message: 'Blog removed from saved!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
});

// Track view count after the user has stayed for 20 seconds
router.post('/track-view/:id', async (req, res) => {
  try {
    const blogId = req.params.id;

    // Find or create the BlogView for the current blog post
    let blogView = await BlogView.findOne({ blog: blogId });

    if (!blogView) {
      // If no BlogView exists for this blog, create one
      blogView = new BlogView({
        blog: blogId,
        viewCount: 1,
      });
    } else {
      // If BlogView exists, increment the view count
      blogView.viewCount += 1;
    }

    // Update the lastViewed timestamp
    blogView.lastViewed = new Date();

    // Save the BlogView document
    await blogView.save();

    res.status(200).send('View recorded successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
