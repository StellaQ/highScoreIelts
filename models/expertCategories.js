const mongoose = require('mongoose');

const expertCategoriesSchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true
  },
  categoryName: {
    type: String,
    required: true
  },
  categoryName_cn: {
    type: String,
    required: true
  },
  topicCollection: [{
    topicId: String,
    topicName: String,
    topicName_cn: String
  }]
});

module.exports = mongoose.model('ExpertCategories', expertCategoriesSchema);