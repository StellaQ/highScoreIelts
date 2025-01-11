// for vue-admin

const express = require('express');
const router = express.Router();
const categoriesOneRoutes = require('../models/CategoriesOneModel'); 

router.get('/', async (req, res) => {
  try {
    const categories = await categoriesOneRoutes.find().sort({ sequence: 1 });
    res.json(categories);
  } catch (error) {
    console.error('错误详情:', error); // 打印详细错误信息
    res.status(500).json({ message: '获取分类失败', error });
  }
});

module.exports = router;