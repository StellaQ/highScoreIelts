const mongoose = require('mongoose');

const advancedQuestionsSchema = new mongoose.Schema({
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
  points: [{
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
    }
  }]
});

module.exports = mongoose.model('AdvancedQuestions', advancedQuestionsSchema);