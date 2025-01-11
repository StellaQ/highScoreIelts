const express = require('express');
const TestModel = require('../models/TestModel');

// 创建路由实例
const router = express.Router();

// 定义一个路由来获取数据库数据
router.get('/data', async (req, res) => {
  try {
    const data = await TestModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 定义一个路由来插入数据（仅作为示例）
router.post('/data', async (req, res) => {
  try {
    const newData = new TestModel(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
