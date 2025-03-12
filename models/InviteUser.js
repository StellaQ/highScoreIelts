const mongoose = require('mongoose');

const inviteUserSchema = new mongoose.Schema({
  inviterId: {
    type: String,
    required: true,
    index: true // 创建索引以提高查询性能
  },
  inviteeId: {
    type: String,
    required: true,
    unique: true // 确保一个用户只能被邀请一次
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建复合索引
inviteUserSchema.index({ inviterId: 1, inviteeId: 1 }, { unique: true });

const InviteUser = mongoose.model('InviteUser', inviteUserSchema);

module.exports = InviteUser; 