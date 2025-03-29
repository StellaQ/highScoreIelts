const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 获取分类数据的API
router.get('/getCategories', async (req, res) => {
  console.log('getCategories');
  try {
    // 读取categories.json文件
    const categoriesPath = path.join(__dirname, '../data_for_server/archive/basic/categories.json');
    const categoriesData = await fs.readFile(categoriesPath, 'utf8');
    const categories = JSON.parse(categoriesData);

    // 处理数据，添加额外的状态信息
    const processedCategories = categories.mixed_categories.map(category => {
      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryNameInChinese: category.categoryNameInChinese,
        topics: category.topicCollection.map(topic => ({
          topicId: topic.topicId,
          topicName: topic.topicName,
          topicName_cn: topic.topicName_cn,
          // 添加默认的学习状态
          status: {
            progress: 30,
            practiceCount: 4,
            // lastReviewTime: null,
            // nextReviewTime: null,
            state: 0,
            // 0 new
            // 1 today-review
            // 2 today-done
            // 3 the-other-day-review
            // 4 completed
          }
        }))
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

module.exports = router;