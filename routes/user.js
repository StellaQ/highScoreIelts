const express = require('express');
const router = express.Router();

const axios = require('axios');

const User = require('../models/UserModel'); // 引入用户模型
const Invite = require('../models/InviteModel'); // 引入邀请记录模型

const config = require('../config/configForMiniProgram');

const APP_ID = 'wx64644819be1ec93a';
const APP_SECRET = 'aeb6c176666f38a2d8b2ebccd0281504';

router.post('/getOpenId', async (req, res) => {
  const { code, codeFromInviter } = req.body;

  try {
    const wxRes = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
      params: {
        appid: APP_ID,
        secret: APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = wxRes.data;
    let user = await User.findOne({ openid });
    // let isNewUser = false;

    if (!user) {
      // 这是新用户
      // isNewUser = true;

      // 生成随机昵称
      const nicknames = [
        '发音大师', 'Chat小达人', '口语小超人', 'Talk闪闪', '口语精灵', '语感高手'
      ];
      const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];

      // 生成唯一的邀请码
      let code;
      let isUnique = false;

      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingUser = await User.findOne({ inviteCode: code });
        if (!existingUser) {
          isUnique = true;
        }
      }

      user = new User({ 
        openid,
        nickname: randomNickname,
        avatarUrl: '',
        inviteCode: code, // 保存邀请码
        points: 0,
        hasUsedInviteCode: false
      });
      await user.save();

      // 处理邀请关系
      if (codeFromInviter) {
        const inviter = await User.findOne({ inviteCode: codeFromInviter });
        if (inviter && !user.hasUsedInviteCode) {
          // 创建邀请记录
          await Invite.create({
            inviterId: inviter.userId,
            inviteeId: user.userId,
            inviteCode: codeFromInviter,
            status: 'accepted',
            acceptedAt: new Date(),
            createdAt: new Date()
          });

          // 更新双方积分
          await User.updateOne(
            { userId: inviter.userId },
            { $inc: { points: config.INVITE_POINTS } }
          );
          
          await User.updateOne(
            { userId: user.userId },
            { 
              $inc: { points: config.INVITE_POINTS },
              hasUsedInviteCode: true 
            }
          );
        }
      }
    } else {
      // user.lastLogin = new Date();
      // await user.save();
    }

    res.json({
      data: {  // 添加 data 层
        userInfo: {
          userId: user.userId,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          inviteCode: user.inviteCode
        }
      }
    });
  } catch (error) {
    console.error('获取 openid 失败:', error);
    res.status(500).json({ error: '获取 openid 失败' });
  }
});
// 更新用户信息 done
router.post('/updateProfile', async (req, res) => {
  try {
    const { userId, nickname, avatarUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '用户 ID 不能为空' });
    }

    // 查找并更新用户信息
    const updatedUser = await User.findOneAndUpdate(
      { userId: userId }, // 根据 userId 查找
      { nickname, avatarUrl }, // 更新昵称和头像
      { new: true } // 返回更新后的数据
    );

    if (!updatedUser) {
      return res.status(404).json({ error: '用户未找到' });
    }

    res.json({
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新用户积分 done
router.post('/updatePoints', async (req, res) => {
  try {
    // console.log('收到更新积分请求：', req.body);
    const { userId, points } = req.body;
    
    if (!userId || points === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    // 更新用户积分
    const result = await User.findOneAndUpdate(
      { userId: userId },
      { points: points },
      { new: true } // 返回更新后的文档
    );

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    res.json({
      success: true,
      message: '积分更新成功'
      // data: {
      //   points: result.points
      // }
    });

  } catch (error) {
    console.error('更新积分失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});
// 检查今日最新数据
router.get('/getLatestStatus/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const hasCheckedIn = user.signInDates.includes(today);
    const streakDays = user.signInDates.length;

    res.json({
      points: user.points,
      hasCheckedIn,
      streakDays,
      inviteCode: user.inviteCode,
      hasUsedInviteCode: user.hasUsedInviteCode
    });
  } catch (error) {
    console.error('检查签到状态失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});
// 执行签到 done
router.post('/signIn/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查是否已签到
    if (user.signInDates.includes(today)) {
      return res.status(400).json({ message: '今日已签到' });
    }

    // 检查是否连续签到
    const lastSignIn = user.signInDates[0];
    if (lastSignIn) {
      const lastDate = new Date(lastSignIn);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      // 如果不是连续签到，清空之前的签到记录
      if (diffDays > 1) {
        user.signInDates = [];
      }
    }

    // 添加今日签到记录
    user.signInDates.unshift(today);
    
    // 更新积分
    user.points += config.SIGN_IN_POINTS;

    await user.save();

    res.json({
      success: true,
      points: user.points,
      streakDays: user.signInDates.length
    });
  } catch (error) {
    console.error('签到失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});
// 检查总的邀请人数和最近三天的邀请人数 done
router.get('/checkInvites/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recentInvites = await Invite.countDocuments({
      inviterId: userId,
      createdAt: { $gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } // 最近三天
    });

    const totalInvites = await Invite.countDocuments({
      inviterId: userId
    });

    res.json({ recentInvites, totalInvites });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check invites' });
  }
});

// 验证邀请码
router.post('/verifyInviteCode', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;

    // 查找当前用户
    const currentUser = await User.findOne({ userId });
    if (!currentUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 检查用户是否已经使用过邀请码
    if (currentUser.hasUsedInviteCode) {
      return res.status(400).json({ error: '您已经使用过邀请码' });
    }

    // 查找邀请者
    const inviter = await User.findOne({ inviteCode });
    if (!inviter) {
      return res.status(404).json({ error: '无效的邀请码' });
    }

    // 检查是否是自己的邀请码
    if (inviter.userId === currentUser.userId) {
      return res.status(400).json({ error: '不能使用自己的邀请码' });
    }

    // 创建邀请记录
    await Invite.create({
      inviterId: inviter.userId,
      inviteeId: currentUser.userId,
      inviteCode: inviteCode,
      status: 'accepted',
      acceptedAt: new Date(),
      createdAt: new Date()
    });

    // 更新双方积分
    await User.updateOne(
      { userId: inviter.userId },
      { $inc: { points: config.INVITE_POINTS } }
    );
    
    await User.updateOne(
      { userId: currentUser.userId },
      { 
        $inc: { points: config.INVITE_POINTS },
        hasUsedInviteCode: true 
      }
    );

    // 获取更新后的用户信息
    const updatedUser = await User.findOne({ userId: currentUser.userId });

    res.json({ 
      success: true,
      points: updatedUser.points,
      message: '邀请码验证成功'
    });
  } catch (error) {
    console.error('验证邀请码失败:', error);
    res.status(500).json({ error: '验证邀请码失败' });
  }
});

module.exports = router;