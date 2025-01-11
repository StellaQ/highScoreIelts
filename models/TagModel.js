const mongoose = require('mongoose');

// 定义Schema
const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  nameInEnlish: {
    type: String,
    required: true
  },
  alias: {
    type: String,
    required: true
  }
});

// 创建Model
const Tag = mongoose.model('Tags', TagSchema);

module.exports = Tag;