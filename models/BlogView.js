const mongoose = require('mongoose');

const blogViewSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    viewCount: { type: Number, default: 0 },
    lastViewed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BlogView = mongoose.model('BlogView', blogViewSchema);
module.exports = BlogView;