// 使用 Express 设置后端路由
const express = require('express');
const router = express.Router();

// 假设你已经有一个 AI 请求函数
const { getAIAnswer } = require('./aiService');  // aiService.js 处理与 AI 的交互

router.post('/askAI', async (req, res) => {
  const { question, userData } = req.body;

  try {
    // 调用 AI 接口
    const aiResponse = await getAIAnswer(question, userData);

    // 返回 AI 的回答
    res.json({ answer: aiResponse });
  } catch (error) {
    res.status(500).json({ error: 'AI请求失败', message: error.message });
  }
});

module.exports = router;
