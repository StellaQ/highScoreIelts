const express = require('express');
const router = express.Router();

const axios = require('axios');

const User = require('../models/UserModel'); // 引入用户模型
const Invite = require('../models/InviteModel'); // 引入邀请记录模型

const BasicRecord = require('../models/basicRecord');    // 引入基础题记录模型
const AdvancedRecord = require('../models/advancedRecord');  // 引入进阶题记录模型
const ExpertRecord = require('../models/expertRecord');    // 引入专家题记录模型

const config = require('../config/configForMiniProgram');

const APP_ID = process.env.WX_APP_ID;
const APP_SECRET = process.env.WX_APP_SECRET;

const jwt = require('jsonwebtoken');
// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const Order = require('../models/OrderModel'); // 引入订单模型
const wxpay = require('../utils/wxpay'); // 引入微信支付工具
const { isValidVip } = require('../utils/vipUtils');

// 导出 getOpenId 处理函数
const getOpenId = async (req, res) => {
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
    }

    // 生成JWT token时加入session_key
    const token = jwt.sign(
      { 
        userId: user.userId,
        openid: user.openid,
        sessionKey: session_key // 添加session_key
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      data: {
        userInfo: {
          userId: user.userId,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          inviteCode: user.inviteCode
        },
        token
      }
    });
  } catch (error) {
    console.error('获取 openid 失败:', error);
    res.status(500).json({ error: '获取 openid 失败' });
  }
};

