const express = require('express');
const router = express.Router();

const AdvancedCategories = require('../models/advancedCategories');
const AdvancedTopics = require('../models/advancedTopics');
const AdvancedRecord = require('../models/advancedRecord');
const User = require('../models/UserModel');

const advanced_system_prompt = require('../prompts/advanced_system_prompt.js');
const { getAIService } = require('../services/aiService.js'); 
const { checkAndDeductPoints } = require('../services/pointsService');
const config = require('../config/configForMiniProgram');

// 获取分类数据的API
router.get('/getAdvancedCategories', async (req, res) => {
  // console.log('getCategories');
  try {
    const categories = await AdvancedCategories.find({});
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    const records = await AdvancedRecord.find({ userId });
    
    const processedCategories = categories.map(category => {
      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryName_cn: category.categoryName_cn,
        topics: category.topicCollection.map(topic => {
          const record = records.find(r => r.topicId === topic.topicId);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (!record) {
            return {
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicName_cn: topic.topicName_cn,
              status: {
                progress: 0,
                practiceCount: 0,
                state: 0
              }
            };
          }

          let lastReviewDate = null;
          let nextReviewDate = null;
          
          if (record.lastReviewDate) {
            lastReviewDate = new Date(record.lastReviewDate);
            lastReviewDate.setHours(0, 0, 0, 0);
          }
          if (record.nextReviewDate) {
            nextReviewDate = new Date(record.nextReviewDate);
            nextReviewDate.setHours(0, 0, 0, 0);
          }

          if (record.isCompleted) {
            return {
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicName_cn: topic.topicName_cn,
              status: {
                progress: 100,
                practiceCount: record.practiceCount || 0,
                state: 4
              }
            };
          } 
          if (lastReviewDate && lastReviewDate.getTime() === today.getTime()) {
            return {
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicName_cn: topic.topicName_cn,
              status: {
                progress: (record.practiceCount || 0) * 10,
                practiceCount: record.practiceCount || 0,
                state: 2
              }
            };
          }
          if (nextReviewDate && nextReviewDate <= today) {
            return {
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicName_cn: topic.topicName_cn,
              status: {
                progress: (record.practiceCount || 0) * 10,
                practiceCount: record.practiceCount || 0,
                state: 1
              }
            };
          }
          if (nextReviewDate && nextReviewDate > today) {
            const gapDays = Math.ceil((nextReviewDate - today) / (1000 * 60 * 60 * 24));
            let gapDate = '';
            
            if (gapDays === 0) {
              gapDate = '明天';
            } else if (gapDays === 1) {
              gapDate = '后天';
            } else {
              gapDate = `${gapDays}天后`;
            }
            
            return {
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicName_cn: topic.topicName_cn,
              status: {
                progress: (record.practiceCount || 0) * 10,
                practiceCount: record.practiceCount || 0,
                state: 3,
                gapDate
              }
            };
          }
          if (!lastReviewDate && !nextReviewDate) {
            return {
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicName_cn: topic.topicName_cn,
              status: {
                progress: 0,
                practiceCount: 0,
                state: 0,
                isDraft: true
              }
            };
          }
          
          return {
            topicId: topic.topicId,
            topicName: topic.topicName,
            topicName_cn: topic.topicName_cn,
            status: {
              progress: 0,
              practiceCount: 0,
              state: 0
            }
          };
        })
      };
    });

    res.json({
      code: 0,
      message: 'success',
      data: {
        categories: processedCategories
      }
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分类失败',
      error: error.message
    });
  }
});

