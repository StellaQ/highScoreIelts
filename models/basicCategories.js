const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  categoryName_cn: {
    type: String,
    required: true
  },
  topics: [{
    topicId: {
      type: String,
      required: true
    },
    topicName: {
      type: String,
      required: true
    },
    topicName_cn: {
      type: String,
      required: true
    }
  }]
});

// 创建索引
categorySchema.index({ categoryId: 1 }, { unique: true });

module.exports = mongoose.model('BasicCategories', categorySchema); 