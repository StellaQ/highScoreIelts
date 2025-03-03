const express = require('express');
const axios = require('axios');
const router = express.Router();

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

    // 查询数据库（如果有用户表）
    // let user = await User.findOne({ openid });

    // if (!user) {
    //   user = new User({ openid, createdAt: new Date() });
    //   await user.save();
    // }

    res.json({ openid, session_key });
  } catch (error) {
    res.status(500).json({ error: '获取 openid 失败' });
  }
});

module.exports = router;
