const express = require('express');
const router = express.Router();

const BasicCategories = require('../models/basicCategories');
const BasicQuestions = require('../models/basicQuestions');
const BasicRecord = require('../models/basicRecord');

const basic_system_prompt = require('../prompts/basic_system_prompt.js');
const { getAIService } = require('../services/aiService.js'); 

// 获取basic分类数据的API
router.get('/getBasicCategories', async (req, res) => {
  // console.log('getCategories');
  try {
    const categories = await BasicCategories.find({});

    // 按userId去BasicRecord表里查询
    const mockData = [
      {
        topicId: "Basic_2025Q1_t2",
        status: {
          progress: 10,
          practiceCount: 1,
          state: 1
        }
      },
      {
        topicId: "Basic_2025Q1_t4",
        status: {
          progress: 20,
          practiceCount: 2,
          state: 2
        }
      },
      {
        topicId: "Basic_2025Q1_t16",
        status: {
          progress: 30,
          practiceCount: 3,
          state: 3,
          gapDate: '明天'
          // gapDays: 0：'明天'
          // gapDays: 1：'后天'
          // gapDays: 2：'2天后'
          // gapDays: 3：'3天后'
        }
      },
      {
        topicId: "Basic_2025Q1_t7",
        status: {
          progress: 100,
          practiceCount: 4,
          state: 4
        }
      }
    ]
    // 0:new   progress: 0
    // 1:today-review
    // 2:today-done
    // 3:the-other-day-review : gapDays
    // 4:completed  progress: 100

    // 处理数据，添加额外的状态信息
    const processedCategories = categories.map(category => {
      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryName_cn: category.categoryName_cn,
        topics: category.topicCollection.map(topic => {
          // 查找是否在mockData中存在匹配的topicId
          const matchedTopic = mockData.find(mockTopic => mockTopic.topicId === topic.topicId);
          return {
            topicId: topic.topicId,
            topicName: topic.topicName,
            topicName_cn: topic.topicName_cn,
            // 如果找到匹配的topic，使用其status，否则使用默认status
            status: matchedTopic ? matchedTopic.status : {
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
    console.error('Error reading categories:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

// 按userId和topicId获取basic detail
router.get('/getBasicDetail', async (req, res) => {
  // console.log('getBasicDetail');
  try {
    const { userId, topicId } = req.query;
    // console.log(userId, topicId);

    // 从数据库查询题目
    const topic = await BasicQuestions.findOne({ topicId });
    if (!topic) {
      return res.status(404).json({
        message: '未找到对应的题目数据'
      });
    }

    // 查找用户学习记录
    const record = await BasicRecord.findOne({ userId, topicId });
    const today = new Date().setHours(0, 0, 0, 0);

    // 如果记录不存在 done
    if (!record) {
      return res.json({
        state: 0,
        topicId,
        questions: topic.questions.map((question, index) => ({
          ...question.toObject(),  // 将 Mongoose 文档转换为普通对象
          answerUser: '',
          choice: '',
          answerAI: '' 
        }))
      });
    }

    // 处理问题数据，添加用户答案
    const questionsWithAnswers = topic.questions.map((question, index) => ({
      ...question.toObject(),
      answerUser: '',
      choice: '',
      answerAI: record?.answers?.[index] || ''
    }));
    // 如果有记录但没有设置复习时间（草稿状态）
    if (!record.lastReviewDate && !record.nextReviewDate) {
      return res.json({
        state: 0,
        topicId,
        questions: questionsWithAnswers,
        isDraft: true  // 添加一个标记，表示这是草稿状态
      });
    }

    // 判断是否今天复习过
    const lastReviewDate = record.lastReviewDate ? new Date(record.lastReviewDate).setHours(0, 0, 0, 0) : null;
    if (lastReviewDate === today) {
      return res.json({
        state: 2,
        topicId,
        questions: questionsWithAnswers,
        nextReviewDate: record.nextReviewDate
      });
    }

    // 判断今天是否需要复习
    const nextReviewDate = record.nextReviewDate ? new Date(record.nextReviewDate).setHours(0, 0, 0, 0) : null;
    if (nextReviewDate && nextReviewDate <= today) {
      return res.json({
        state: 1,
        topicId,
        questions: questionsWithAnswers
      });
    }

    // 其他情况
    return res.status(400).json({
      message: '当前不需要复习'
    });

  } catch (error) {
    console.error('获取基础详情失败:', error);
    return res.status(500).json({
      message: '服务器错误'
    });
  }
});

// AI定制化答案
router.post('/getBasicAI', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!question) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    const user_prompt = `Question: ${question} Answer: ${answer}`;
    const result = await getAIService(basic_system_prompt, user_prompt);
    
    // console.log('Parsed AI Answer:', result);
    // 返回 AI 答案
    res.json(result);

  } catch (error) {
    console.error('AI评分失败:', error);
    res.status(500).json({
      code: 500,
      message: 'AI评分失败',
      error: error.message
    });
  }
});

// 更新单个答案
router.post('/updateBasicAnswer', async (req, res) => {
  try {
    const { userId, topicId, index, answer } = req.body;
    
    if (!userId || !topicId || index === undefined || !answer) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    // 更新单个答案
    const result = await BasicRecord.findOneAndUpdate(
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
      // data: result
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

module.exports = router;