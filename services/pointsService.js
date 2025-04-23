const User = require('../models/UserModel');

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
    const isVip = user.vipExpireDate && new Date(user.vipExpireDate) > new Date();
    if (isVip) {
      return {
        success: true,
        message: 'VIP用户无需扣除积分'
      };
    }

    if (user.points < requiredPoints) {
      throw {
        code: 400,
        message: '积分不足'
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

module.exports = { checkAndDeductPoints };