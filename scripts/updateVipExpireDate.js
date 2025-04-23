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

    // 查找用户
    const user = await User.findOne({ phone: phoneNumber });
    
    if (!user) {
      console.log('未找到该手机号绑定的用户');
      return;
    }

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

    // console.log('更新结果:', result);

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