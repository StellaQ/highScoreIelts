const express = require('express');
const router = express.Router();

const axios = require('axios');

const User = require('../models/UserModel'); // 引入用户模型
const InviteUser = require('../models/InviteUser'); // 引入邀请记录模型

const APP_ID = 'wx64644819be1ec93a';
const APP_SECRET = 'aeb6c176666f38a2d8b2ebccd0281504';

router.post('/getOpenId', async (req, res) => {
  const { code, inviterId } = req.body;

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

      user = new User({ 
        openid,
        nickname: randomNickname,
        avatarUrl: '', // 默认头像可以在这里设置
        points: 0 // 初始积分为0
      });
      await user.save();

      // 如果有邀请人ID，处理邀请关系
      // if (inviterId && inviterId !== user.userId) {
      //   // 检查是否已被邀请
      //   const existingInvite = await InviteUser.findOne({ inviteeId: user.userId });
      //   if (!existingInvite) {
      //     // 创建邀请记录
      //     await InviteUser.create({
      //       inviterId,
      //       inviteeId: user.userId,
      //       createdAt: new Date()
      //     });

      //     // 更新邀请人的邀请计数
      //     await User.updateOne(
      //       { userId: inviterId },
      //       { $inc: { inviteCount: 1 } }
      //     );
      //   }
      // }
    } else {
      // user.lastLogin = new Date();
      // await user.save();
    }

    res.json({
      userInfo: {
        userId: user.userId,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        points: user.points || 0
      }
      // isNewUser
    });
  } catch (error) {
    console.error('获取 openid 失败:', error);
    res.status(500).json({ error: '获取 openid 失败' });
  }
});

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

router.route('/updateNumOfUsesLeftByNew')
  // 获取 numOfUsesLeftByNew
  .get(async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: '缺少 userId 参数' });
      }

      const user = await User.findOne({ userId });

      if (!user) {
        return res.status(404).json({ error: '用户未找到' });
      }

      res.json({
        message: '获取成功',
        numOfUsesLeftByNew: user.numOfUsesLeftByNew
      });
    } catch (error) {
      console.error('获取 numOfUsesLeftByNew 失败:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  })
  // 更新 numOfUsesLeftByNew
  .post(async (req, res) => {
    try {
      const { userId, newCount } = req.body;

      if (!userId || newCount === undefined) {
        return res.status(400).json({ error: '参数错误' });
      }

      const user = await User.findOne({ userId });

      if (!user) {
        return res.status(404).json({ error: '用户未找到' });
      }

      user.numOfUsesLeftByNew = newCount;
      await user.save();

      res.json({
        message: '更新成功',
        numOfUsesLeftByNew: user.numOfUsesLeftByNew
      });
    } catch (error) {
      console.error('更新 numOfUsesLeftByNew 失败:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  });

// 处理邀请关系
router.post('/checkAndRecordInvite', async (req, res) => {
  try {
    const { inviterId, inviteeId } = req.body;

    if (!inviterId || !inviteeId) {
      return res.status(400).json({ 
        success: false, 
        message: '邀请人ID和被邀请人ID不能为空' 
      });
    }

    // 1. 检查是否已被邀请过
    const existingInvite = await InviteUser.findOne({ inviteeId });
    if (existingInvite) {
      return res.json({ 
        success: false, 
        message: '该用户已被其他人邀请过' 
      });
    }

    // 2. 创建邀请记录
    await InviteUser.create({ 
      inviterId, 
      inviteeId,
      createdAt: new Date()
    });

    // 3. 更新邀请人的 inviteCount
    await User.updateOne(
      { userId: inviterId },
      { $inc: { inviteCount: 1 } }
    );

    // 4. 获取更新后的邀请人信息
    const updatedUser = await User.findOne({ userId: inviterId });

    res.json({
      success: true,
      message: '邀请记录创建成功',
      inviteCount: updatedUser.inviteCount
    });

  } catch (error) {
    console.error('处理邀请关系失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 获取邀请数量
router.get('/updateInviteCount', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      inviteCount: user.inviteCount
    });
  } catch (error) {
    console.error('获取邀请数量失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;