const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, maxlength: 100, minlength: 8, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    coverImage: {
      url: String,
      public_id: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
