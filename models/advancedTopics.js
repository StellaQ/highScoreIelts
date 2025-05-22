const mongoose = require('mongoose');

const advancedTopicsSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true,
    unique: true
  },
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
  points: [{
    point_real: {
      type: String,
      required: true
    },
    pointId: {
      type: String,
      required: true
    },
    point_rewrite: {
      type: String,
      required: true
    },
    point_cn: {
      type: String,
      required: true
    }
  }]
});

module.exports = mongoose.model('AdvancedTopics', advancedTopicsSchema);