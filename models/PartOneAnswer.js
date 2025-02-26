const mongoose = require('mongoose');

// 问题答案单独存储
const partOneAnswerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,  // 必填
    ref: 'User'  // 引用用户表
  },
  qId: { 
    type: String, 
    required: true  // 问题 ID
  },
  AIanswer: { 
    type: String, 
    required: true  // AI 给出的答案
  },
}, {
  timestamps: true  // 自动添加创建和更新时间
});

const PartOneAnswer = mongoose.model('PartOneAnswer', partOneAnswerSchema);

module.exports = PartOneAnswer;
