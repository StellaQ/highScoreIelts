const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  inviterId: {
    type: String,
    required: true,
  },
  inviteeId: {
    type: String,
    unique: true, // 确保每个 inviteeId 只能被邀请一次
    required: true
  },
  inviteCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: {
    type: Date,
    default: null,
  }
});
// 创建并导出模型
const InviteModel = mongoose.model('Invite', inviteSchema);

module.exports = InviteModel;