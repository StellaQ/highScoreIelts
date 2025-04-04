const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const BasicQuestions = require('../models/basicQuestions');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/highScoreIelts_dev');

async function importBasicQuestions() {
  try {
    // 读取questions.json文件
    const questionsPath = path.join(__dirname, '../data_for_server/archive/basic/questions.json');
    const questionsData = await fs.readFile(questionsPath, 'utf8');
    const { mixed_questions } = JSON.parse(questionsData);

    // 先清空集合
    await BasicQuestions.deleteMany({});
    console.log('已清空BasicQuestions集合');

    // 批量插入数据
    const result = await BasicQuestions.insertMany(mixed_questions);
    console.log(`题目数据导入成功，共导入 ${result.length} 条记录`);

    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('导入失败:', error);
    // 确保在出错时也关闭数据库连接
    await mongoose.connection.close();
  }
}

// 运行导入函数
importBasicQuestions(); 