const mongoose = require('mongoose');

const expertTopicsSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true,
    unique: true
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
    question_original: {
      type: String,
      required: true
    },
    question_rewrite: {
      type: String,
      required: true
    },
    question_cn: {
      type: String,
      required: true
    },
    questionId: {
      type: String,
      required: true
    }
  }]
});

module.exports = mongoose.model('ExpertTopics', expertTopicsSchema);