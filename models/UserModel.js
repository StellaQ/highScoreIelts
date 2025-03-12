const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString() // 生成唯一用户 ID
  },
  isVip: {
    type: Boolean,
    default: false // 默认不是 VIP
  },
  nickname: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  numOfUsesLeftByNew: {
    type: Number,
    default: 0 // 默认没有刷题次数
  },
  inviteCount: { // 记录邀请人数
    type: Number,
    default: 0
  },
  gender: {
    type: Number, // 0: 未知, 1: 男, 2: 女
    default: 0
  },
  country: {
    type: String,
    default: ''
  },
  province: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'zh_CN' // 微信用户语言，默认中文
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  vipExpireDate: {
    type: Date,
    default: null // VIP 过期时间
  },
  // 预留字段，方便后续扩展
  extra: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // 存储额外的动态数据
  }
});
// 创建并导出模型
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
