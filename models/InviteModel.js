const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  inviterId: {
    type: String,
    required: true,
  },
  inviteeId: {
    type: String,
    unique: true, // 确保每个 inviteeId 只能被邀请一次
    sparse: true, // 允许 null 值的唯一性约束
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
});
// 创建并导出模型
const InviteModel = mongoose.model('Invite', inviteSchema);

module.exports = InviteModel;