const express = require('express');
const router = express.Router();

const ExpertCategories = require('../models/expertCategories');
const ExpertQuestions = require('../models/expertQuestions');
const ExpertRecord = require('../models/expertRecord');

const expert_system_prompt = require('../prompts/expert_system_prompt.js');
const { getAIService } = require('../services/aiService.js'); 

// 获取分类列表
router.get('/getExpertCategories', async (req, res) => {
  try {
    const categories = await ExpertCategories.find({});
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    const records = await ExpertRecord.find({ userId });
    
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
router.get('/getExpertDetail', async (req, res) => {
  try {
    const { userId, topicId } = req.query;

    const topic = await ExpertQuestions.findOne({ topicId });
    if (!topic) {
      return res.status(404).json({
        message: '未找到对应的题目数据'
      });
    }

    const record = await ExpertRecord.findOne(
      { userId, topicId }
    ).lean();
    
    const today = new Date().setHours(0, 0, 0, 0);
    
    if (!record) {
      return res.json({
        state: 0,
        topicId,
        questions: topic.questions.map((question, index) => ({
          ...question.toObject(),
          answerUser: '',
          answerAI: '' 
        }))
      });
    }

    const questionsWithAnswers = topic.questions.map((question, index) => {
      const questionObj = question.toObject();
      delete questionObj._id;
      
      return {
        ...questionObj,
        answerUser: '',
        answerAI: record?.answers?.[index] || ''
      };
    });

    if (!record.lastReviewDate && !record.nextReviewDate) {
      return res.json({
        state: 0,
        topicId,
        questions: questionsWithAnswers,
        isDraft: true
      });
    }

    const nextReviewDate = record.nextReviewDate ? new Date(record.nextReviewDate).setHours(0, 0, 0, 0) : null;
    if (nextReviewDate && nextReviewDate <= today) {
      return res.json({
        state: 1,
        topicId,
        questions: questionsWithAnswers
      });
    }

    return res.status(400).json({
      message: '当前的topic不在今日学习范围内'
    });

  } catch (error) {
    console.error('获取专家详情失败:', error);
    return res.status(500).json({
      message: '服务器错误'
    });
  }
});

// AI定制化答案
router.post('/getExpertAI', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!question) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    const user_prompt = `Question: ${question} Answer: ${answer}`;
    const result = await getAIService(expert_system_prompt, user_prompt);
    
    res.json(result);

  } catch (error) {
    console.error('AI定制答案失败:', error);
    res.status(500).json({
      code: 500,
      message: 'AI定制答案失败',
      error: error.message
    });
  }
});

// 更新单个答案
router.post('/updateExpertAnswer', async (req, res) => {
  try {
    const { userId, topicId, index, answer } = req.body;
    
    if (!userId || !topicId || index === undefined || !answer) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    const result = await ExpertRecord.findOneAndUpdate(
      { userId, topicId },
      { 
        $set: { 
          [`answers.${index}`]: answer
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
router.post('/updateExpertReviewTime', async (req, res) => {
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
    
    const result = await ExpertRecord.findOneAndUpdate(
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