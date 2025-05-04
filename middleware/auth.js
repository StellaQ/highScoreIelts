const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 后端请求只负责验证 token
const authMiddleware = (req, res, next) => {
  // 从请求头获取token
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证token'
    });
  }

  try {
    // 只验证token，不存储用户信息
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'token无效或已过期'
    });
  }
};

module.exports = authMiddleware; 