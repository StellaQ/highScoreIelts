const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topicName_real: {
    type: String,
    required: true
  },
  topicName_rewrite: {
    type: String,
    required: true
  },
  topicName_cn: {
    type: String,
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  questions: [{
    qTitle: {
      type: String,
      required: true
    },
    qRewrite: {
      type: String,
      required: true
    },
    qTitle_cn: {
      type: String,
      required: true
    },
    qId: {
      type: String,
      required: true
    }
  }]
});

// 创建索引
topicSchema.index({ topicId: 1 }, { unique: true });

module.exports = mongoose.model('BasicTopics', topicSchema); 