const User = require('../models/UserModel');
const { CURRENT_BATCH } = require('../config/configForMiniProgram');

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
    const isSeasonCardVip = user.vipType === 1 && user.vipBatch === CURRENT_BATCH;
    const isYearCardVip = user.vipType === 2 && user.vipExpireDate && new Date(user.vipExpireDate) > new Date();
    
    if (isSeasonCardVip || isYearCardVip) {
      return {
        success: true,
        message: isSeasonCardVip ? '季卡VIP用户无需扣除积分' : '年卡VIP用户无需扣除积分'
      };
    }

    if (user.points < requiredPoints) {
      throw { 
        code: 400,
        message: '积分不足，请前往公众号查看获取方式'
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