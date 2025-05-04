const mongoose = require('mongoose');
const User = require('../models/UserModel');

require('dotenv').config();  // 加载环境变量
const { connectDB } = require('../config/db');  // 引入数据库连接配置

// 获取命令行参数中的手机号
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('请提供手机号作为参数');
  console.log('使用方法: node scripts/updateVipExpireDate.js <手机号>');
  process.exit(1);
}

async function updateVipExpireDate() {
  try {
    // 连接数据库
    await connectDB();

    // 查找所有使用该手机号的用户
    const users = await User.find({ phone: phoneNumber });
    
    if (users.length === 0) {
      console.log('未找到该手机号绑定的用户');
      return;
    }

    if (users.length > 1) {
      console.log('警告：发现多个用户绑定了相同的手机号：');
      users.forEach(user => {
        console.log(`- 用户ID: ${user.userId}, 昵称: ${user.nickname}, 绑定时间: ${user.updatedAt}`);
      });
      console.log('\n请先解决手机号重复绑定的问题，再继续操作。');
      return;
    }

    const user = users[0];
    console.log(`找到用户: ${user.userId}, 当前VIP过期时间: ${user.vipExpireDate}`);

    // 计算新的VIP过期时间
    const now = new Date();
    let newExpireDate;
    
    if (!user.vipExpireDate || new Date(user.vipExpireDate) <= now) {
      // 如果之前没有VIP过期时间，或者已经过期，就在当前时间基础上加一年
      newExpireDate = new Date(now);
      newExpireDate.setFullYear(now.getFullYear() + 1);
    } else {
      // 如果还没过期，就在原过期时间基础上加一年
      newExpireDate = new Date(user.vipExpireDate);
      newExpireDate.setFullYear(newExpireDate.getFullYear() + 1);
    }

    console.log(`将更新VIP过期时间为: ${newExpireDate}`);

    // 更新用户的VIP过期时间
    const result = await User.updateOne(
      { userId: user.userId },
      { vipExpireDate: newExpireDate }
    );

    if (result.modifiedCount === 1) {
      console.log(`成功更新用户 ${user.userId} 的VIP过期时间为: ${newExpireDate}`);
    } else if (result.modifiedCount === 0) {
      console.log('没有更新任何记录，可能是因为新值与旧值相同');
      // 再次查询确认当前值
      const updatedUser = await User.findOne({ userId: user.userId });
      console.log(`当前VIP过期时间: ${updatedUser.vipExpireDate}`);
    } else {
      console.log('更新失败，未知原因');
    }

  } catch (error) {
    console.error('执行过程中出错:', error);
  } finally {
    // 关闭数据库连接
    mongoose.connection.close();
  }
}

// 执行更新
updateVipExpireDate(); 