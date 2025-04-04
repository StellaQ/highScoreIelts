const express = require('express');
const router = express.Router();
const BasicUser = require('../models/basicUser');
const BasicCategories = require('../models/basicCategories');
const BasicQuestions = require('../models/basicQuestions');

// 获取basic分类数据的API
router.get('/getBasicCategories', async (req, res) => {
  // console.log('getCategories');
  try {
    const categories = await BasicCategories.find({});

    // 按userId去BasicUser表里查询
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

// 按userId和topicId获取basic的某个topic detail
router.get('/getBasicDetail', async (req, res) => {
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
    const record = await BasicUser.findOne({ userId, topicId });
    const today = new Date().setHours(0, 0, 0, 0);

    // 如果记录不存在
    if (!record) {
      return res.json({
        state: 0,
        topicId,
        questions: topic.questions
      });
    }

    // 判断是否今天复习过
    const lastReviewDate = record.lastReviewDate ? new Date(record.lastReviewDate).setHours(0, 0, 0, 0) : null;
    if (lastReviewDate === today) {
      return res.json({
        state: 2,
        topicId,
        questions: topic.questions,
        answers: record.answers,
        nextReviewDate: record.nextReviewDate
      });
    }

    // 判断今天是否需要复习
    const nextReviewDate = record.nextReviewDate ? new Date(record.nextReviewDate).setHours(0, 0, 0, 0) : null;
    if (nextReviewDate && nextReviewDate <= today) {
      return res.json({
        state: 1,
        topicId,
        questions: topic.questions,
        answers: record.answers
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

module.exports = router;