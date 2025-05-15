/**
 * 检查用户是否是有效的VIP会员
 * @param {Date|string|null} vipExpireDate - VIP过期时间
 * @returns {boolean} - 是否是有效的VIP会员
 */
function isValidVip(vipExpireDate) {
  if (!vipExpireDate) {
    return false;
  }
  
  const now = new Date();
  const expireDate = new Date(vipExpireDate);
  
  // 检查是否是有效的日期
  if (isNaN(expireDate.getTime())) {
    return false;
  }
  
  return expireDate.getTime() > now.getTime();
}

module.exports = {
  isValidVip
}; 