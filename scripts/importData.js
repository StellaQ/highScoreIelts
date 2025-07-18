const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();  // 加载环境变量
const { connectDB } = require('../config/db');  // 引入数据库连接配置

const fs = require('fs');

// 导入所有模型
const BasicCategories = require('../models/basicCategories');
const BasicTopics = require('../models/basicTopics');
const AdvancedCategories = require('../models/advancedCategories');
const AdvancedTopics = require('../models/advancedTopics');
const ExpertCategories = require('../models/expertCategories');
const ExpertTopics = require('../models/expertTopics');

// 数据文件路径
const dataFiles = {
  1: {
    topics: '../data_for_server/archive/basic/topics.json',
    categories: '../data_for_server/archive/basic/categories.json',
    model: {
      topics: BasicTopics,
      categories: BasicCategories
    }
  },
  2: {
    topics: '../data_for_server/archive/advanced/topics.json',
    categories: '../data_for_server/archive/advanced/categories.json',
    model: {
      topics: AdvancedTopics,
      categories: AdvancedCategories
    }
  },
  3: {
    topics: '../data_for_server/archive/expert/topics.json',
    categories: '../data_for_server/archive/expert/categories.json',
    model: {
      topics: ExpertTopics,
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
    // 读取主题数据
    const topicsData = JSON.parse(fs.readFileSync(path.join(__dirname, file.topics), 'utf8'));
    console.log('读取到的主题数据结构:', Object.keys(topicsData));
    
    // 读取分类数据
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, file.categories), 'utf8'));

    // 清空集合
    await file.model.topics.deleteMany({});
    await file.model.categories.deleteMany({});

    // 确保数据结构正确
    if (!topicsData || !Array.isArray(topicsData.mixed_topics)) {
      throw new Error('主题数据格式不正确，期望包含 mixed_topics 数组');
    }

    // 根据模型名称判断数据类型并进行相应的转换
    let formattedTopics;
    if (file.model.topics.modelName === 'BasicTopics') {
      // Basic 数据转换逻辑
      formattedTopics = topicsData.mixed_topics.map(topic => ({
        topicName_real: topic.topicName_real,
        topicName_rewrite: topic.topicName_rewrite,
        topicName_cn: topic.topicName_cn,
        topicId: topic.topicId,
        questions: topic.questions.map(q => ({
          qTitle: q.qTitle,
          qRewrite: q.qRewrite,
          qTitle_cn: q.qTitle_cn,
          qId: q.qId
        }))
      }));
    } else if (file.model.topics.modelName === 'AdvancedTopics') {
      // Advanced 数据转换逻辑
      formattedTopics = topicsData.mixed_topics.map(topic => ({
        topicName_real: topic.topicName_real,
        topicName_rewrite: topic.topicName_rewrite,
        topicName_cn: topic.topicName_cn,
        topicId: topic.topicId,
        points: topic.points.map(p => ({
          point_real: p.point_real,
          pointId: p.pointId,
          point_rewrite: p.point_rewrite,
          point_cn: p.point_cn
        }))
      }));
    } else if (file.model.topics.modelName === 'ExpertTopics') {
      // Expert 数据转换逻辑
      formattedTopics = topicsData.mixed_topics.map(topic => ({
        topicName: topic.topicName,
        topicName_cn: topic.topicName_cn,
        topicId: topic.topicId,
        questions: topic.questions.map(q => ({
          question_original: q.question_original,
          question_rewrite: q.question_rewrite,
          question_cn: q.question_cn,
          questionId: q.questionId
        }))
      }));
    } else {
      throw new Error(`未知的数据类型: ${file.model.topics.modelName}`);
    }

    // 插入主题数据
    const topicsResult = await file.model.topics.insertMany(formattedTopics);
    console.log(`导入 ${file.model.topics.modelName} 成功，共 ${topicsResult.length} 条记录`);

    // 插入分类数据
    const categoriesResult = await file.model.categories.insertMany(categoriesData.mixed_categories);
    console.log(`导入 ${file.model.categories.modelName} 成功，共 ${categoriesResult.length} 条记录`);
  } catch (error) {
    console.error(`导入 ${file.model.topics.modelName} 或 ${file.model.categories.modelName} 失败:`, error);
    // 打印详细错误信息
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`字段 ${key} 错误:`, error.errors[key].message);
      });
    }
    // 如果是文件读取或解析错误，打印更多信息
    if (error instanceof SyntaxError) {
      console.error('JSON解析错误，请检查文件格式是否正确');
    }
    if (error.code === 'ENOENT') {
      console.error('文件不存在，请检查文件路径:', path.join(__dirname, file.topics));
    }
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