const mongoose = require('mongoose');

// 定义Schema
const Part1Schema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  tag: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  info: {
    type: Object,
    default: null
  }
});

// 创建Model
const PartOne = mongoose.model('PartOne', Part1Schema);

module.exports = PartOne;