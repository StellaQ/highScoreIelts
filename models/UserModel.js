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
    default: null // 季卡用户的批次号
  },
  vipExpireDate: {
    type: Date,
    default: null // 年卡 VIP 过期时间
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

// 添加复合索引，用于快速查询季卡用户
userSchema.index({ vipType: 1, vipBatch: 1 });

// 添加方法：检查用户是否是有效的季卡用户
userSchema.methods.isValidSeasonCardUser = function(currentBatch) {
  return this.vipType === 1 && this.vipBatch === currentBatch;
};

// 添加方法：检查用户是否是有效的年卡用户
userSchema.methods.isValidYearCardUser = function() {
  return this.vipType === 2 && this.vipExpireDate && this.vipExpireDate > new Date();
};

// 添加方法：检查用户是否是有效的VIP用户
userSchema.methods.isValidVipUser = function(currentBatch) {
  return this.isValidSeasonCardUser(currentBatch) || this.isValidYearCardUser();
};

// 创建并导出模型
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
