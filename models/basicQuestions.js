const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
  },
  questions: [{
    qTitle: {
      type: String,
      required: true
    },
    qTitle_cn: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: true
    },
    from: {
      type: String,
      required: true
    },
    choices: {
      type: [String],
      default: undefined
    }
  }]
});

// 创建索引
questionSchema.index({ topicId: 1 }, { unique: true });

module.exports = mongoose.model('BasicQuestions', questionSchema); 