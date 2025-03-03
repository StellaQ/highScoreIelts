const express = require('express');
const router = express.Router();

const axios = require('axios');

const User = require('../models/UserModel'); // 引入用户模型

const APP_ID = 'wx64644819be1ec93a';
const APP_SECRET = 'aeb6c176666f38a2d8b2ebccd0281504';

router.post('/getOpenId', async (req, res) => {

  const { code } = req.body;

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

    if (!user) {
      user = new User({ openid });
      await user.save();
    } else {
      user.lastLogin = new Date(); // 更新上次登录时间
      await user.save();
    }

    // ✅ 只返回前端需要的字段
    res.json({
      userInfo: {
        userId: user._id, 
        isVip: user.isVip
        // vipExpireDate: user.vipExpireDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取 openid 失败' });
  }
});

module.exports = router;