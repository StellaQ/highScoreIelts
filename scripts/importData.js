const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();  // 加载环境变量
const { connectDB } = require('../config/db');  // 引入数据库连接配置

const fs = require('fs');

// 导入所有模型
const BasicCategories = require('../models/basicCategories');
const BasicQuestions = require('../models/basicQuestions');
const AdvancedCategories = require('../models/advancedCategories');
const AdvancedQuestions = require('../models/advancedQuestions');
const ExpertCategories = require('../models/expertCategories');
const ExpertQuestions = require('../models/expertQuestions');

// 数据文件路径
const dataFiles = {
  1: {
    questions: '../data_for_server/archive/basic/questions.json',
    categories: '../data_for_server/archive/basic/categories.json',
    model: {
      questions: BasicQuestions,
      categories: BasicCategories
    }
  },
  2: {
    questions: '../data_for_server/archive/advanced/questions.json',
    categories: '../data_for_server/archive/advanced/categories.json',
    model: {
      questions: AdvancedQuestions,
      categories: AdvancedCategories
    }
  },
  3: {
    questions: '../data_for_server/archive/expert/questions.json',
    categories: '../data_for_server/archive/expert/categories.json',
    model: {
      questions: ExpertQuestions,
      categories: ExpertCategories
    }
  }
};

async function importData(fileNumber) {
  try {
    // 使用统一的数据库连接函数
    await connectDB();
    console.log('数据库连接成功');

    // 如果指定了文件编号，只导入该文件
    if (fileNumber) {
      const file = dataFiles[fileNumber];
      if (!file) {
        throw new Error('无效的文件编号');
      }
      await importFile(file);
    } else {
      // 否则导入所有文件
      for (const file of Object.values(dataFiles)) {
        await importFile(file);
      }
    }

    console.log('数据导入完成');
  } catch (error) {
    console.error('数据导入失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
  }
}

async function importFile(file) {
  try {
    // 读取问题数据
    const questionsData = JSON.parse(fs.readFileSync(path.join(__dirname, file.questions), 'utf8'));
    // 读取分类数据
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, file.categories), 'utf8'));

    // 清空集合
    await file.model.questions.deleteMany({});
    await file.model.categories.deleteMany({});

    // 插入问题数据
    const questionsResult = await file.model.questions.insertMany(questionsData.mixed_questions);
    console.log(`导入 ${file.model.questions.modelName} 成功，共 ${questionsResult.length} 条记录`);

    // 插入分类数据
    const categoriesResult = await file.model.categories.insertMany(categoriesData.mixed_categories);
    console.log(`导入 ${file.model.categories.modelName} 成功，共 ${categoriesResult.length} 条记录`);
  } catch (error) {
    console.error(`导入 ${file.model.questions.modelName} 或 ${file.model.categories.modelName} 失败:`, error);
  }
}

// 获取命令行参数
const fileNumber = process.argv[2] ? parseInt(process.argv[2]) : null;

// 执行导入
importData(fileNumber); 

// 导入数据命令说明：
// 1. 导入所有数据
// npm run import:dev    # 开发环境
// npm run import:test   # 测试环境
// npm run import:prod   # 生产环境
// 2. 导入指定文件
// npm run import:dev 1  # 开发环境导入 basic 数据
// npm run import:dev 2  # 开发环境导入 advanced 数据
// npm run import:dev 3  # 开发环境导入 expert 数据