// 注册路由
router.post('/getOpenId', getOpenId);

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
// 检查用户是否是vip
router.get('/vip-status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    // 从数据库查询用户VIP状态
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    const isVip = isValidVip(user.vipExpireDate);
    let vipExpireDate = '';
    
    if (isVip) {
      const cardType = user.vipType === 1 ? config.VIP_SEASON_NAME : config.VIP_YEARLY_NAME;
      vipExpireDate = cardType + ' ' + new Date(user.vipExpireDate).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
    }

    res.json({
      success: true,
      isVip,
      vipExpireDate,
      vipConfig: {
        seasonPrice: config.VIP_SEASON_PRICE,
        yearlyPrice: config.VIP_YEARLY_PRICE,
        seasonName: config.VIP_SEASON_NAME,
        yearlyName: config.VIP_YEARLY_NAME
      }
    });
  } catch (error) {
    console.error('获取VIP状态失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
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
// 获取用户最新状态
router.get('/getLatestStatus', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const hasCheckedIn = user.signInDates.includes(today);
    
    // 计算连续签到天数
    let streakDays = 0;
    if (user.signInDates.length > 0) {
      // 获取最后一次签到日期
      const lastSignIn = new Date(user.signInDates[user.signInDates.length - 1]);
      const todayDate = new Date(today);
      
      // 计算日期差（以天为单位）
      const diffTime = Math.abs(todayDate - lastSignIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // 如果最后一次签到是昨天，则连续签到天数加1
      if (diffDays <= 1) {
        streakDays = user.signInDates.length;
      } else if (diffDays > 1) {
        // 如果超过一天没签到，则连续签到中断
        streakDays = 0;
      }
    }

    // 统计三个表中的已完成题目总数
    const [basicCount, advancedCount, expertCount] = await Promise.all([
      BasicRecord.countDocuments({ 
        userId: user.userId, 
        isCompleted: true 
      }),
      AdvancedRecord.countDocuments({ 
        userId: user.userId, 
        isCompleted: true 
      }),
      ExpertRecord.countDocuments({ 
        userId: user.userId, 
        isCompleted: true 
      })
    ]);
    // 计算总题目数
    const totalTopics = basicCount + advancedCount + expertCount;

    res.json({
      points: user.points,
      configSignInPoints: config.SIGN_IN_POINTS,
      configInvitePoints: config.INVITE_POINTS,
      hasCheckedIn,
      totalTopics,
      streakDays,
      hasUsedInviteCode: user.hasUsedInviteCode,
      targetScore: user.targetScore || 6  // 添加目标分字段，如果不存在则默认为6
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
    let lastSignIn = null;
    if (user.signInDates.length > 0) {
      lastSignIn = user.signInDates[user.signInDates.length - 1]; // 获取最后一次签到日期
      const lastDate = new Date(lastSignIn);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      // 如果不是连续签到，清空之前的签到记录
      if (diffDays > 1) {
        user.signInDates = [];
      }
    }

    // 添加今日签到记录
    user.signInDates.push(today);
    
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

// 绑定手机号 不用
router.post('/bind-phone', async (req, res) => {
  try {
    const { userId, phoneNumber } = req.body;

    if (!userId || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: '手机号格式不正确' 
      });
    }

    // 检查手机号是否已被其他用户绑定
    const existingUser = await User.findOne({ phone: phoneNumber });
    if (existingUser && existingUser.userId !== userId) {
      return res.status(400).json({ 
        success: false, 
        message: '该手机号已被其他用户绑定，请联系客服排查' 
      });
    }

    // 更新用户手机号
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { phone: phoneNumber },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    res.json({
      success: true,
      message: '手机号绑定成功'
    });
  } catch (error) {
    console.error('绑定手机号失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 创建会员订阅订单
router.post('/subscribe', async (req, res) => {
  const { userId, subscribeType } = req.body;
  // console.log('========== 开始创建会员订阅订单 ==========');
  // console.log('1. 接收到的参数:', { userId, subscribeType });
  
  try {
    // 1. 验证参数
    if (!userId || !subscribeType) {
      // console.log('参数验证失败: 参数不完整');
      return res.status(400).json({ 
        code: -1,
        message: '参数不完整'
      });
    }
    if (!['season', 'yearly'].includes(subscribeType)) {
      // console.log('参数验证失败: 无效的订阅类型');
      return res.status(400).json({
        code: -1,
        message: '无效的订阅类型'
      });
    }

    // 2. 计算订单金额和会员到期时间
    const amount = subscribeType === 'season' ? config.VIP_SEASON_PRICE : config.VIP_YEARLY_PRICE;
    
    // 获取用户当前的会员状态
    const user = await User.findOne({ userId });
    if (!user) {
      console.log('用户不存在:', userId);
      return res.status(404).json({
        code: -1,
        message: '用户不存在'
      });
    }

    // 计算新的到期时间和确定订单类型
    const now = new Date();
    let expireDate;
    let orderType;

    // 判断用户的会员状态，确定订单类型
    if (!user.vipExpireDate) {
      // console.log('用户首次订阅会员');
      orderType = 'vip_first_subscribe';
      expireDate = new Date(now);
    } else if (new Date(user.vipExpireDate) > now) {
      // console.log('用户在有效期内续费');
      orderType = 'vip_renewal_active';
      expireDate = new Date(user.vipExpireDate);
    } else {
      // console.log('用户已过期续费');
      orderType = 'vip_renewal_expired';
      expireDate = new Date(now);
    }
    // 根据订阅类型延长时间
    if (subscribeType === 'season') {
      expireDate.setMonth(expireDate.getMonth() + 3);
    } else {
      expireDate.setFullYear(expireDate.getFullYear() + 1);
    }
    
    // console.log('订阅信息:', { 
    //   subscribeType, 
    //   amount, 
    //   currentExpireDate: user.vipExpireDate,
    //   newExpireDate: expireDate.toLocaleString('zh-CN') 
    // });

    // 3. 创建订单记录
    const order = await Order.create({
      userId,
      orderType,
      subscribeType,
      amount,
      status: 'pending',
      expireDate
    });
    // console.log('3. 创建订单记录成功:', {
    //   orderId: order._id,
    //   status: order.status,
    //   amount: order.amount
    // });

    // 4. 调用微信支付统一下单接口
    const trade_no = order._id.toString(); // 商户订单号
    const cardName = subscribeType === 'season' ? config.VIP_SEASON_NAME : config.VIP_YEARLY_NAME;
    const body = `AI口语练习${cardName}`; // 商品描述
    
    // 获取用户openid
    const userOpenid = user.openid;
    if (!userOpenid) {
      // console.log('获取用户openid失败:', { userId, userFound: !!user });
      return res.status(400).json({
        code: -1,
        message: '用户openid不存在'
      });
    }
    // console.log('4. 准备调用微信支付:', { 
    //   trade_no,
    //   body,
    //   openid: user.openid.substring(0, 5) + '***' // 只显示部分openid
    // });

    // 调用微信支付统一下单
    const result = await wxpay.unifiedOrder({
      appid: APP_ID,
      openid: userOpenid,
      mch_id: process.env.WX_MCH_ID,
      body,
      out_trade_no: trade_no,
      total_fee: amount * 100, // 微信支付金额单位是分
      trade_type: 'JSAPI',
      notify_url: process.env.WX_PAY_NOTIFY_URL
    });
    // console.log('5. 微信支付下单结果:', {
    //   return_code: result.return_code,
    //   result_code: result.result_code,
    //   prepay_id: result.prepay_id,
    //   err_code_des: result.err_code_des
    // });

    if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
      // console.log('微信支付下单失败:', result);
      return res.status(500).json({
        code: -1,
        message: '微信支付下单失败：' + (result.err_code_des || result.return_msg)
      });
    }

    // 6. 生成支付参数
    const payParams = wxpay.getPayParams({
      appId: APP_ID,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: result.nonce_str,
      package: `prepay_id=${result.prepay_id}`,
      signType: 'MD5'
    });
    // console.log('6. 生成支付参数成功');
    // console.log('========== 订单创建完成 ==========\n');

    res.json({
      code: 0,
      data: {
        payParams,
        orderId: order._id.toString()
      }
    });
  } catch (err) {
    console.error('创建订阅订单失败:', err);
    res.status(500).json({
      code: -1,
      message: err.message || '创建订阅订单失败'
    });
  }
});

// 支付成功后立即更新用户状态
router.post('/pay/success', async (req, res) => {
  // console.log('========== 收到前端支付成功通知 ==========');
  try {
    const { userId, orderId } = req.body;
    
    // console.log('1. 接收到的参数:', { userId, orderId });

    // 1. 查找订单
    const order = await Order.findById(orderId);
    if (!order) {
      // console.log('未找到对应订单:', orderId);
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    // console.log('2. 找到订单:', {
    //   orderId: order._id,
    //   subscribeType: order.subscribeType,
    //   amount: order.amount,
    //   expireDate: order.expireDate
    // });

    // 2. 更新订单状态（如果还未更新）
    if (order.status !== 'paid') {
      await Order.updateOne(
        { _id: order._id },
        {
          status: 'paid',
          paidAt: new Date()
        }
      );
      // console.log('3. 订单状态更新为已支付');
    }

    // 3. 更新用户会员状态
    const vipType = order.subscribeType === 'season' ? 1 : 2;
    await User.updateOne(
      { userId: order.userId },
      {
        vipType: vipType,
        vipExpireDate: order.expireDate
      }
    );
    // console.log('4. 用户会员状态更新成功:', {
    //   userId: order.userId,
    //   vipType: vipType,
    //   expireDate: order.expireDate.toLocaleString('zh-CN')
    // });

    // 4. 返回更新后的VIP状态
    const cardType = vipType === 1 ? config.VIP_SEASON_NAME : config.VIP_YEARLY_NAME;
    const vipExpireDate = cardType + ' ' + new Date(order.expireDate).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-');

    // console.log('5. 返回最新VIP状态');
    // console.log('========== 前端支付成功处理完成 ==========\n');

    res.json({
      success: true,
      isVip: true,
      vipExpireDate
    });
  } catch (error) {
    console.error('处理支付成功通知失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// aboutMe更新用户目标分
router.post('/update-target-score', async (req, res) => {
  try {
    const { userId, targetScore } = req.body;
    
    if (!userId || targetScore === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    // 验证分数范围
    if (targetScore < 6 || targetScore > 9 || targetScore % 0.5 !== 0) {
      return res.status(400).json({
        success: false,
        message: '无效的目标分数'
      });
    }

    // 更新用户目标分
    await User.updateOne(
      { userId },
      { targetScore }
    );

    res.json({
      success: true,
      message: '目标分更新成功'
    });
  } catch (error) {
    console.error('更新目标分失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// index更新目标分提醒状态
router.post('/update-target-score-reminded', async (req, res) => {
  try {
    const userId = req.body.userId;

    // 更新提醒状态
    await User.updateOne(
      { userId },
      { hasTargetScoreReminded: true }
    );

    res.json({
      success: true,
      message: '提醒状态更新成功'
    });
  } catch (error) {
    console.error('更新提醒状态失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 查询目标分提醒状态
router.get('/check-target-score-reminded', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    const user = await User.findOne(
      { userId }, 
      { hasTargetScoreReminded: 1 }  // 只查询这个字段
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    res.json({
      success: true,
      data: {
        hasTargetScoreReminded: user.hasTargetScoreReminded || false
      }
    });
  } catch (error) {
    console.error('查询提醒状态失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

module.exports = {
  router,
  getOpenId
};