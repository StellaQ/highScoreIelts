const mongoose = require('mongoose');

// 定义 Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
});

// 创建并导出模型
const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
