const mongoose = require('mongoose');

// 每个 tag 存储为单独的文档
const partOneTagProcessSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'  // 引用用户表
  },
  tagId: { 
    type: String, 
    required: true 
  },
  stage: { 
    type: Number, 
    required: true 
  },
  reviewDate: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

const PartOneTagProcess = mongoose.model('PartOneTagProcess', partOneTagProcessSchema);

module.exports = PartOneTagProcess;