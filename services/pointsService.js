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

    if (user.points < requiredPoints) {
      throw {
        code: 400,
        message: `积分不足，需要${requiredPoints}分，当前只有${user.points}分`
      };
    }

    // 扣除积分
    user.points -= requiredPoints;
    await user.save();

    return {
      success: true,
      points: user.points,
      pointsDeducted: requiredPoints
    };
  } catch (err) {
    throw {
      code: err.code || 500,
      message: err.message || '积分扣除失败'
    };
  }
};

module.exports = { checkAndDeductPoints };