// 获取题目详情
router.get('/getAdvancedDetail', async (req, res) => {
  try {
    const { userId, topicId } = req.query;

    const topic = await AdvancedTopics.findOne({ topicId });
    if (!topic) {
      return res.status(404).json({
        message: '未找到对应的题目数据'
      });
    }

    const record = await AdvancedRecord.findOne(
      { userId, topicId }
    ).lean();
    
    const today = new Date().setHours(0, 0, 0, 0);
    
    const questionsWithAnswerUser = topic.points.map((point, index) => {
      const pointObj = point.toObject();
      delete pointObj._id;
      
      return {
        ...pointObj,
        answerUser: ''
      };
    });

    if (!record) {
      return res.json({
        state: 0,
        topicId,
        questions: questionsWithAnswerUser,
        answer: {
          opening: '',
          body: '',
          closing: ''
        }
      });
    }

    if (!record.lastReviewDate && !record.nextReviewDate) {
      return res.json({
        state: 0,
        topicId,
        questions: questionsWithAnswerUser,
        answer: record.answer,
        isDraft: true
      });
    }

    const nextReviewDate = record.nextReviewDate ? new Date(record.nextReviewDate).setHours(0, 0, 0, 0) : null;
    if (nextReviewDate && nextReviewDate <= today) {
      return res.json({
        state: 1,
        topicId,
        questions: questionsWithAnswerUser,
        answer: record.answer
      });
    }

    return res.status(400).json({
      message: '当前的topic不在今日学习范围内'
    });

  } catch (error) {
    console.error('获取高级详情失败:', error);
    return res.status(500).json({
      message: '服务器错误'
    });
  }
});

// AI定制化答案
router.post('/getAdvancedAI', async (req, res) => {
  try {
    const { userId, question, points } = req.body;
    
    if (!userId || !question || !points) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    // 查询用户的目标分数
    const user = await User.findOne({ userId }, { targetScore: 1 });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 检查并扣除积分
    try {
      await checkAndDeductPoints(userId, config.AI_PART2_POINTS);
    } catch (pointsError) {
      // 如果积分检查失败，直接返回错误
      return res.status(pointsError.code || 400).json({
        success: false,
        code: pointsError.code || 400,
        message: pointsError.message
      });
    }

    // 获取目标分数并替换模板中的占位符
    const targetScore = user.targetScore || 6;
    const system_prompt_with_score = advanced_system_prompt.replace(/\[targetScore\]/g, targetScore.toString());

    // console.log('system_prompt_with_score', system_prompt_with_score);
    // 构建用户提示内容
    const user_prompt = JSON.stringify({
      question: question,
      points: points
    });

    // 调用 AI 服务
    const result = await getAIService(system_prompt_with_score, user_prompt);
    
    res.json({
      success: true,
      data: result,
      pointsDeducted: config.AI_PART2_POINTS
    });
  } catch (error) {
    console.error('获取答案失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取答案失败'
    });
  }
});

// 更新单个答案
router.post('/updateAdvancedAnswer', async (req, res) => {
  try {
    const { userId, topicId, answer } = req.body;
    
    if (!userId || !topicId || !answer) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    const result = await AdvancedRecord.findOneAndUpdate(
      { userId, topicId },
      { 
        $set: { 
          answer: answer,
          updatedAt: new Date()
        }
      },
      { 
        upsert: true,
        new: true
      }
    );
    
    res.json({
      code: 0,
      message: 'success'
    });
    
  } catch (error) {
    console.error('更新答案失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新答案失败',
      error: error.message
    });
  }
});

// 更新复习时间
router.post('/updateAdvancedReviewTime', async (req, res) => {
  try {
    const { userId, topicId, nextReviewDate } = req.body;
    
    if (!userId || !topicId || !nextReviewDate) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updateData = {
      lastReviewDate: today
    };
    
    if (nextReviewDate === 'done') {
      updateData.nextReviewDate = null;
      updateData.isCompleted = true;
    } else {
      const nextDate = new Date(nextReviewDate);
      nextDate.setHours(0, 0, 0, 0);
      updateData.nextReviewDate = nextDate;
      updateData.isCompleted = false;
    }
    
    const result = await AdvancedRecord.findOneAndUpdate(
      { userId, topicId },
      {
        $set: updateData,
        $inc: { practiceCount: 1 }
      },
      { new: true }
    );
    
    res.json({
      code: 0,
      message: 'success'
    });
    
  } catch (error) {
    console.error('更新复习时间失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新复习时间失败',
      error: error.message
    });
  }
});

module.exports = router;