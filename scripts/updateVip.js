const mongoose = require('mongoose');
const User = require('../models/UserModel');
const { CURRENT_BATCH } = require('../config/configForMiniProgram');
const readline = require('readline');

require('dotenv').config();  // 加载环境变量
const { connectDB } = require('../config/db');  // 引入数据库连接配置

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 获取命令行参数中的手机号
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('请提供手机号作为参数');
  console.log('使用方法: node scripts/updateVip.js <手机号>');
  process.exit(1);
}

async function showUserStatus() {
  try {
    // 连接数据库
    await connectDB();

    // 查找所有使用该手机号的用户
    const users = await User.find({ phone: phoneNumber });
    
    if (users.length === 0) {
      console.log('未找到该手机号绑定的用户');
      return false;
    }

    if (users.length > 1) {
      console.log('警告：发现多个用户绑定了相同的手机号：');
      users.forEach(user => {
        console.log(`- 用户ID: ${user.userId}, 昵称: ${user.nickname}, 绑定时间: ${user.updatedAt}`);
      });
      console.log('\n请先解决手机号重复绑定的问题，再继续操作。');
      return false;
    }

    const user = users[0];
    console.log('\n当前用户状态:');
    console.log(`用户ID: ${user.userId}`);
    console.log(`昵称: ${user.nickname}`);
    console.log(`VIP类型: ${user.vipType === 0 ? '非VIP' : user.vipType === 1 ? '季卡' : '年卡'}`);
    console.log(`季卡批次: ${user.vipBatch || '无'}`);
    console.log(`年卡过期时间: ${user.vipExpireDate || '无'}`);
    console.log('\n请选择充值类型:');
    console.log('1. 季卡');
    console.log('2. 年卡');
    console.log('0. 退出');

    return true;
  } catch (error) {
    console.error('查询用户状态时出错:', error);
    return false;
  }
}

async function updateVipState(vipType) {
  try {
    const users = await User.find({ phone: phoneNumber });
    const user = users[0];
    
    let updateData = {};
    
    if (vipType === 1) {
      // 季卡充值
      updateData = {
        vipType: 1,
        vipBatch: CURRENT_BATCH,
        vipExpireDate: null // 季卡不需要过期时间
      };
      console.log(`\n将更新为季卡用户，批次: ${CURRENT_BATCH}`);
    } else {
      // 年卡充值
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

      updateData = {
        vipType: 2,
        vipBatch: null, // 年卡不需要批次
        vipExpireDate: newExpireDate
      };
      console.log(`\n将更新为年卡用户，过期时间: ${newExpireDate}`);
    }

    // 更新用户的VIP状态
    const result = await User.updateOne(
      { userId: user.userId },
      updateData
    );

    if (result.modifiedCount === 1) {
      console.log(`成功更新用户 ${user.userId} (${user.nickname}, ${user.phone}) 的VIP状态`);
      // 再次查询确认当前值
      const updatedUser = await User.findOne({ userId: user.userId });
      console.log('\n更新后的用户状态:');
      console.log(`用户ID: ${updatedUser.userId}`);
      console.log(`昵称: ${updatedUser.nickname}`);
      console.log(`手机号: ${updatedUser.phone}`);
      console.log(`VIP类型: ${updatedUser.vipType === 0 ? '非VIP' : updatedUser.vipType === 1 ? '季卡' : '年卡'}`);
      console.log(`批次: ${updatedUser.vipBatch || '无'}`);
      console.log(`过期时间: ${updatedUser.vipExpireDate || '无'}`);
    } else if (result.modifiedCount === 0) {
      console.log('没有更新任何记录，可能是因为新值与旧值相同');
    } else {
      console.log('更新失败，未知原因');
    }

  } catch (error) {
    console.error('更新VIP状态时出错:', error);
  }
}

async function main() {
  try {
    const isValid = await showUserStatus();
    if (!isValid) {
      mongoose.connection.close();
      process.exit(1);
    }

    rl.question('\n请输入选项 (0-2): ', async (answer) => {
      const choice = parseInt(answer);
      
      if (choice === 0) {
        console.log('操作已取消');
        rl.close();
        mongoose.connection.close();
        return;
      }
      
      if (choice !== 1 && choice !== 2) {
        console.log('无效的选项，请输入 0、1 或 2');
        rl.close();
        mongoose.connection.close();
        return;
      }

      await updateVipState(choice);
      rl.close();
      mongoose.connection.close();
    });

  } catch (error) {
    console.error('执行过程中出错:', error);
    mongoose.connection.close();
  }
}

// 执行主函数
main();