// 使用 Express 设置后端路由
const express = require('express');
const router = express.Router();

const system_prompt = require('./../config/prompts/forPartOne.js')
const { getAIAnswer } = require('./aiService');  // aiService.js 处理与 AI 的交互

router.post('/askAI', async (req, res) => {
    try {
        // Question: "Do you know how to play any musical instruments?"
        // Answer: "Yes, I know a bit of piano. I started learning it recently and can play some simple tunes. I’m still a beginner, but I’m practicing regularly to improve my skills, and I enjoy it a lot."
        let question = req.body.question.qText;
        let answer = req.body.question.step0 + req.body.question.step1 + req.body.question.step2 + req.body.question.step3;
        let user_prompt = "Question: " + question + "Answer: " + answer;
        console.log(user_prompt);
        const result = await getAIAnswer(system_prompt, user_prompt);
        console.log('Parsed AI Answer:', result);
        res.json(result);
      } catch (error) {
        console.error('Error handling AI request:', error);
        res.status(500).json({ message: 'error', error });
      };
});

module.exports = router;
