// partOne.js

const express = require('express');
const router = express.Router();
const PartOne = require('../models/PartOne'); // 假设你的 Mongoose 模型叫 PartOne
const { v4: uuidv4 } = require('uuid'); // 使用 UUID 生成唯一的 questionId

// vue-admin POST 请求
router.post('/saveQuestions', async (req, res) => {
    try {
        // 清空数据
        await PartOne.deleteMany({});

        const questionsArray = req.body;

        // 检查是否接收到请求数据
        // console.log('Received data:', questionsArray);

        // 遍历每个 tag 对应的问题数组
        for (let item of questionsArray) {
            const tag = item.tag;
            const questions = item.questions;

            // 遍历每个问题，将它们存入数据库
            for (let questionText of questions) {
                const newQuestion = new PartOne({
                    tag: tag,
                    text: questionText,
                    questionId: uuidv4(), // 生成唯一的 questionId
                    info: null // 先占位，后面会加入 info 字段的支持
                });

                await newQuestion.save();
            }
        }
        res.status(200).json({ message: 'Questions saved successfully!' });
    } catch (error) {
        // 打印详细错误信息
        // console.error('Error saving questions:', error);
        res.status(500).json({ error: 'Failed to save questions', details: error.message });
    }
});

// vue-admin GET 请求: 查询表中的所有数据并格式化
// [
//   {
//       "tag": "Where you live（New）",
//       "questions": [
//           "How long have you lived in the house or apartment you’re living in now?",
//           "What do you like about this house or apartment?",
//           "What kind of home would you like to live in in the future?"
//       ]
//   },
//   {
//       "tag": "Work and Study（New）",
//       "questions": [
//           "What work do you do?",
//           "How easy is it to get this kind of work in your country?",
//           "How important is it to you to have work that you enjoy doing?"
//       ]
//   },
//   {
//       "tag": "Hometown",
//       "questions": [
//           "Do you come from a city, town or village?",
//           "What do you like about your home city/town/village?",
//           "Is your home city/town/village a good place for young people?"
//       ]
//   }
// ]
router.get('/getQuestionsForAdmin', async (req, res) => {
  try {
      // 查询part1表中的所有数据
      const questionsData = await PartOne.find();

      // 创建一个对象，用于按 tag 分组
      const groupedQuestions = {};

      // 遍历所有的问题数据，将它们按 tag 进行分组
      questionsData.forEach(question => {
          if (!groupedQuestions[question.tag]) {
              groupedQuestions[question.tag] = [];
          }
          groupedQuestions[question.tag].push(question.text);
      });

      // 将分组数据转换为你想要的格式
      const result = Object.keys(groupedQuestions).map(tag => ({
          tag: tag,
          questions: groupedQuestions[tag]
      }));

      // 返回结果
      res.status(200).json(result);
  } catch (error) {
      // console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});

// 小程序 GET 请求: 获取问题并返回带有 questionId 和 text 的格式
// [
//   {
//       "tag": "Where you live（New）",
//       "questions": [
//         {"questionId": , "text": ''},
//         {"questionId": , "text": ''},
//         {"questionId": , "text": ''}
//       ]
//   },
//   {
//       "tag": "Work and Study（New）",
//       "questions": [
//         {"questionId": , "text": ''},
//         {"questionId": , "text": ''},
//         {"questionId": , "text": ''}
//       ]
//   },
//   {
//       "tag": "Hometown",
//       "questions": [
//         {"questionId": , "text": ''},
//         {"questionId": , "text": ''},
//         {"questionId": , "text": ''}
//       ]
//   }
// ]
router.get('/getQuestionsForMiniApp', async (req, res) => {
  try {
      // 查询part1表中的所有数据
      const questionsData = await PartOne.find();

      // 创建一个对象，用于按tag分组
      const groupedQuestions = {};

      // 遍历问题数据，按tag分组，并构建返回的数据结构
      questionsData.forEach(question => {
          if (!groupedQuestions[question.tag]) {
              groupedQuestions[question.tag] = [];
          }

          // 将每个问题的questionId和text存入对应的tag中
          groupedQuestions[question.tag].push({
              questionId: question.questionId,
              text: question.text
          });
      });

      // 将分组数据转换为前端需要的格式
      const result = Object.keys(groupedQuestions).map(tag => ({
          tag: tag,
          questions: groupedQuestions[tag]
      }));

      // 返回结果
      res.status(200).json(result);
  } catch (error) {
      // console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});
module.exports = router;

