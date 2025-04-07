const express = require('express');
const router = express.Router();

const BasicCategories = require('../models/basicCategories');
const BasicQuestions = require('../models/basicQuestions');
const BasicRecord = require('../models/basicRecord');

const basic_system_prompt = require('../prompts/basic_system_prompt.js');
const { getAIService } = require('../services/aiService.js'); 

// 获取分类列表
router.get('/getBasicCategories', async (req, res) => {
  try {
    const categories = await BasicCategories.find({});
    const { userId } = req.query;  // 从 req.query 中获取 userId
    
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    // 获取所有topic的记录
    const records = await BasicRecord.find({ userId });
    
    const processedCategories = categories.map(category => {
      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryName_cn: category.categoryName_cn,
        topics: category.topicCollection.map(topic => {

          const record = records.find(r => r.topicId === topic.topicId);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // 如果没有记录，返回默认状态
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

          // 初始化日期变量
          let lastReviewDate = null;
          let nextReviewDate = null;
          
          // 如果存在记录，初始化日期
          if (record.lastReviewDate) {
            lastReviewDate = new Date(record.lastReviewDate);
            lastReviewDate.setHours(0, 0, 0, 0);
          }
          if (record.nextReviewDate) {
            nextReviewDate = new Date(record.nextReviewDate);
            nextReviewDate.setHours(0, 0, 0, 0);
          }

          // 1. 判断已完成
          if (record.isCompleted) {
            // console.log(topic.topicId + '=======判断已完成');
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
          // 2. 判断今天已复习
          if (lastReviewDate && lastReviewDate.getTime() === today.getTime()) {
            // console.log(topic.topicId + '=======今天已复习');
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
          // 3. 判断今天需要复习
          if (nextReviewDate && nextReviewDate <= today) {
            // console.log(topic.topicId + '=======今天需要复习');
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
          // 4. 判断草稿状态
          if (!lastReviewDate && !nextReviewDate) {
            // console.log(topic.topicId + '=======判断是草稿');
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
          // 5. 判断不是今天复习
          if (nextReviewDate) {
            // console.log(topic.topicId + '=======判断后面几天复习');
            
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
          
          // 如果所有条件都不满足，返回默认状态
          // console.log(topic.topicId + '=======所有条件都不满足,配置默认status');
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

// 按userId和topicId获取basic detail
router.get('/getBasicDetail', async (req, res) => {
  // console.log('getBasicDetail');
  try {
    const { userId, topicId } = req.query;
    // console.log(userId, topicId);

    // 从数据库查询题目
    const topic = await BasicQuestions.findOne({ topicId });
    // console.log('topic', topic);
    if (!topic) {
      return res.status(404).json({
        message: '未找到对应的题目数据'
      });
    }

    // 查找用户学习记录
    const record = await BasicRecord.findOne(
      { userId, topicId }
    ).lean();  // 使用lean()返回普通JavaScript对象
    
    // console.log('record', record);
    // console.log('record.answers', record?.answers);
    // console.log('record.answers type', typeof record?.answers);
    
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
    const questionsWithAnswers = topic.questions.map((question, index) => {
      // 将Mongoose文档转换为普通对象，并排除_id字段
      const questionObj = question.toObject();
      delete questionObj._id;
      
      return {
        ...questionObj,
        answerUser: '',
        choice: '',
        answerAI: record?.answers?.[index] || ''  // 从record.answers中获取对应的AI答案
      };
    });
    // console.log('questionsWithAnswers', questionsWithAnswers);

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
    if (lastReviewDate === today && !record.isCompleted) {
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
      message: '当前的topic不在今日学习范围内'
    });

  } catch (error) {
    console.error('获取基础详情失败:', error);
    return res.status(500).json({
      message: '服务器错误'
    });
  }
});

// AI定制化答案 done
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
    console.error('AI定制答案失败:', error);
    res.status(500).json({
      code: 500,
      message: 'AI定制答案失败',
      error: error.message
    });
  }
});

// 更新单个答案 done
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

// 更新复习时间
router.post('/updateBasicReviewTime', async (req, res) => {
  try {
    const { userId, topicId, nextReviewDate } = req.body;
    
    if (!userId || !topicId || !nextReviewDate) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    // 使用本地时间
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // 设置为本地时间的 00:00:00
    
    // 构建更新对象
    const updateData = {
      lastReviewDate: today  // 设置最后复习时间为今天
    };
    
    // 根据nextReviewDate的值设置不同的状态
    if (nextReviewDate === 'done') {
      // 设置为已完成状态
      updateData.nextReviewDate = null;
      updateData.isCompleted = true;  // 标记为已完成
    } else {
      // 设置下次复习时间，使用本地时间
      const nextDate = new Date(nextReviewDate);
      nextDate.setHours(0, 0, 0, 0);
      updateData.nextReviewDate = nextDate;
      updateData.isCompleted = false;  // 确保不是已完成状态
    }
    
    // 更新记录，practiceCount 的 $inc 操作符需要放在 $set 之外
    const result = await BasicRecord.findOneAndUpdate(
      { userId, topicId },
      {
        $set: updateData,
        $inc: { practiceCount: 1 }  // 练习次数加1
      },
      { new: true }
    );
    
    res.json({
      code: 0,
      message: 'success'
      // data: result
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