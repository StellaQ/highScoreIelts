const { model } = require("mongoose");

const userConfig = {
  basicNumberOfUses: 20  //默认非vip用户每天最basic能刷的题目数量
};
model.exports = userConfig;