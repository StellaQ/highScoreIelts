const mongoose = require('mongoose');

const advancedRecordSchema = new mongoose.Schema({
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
  isCompleted: {
    type: Boolean,
    default: false,
  },
  answers: {
    type: Object,
    default: {},
  },
  practiceCount: {
    type: Number,
    default: 0,
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
advancedRecordSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('AdvancedRecord', advancedRecordSchema);
