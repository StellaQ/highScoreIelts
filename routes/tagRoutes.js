// for vue-admin

const express = require('express');
const router = express.Router();
const tagRoutes = require('../models/TagModel'); 

router.get('/', async (req, res) => {
  try {
      const result = await tagRoutes.find();

      // 返回结果
      res.status(200).json(result);
  } catch (error) {
      // console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});

module.exports = router;