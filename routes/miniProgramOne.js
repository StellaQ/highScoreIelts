const express = require('express');
const router = express.Router();
const system_prompt = require('../config/prompts/forPartOne.js');
const { getAIAnswerOne } = require('./aiService.js');  // aiService.js 处理与 AI 的交互
const PartOneAnswer = require('../models/PartOneAnswer'); // 引入 PartOneAnswer 模型
const PartOneTagProcess = require('../models/PartOneTagProcess.js');  // 引入 PartOneTag 模型

router.post('/askAI', async (req, res) => {
  try {
    // 从请求中获取问题文本和答案文本
    const question = req.body.question.qText;
    const answer = `${req.body.question.step0},${req.body.question.step1},${req.body.question.step2},${req.body.question.step3}`;
    const user_prompt = `Question: ${question} Answer: ${answer}`;
    
    // 获取用户 ID 和问题 ID
    const userId = req.body.userId;
    const qId = req.body.question.qId;
    
    // 获取 AI 的答案
    const result = await getAIAnswerOne(system_prompt, user_prompt);
    console.log('Parsed AI Answer:', result);

    // 调用 updateAIAnswer 更新用户答案
    await updateAIAnswer(userId, qId, result.answer);

    // 返回 AI 答案
    res.json(result);

  } catch (error) {
    console.error('Error handling AI request:', error);
    res.status(500).json({ message: 'Error', error });
  }
});

// 2. 更新用户某个问题的 AI 答案
const updateAIAnswer = async (userId, qId, AIanswer) => {
  const updatedAnswer = await PartOneAnswer.findOneAndUpdate(
    { userId, qId },  // 根据 userId 和 qId 查找
    { AIanswer },  // 更新 AIanswer
    { new: true, upsert: true }  // 如果没有找到该记录则插入新记录
  );
  return updatedAnswer;
};

router.get('/getAIAnswers', async (req, res) => {
  try {
    const { userId, ArrQIds } = req.query; // 从查询参数中获取 userId 和 ArrQIds（假设前端传入的是 JSON 字符串）

    if (!userId || !ArrQIds) {
      return res.status(400).json({ message: 'Missing userId or ArrQIds' });
    }

    const qIdsArray = JSON.parse(ArrQIds); // 解析传入的 JSON 字符串

    // 查询数据库，查找 userId 匹配，并且 qId 在 ArrQIds 里的数据
    const answers = await PartOneAnswer.find({
      userId,
      qId: { $in: qIdsArray }
    });

    if (!answers || answers.length === 0) {
      return res.status(404).json({ message: 'No AI answers found for the provided questions' });
    }

    // 只返回 qId 和 AIanswer
    const formattedAnswers = answers.map(({ qId, AIanswer }) => ({ qId, AIanswer }));

    res.json(formattedAnswers);
  } catch (error) {
    console.error('Error fetching AI answers:', error);
    res.status(500).json({ message: 'Error fetching AI answers', error });
  }
});

// 接口1: 获取用户的 tagProcess 数据
router.get('/getTagProcessByUserId', async (req, res) => {
  try {
    const userId = req.query.userId;  // 从查询参数中获取 userId

    // 查找该用户的 tag 数据
    const tags = await PartOneTagProcess.find({ userId });

    // 如果没有找到任何 tag 数据，返回空数组
    if (!tags || tags.length === 0) {
      return res.json([]);  // 返回空数组表示没有找到任何状态改变的 tags
    }

    // 格式化返回数据，提取每个 tag 的 tagId, stage, reviewDate
    const formattedTags = tags.map(tag => ({
      tagId: tag.tagId,
      stage: tag.stage,
      reviewDate: tag.reviewDate
    }));

    // 返回该用户的所有 tag 数据（格式化后的数据）
    res.json(formattedTags);
  } catch (error) {
    console.error('Error fetching user tags:', error);
    res.status(500).json({ message: 'Error fetching user tags', error });
  }
});
// 接口2: 根据 userId 和 tagId 更新或者创建 tag
router.post('/updateTagProcess', async (req, res) => {
  try {
    const { userId, tagId, stage, reviewDate } = req.body;

    // 使用 findOneAndUpdate 来查找并更新现有记录，如果没有找到，则创建新记录
    const updatedTag = await PartOneTagProcess.findOneAndUpdate(
      { userId, tagId },  // 查找根据 userId 和 tagId
      { stage, reviewDate },  // 更新的内容
      { new: true, upsert: true }  // 如果没有找到记录则创建新记录
    );

    // 返回更新后的 tag 数据
    res.json({ message: 'updated or created successfully' });
  } catch (error) {
    console.error('Error updating or creating tag:', error);
    res.status(500).json({ message: 'Error updating or creating tag', error });
  }
});

module.exports = router;