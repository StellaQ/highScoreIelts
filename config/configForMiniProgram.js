module.exports = {
    SIGN_IN_POINTS: 10, // 有用：每次签到获得的积分
    INVITE_POINTS: 20,  // 有用：邀请奖励积分
    AI_PART1_POINTS: 10, // 有用：调用AI扣分数
    AI_PART2_POINTS: 20, // 有用：调用AI扣分数
    AI_PART3_POINTS: 10, // 有用：调用AI扣分数
    // 题目批次配置
    CURRENT_BATCH: 'B0',  // 有用：当前批次，如 B1, B2, B3...
    CURRENT_BATCH_EXPIRE_DATE: '2025-08-31', // 有用：当前批次过期时间
    PREVIOUS_BATCH: '2025Q1',  // 上一批次
    // 题库更新时间
    QUESTION_BANK_UPDATE_DATE: '2025-04-15',
    showUpdateAlert: true,  // 有用：是否显示更新提示
    updateTip: "5月-8月" // 有用：更新提示内容
  };