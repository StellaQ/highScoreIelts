const mongoose = require('mongoose');
const { isValidVip } = require('../utils/vipUtils');

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
  nickname: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: '',
    unique: true,  // 添加唯一性约束
    sparse: true   // 允许空值，但非空值必须唯一
  },
  points: {
    type: Number,
    default: 0
  },
  signInDates: { type: [String], default: [] }, // 存储签到日期数组
  inviteCode: {
    type: String,
    unique: true, // 确保唯一性
  },
  hasUsedInviteCode: {
    type: Boolean,
    default: false
  },
  vipType: {
    type: Number,
    enum: [0, 1, 2], // 0: 非VIP, 1: 季卡, 2: 年卡
    default: 0
  },
  vipBatch: {
    type: String,
    default: null 
  },
  vipExpireDate: {
    type: Date,
    default: null // VIP 过期时间
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
  // 预留字段，方便后续扩展
  extra: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // 存储额外的动态数据
  }
});

// 添加方法：检查用户是否是有效的VIP用户
userSchema.methods.isValidVipUser = function() {
  return isValidVip(this.vipExpireDate);
};

// 创建并导出模型
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
