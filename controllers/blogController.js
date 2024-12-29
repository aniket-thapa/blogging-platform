// const Blog = require('../models/Blog');

// exports.getAllBlogs = async (req, res) => {
//   const blogs = await Blog.find().populate('author').sort({ createdAt: -1 });
//   res.render('blogs/index', { blogs });
// };

// exports.createBlog = async (req, res) => {
//   const { title, content } = req.body;
//   const sanitizedContent = sanitizeHtml(content);
//   const blog = new Blog({
//     title,
//     content: sanitizedContent,
//     author: req.user._id,
//   });
//   await blog.save();
//   res.redirect('/blogs');
// };

// exports.editBlog = async (req, res) => {
//   const blog = await Blog.findById(req.params.id);
//   if (blog.author.equals(req.user._id)) {
//     res.render('blogs/edit', { blog });
//   } else {
//     res.redirect('/blogs');
//   }
// };

// exports.deleteBlog = async (req, res) => {
//   const blog = await Blog.findById(req.params.id);
//   if (blog.author.equals(req.user._id)) {
//     await blog.remove();
//     res.redirect('/blogs');
//   } else {
//     res.redirect('/blogs');
//   }
// };
