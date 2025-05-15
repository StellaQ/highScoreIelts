const User = require('../models/UserModel');
const { isValidVip } = require('../utils/vipUtils');

// 检查并扣除积分
const checkAndDeductPoints = async (userId, requiredPoints) => {
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      throw {
        code: 404,
        message: '用户不存在'
      };
    }

    // 检查用户是否是VIP
    const isVip = isValidVip(user.vipExpireDate);
    
    if (isVip) {
      return {
        success: true,
        message: '会员有效期内无限调用AI'
      };
    }

    if (user.points < requiredPoints) {
      throw { 
        code: 400,
        message: '积分不足呢...'
      };
    }

    // 扣除积分
    user.points -= requiredPoints;
    await user.save();

    return {
      success: true,
      message: '积分扣除成功'
    };
  } catch (err) {
    throw {
      code: err.code || 500,
      message: err.message || 'pointsService处理失败'
    };
  }
};

module.exports = {
  checkAndDeductPoints
};