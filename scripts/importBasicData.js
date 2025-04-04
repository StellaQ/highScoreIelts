const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const BasicQuestions = require('../models/basicQuestions');
const BasicCategories = require('../models/basicCategories');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/highScoreIelts_dev');

async function importBasicData() {
  try {
    // 1:导入分类数据
    const categoriesPath = path.join(__dirname, '../data_for_server/archive/basic/categories.json');
    const categoriesData = await fs.readFile(categoriesPath, 'utf8');
    const { mixed_categories } = JSON.parse(categoriesData);

    // 先清空集合
    await BasicCategories.deleteMany({});
    console.log('已清空BasicCategories集合');

    // 批量插入分类数据
    const categoryResult = await BasicCategories.insertMany(mixed_categories);
    console.log(`分类数据导入成功，共导入 ${categoryResult.length} 条记录`);

    // 2:导入题目数据
    const questionsPath = path.join(__dirname, '../data_for_server/archive/basic/questions.json');
    const questionsData = await fs.readFile(questionsPath, 'utf8');
    const { mixed_questions } = JSON.parse(questionsData);

    // 先清空集合
    await BasicQuestions.deleteMany({});
    console.log('已清空BasicQuestions集合');

    // 批量插入题目数据
    const questionResult = await BasicQuestions.insertMany(mixed_questions);
    console.log(`题目数据导入成功，共导入 ${questionResult.length} 条记录`);

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
importBasicData(); 