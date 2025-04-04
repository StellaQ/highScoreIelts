const mongoose = require('mongoose');

const basicUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  topicId: {
    type: String,
    required: true,
  },
  lastReviewDate: {
    type: Date,
    default: null,
  },
  nextReviewDate: {
    type: Date,
    default: null,
  },
  answers: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// 创建复合索引，确保每个用户每个主题只有一条记录
basicUserSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('BasicUser', basicUserSchema);
