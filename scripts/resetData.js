const mongoose = require('mongoose');
require('dotenv').config();  // 加载环境变量

const { connectDB } = require('../config/db');
const config = require('../config/configForMiniProgram');
const BasicRecord = require('../models/basicRecord');
const AdvancedRecord = require('../models/advancedRecord');
const ExpertRecord = require('../models/expertRecord');

async function resetData() {
  try {
    // 连接数据库
    await connectDB();
    console.log('数据库连接成功');

    const previousBatch = config.PREVIOUS_BATCH;
    console.log(`开始重置批次 ${previousBatch} 的数据...`);

    // 构建正则表达式来匹配topicId
    const regex = new RegExp(`_${previousBatch}_`);

    // 更新三个记录表
    const updatePromises = [
        BasicRecord.updateMany(
          { 
            $and: [
              { topicId: { $regex: regex } },
              { isCompleted: true }
            ]
          },
          {
            $set: {
              isCompleted: false,
              practiceCount: 0,
              lastReviewDate: null,
              nextReviewDate: null,
              updatedAt: new Date()
            }
          }
        ),
        AdvancedRecord.updateMany(
          { 
            $and: [
              { topicId: { $regex: regex } },
              { isCompleted: true }
            ]
          },
          {
            $set: {
              isCompleted: false,
              practiceCount: 0,
              lastReviewDate: null,
              nextReviewDate: null,
              updatedAt: new Date()
            }
          }
        ),
        ExpertRecord.updateMany(
          { 
            $and: [
              { topicId: { $regex: regex } },
              { isCompleted: true }
            ]
          },
          {
            $set: {
              isCompleted: false,
              practiceCount: 0,
              lastReviewDate: null,
              nextReviewDate: null,
              updatedAt: new Date()
            }
          }
        )
      ];

    const results = await Promise.all(updatePromises);
    
    console.log('重置完成，更新结果：');
    console.log('BasicRecord:', results[0]);
    console.log('AdvancedRecord:', results[1]);
    console.log('ExpertRecord:', results[2]);

  } catch (error) {
    console.error('重置数据失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 执行重置
resetData();
