const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 获取分类数据的API
router.get('/getCategories', async (req, res) => {
  // console.log('getCategories');
  try {
    // 读取categories.json文件
    const categoriesPath = path.join(__dirname, '../data_for_server/archive/advanced/categories.json');
    const categoriesData = await fs.readFile(categoriesPath, 'utf8');
    const categories = JSON.parse(categoriesData);

    // 按userId去expert表里查询
    const mockData = [
      {
        topicId: "Advanced_2025Q1_t1",
        status: {
          progress: 10,
          practiceCount: 1,
          state: 1
        }
      },
      {
        topicId: "Advanced_2025Q1_t2",
        status: {
          progress: 20,
          practiceCount: 2,
          state: 2
        }
      },
      {
        topicId: "Advanced_2025Q1_t3",
        status: {
          progress: 30,
          practiceCount: 3,
          state: 3,
          gapDate: '明天'
          // gapDays: 0：‘明天’
          // gapDays: 1：‘后天’
          // gapDays: 2：‘2天后'
          // gapDays: 3：‘3天后’
        }
      },
      {
        topicId: "Advanced_2025Q1_t4",
        status: {
          progress: 100,
          practiceCount: 4,
          state: 4
        }
      }
    ]
    // 0:new  progress: 0
    // 1:today-review
    // 2:today-done
    // 3:the-other-day-review : gapDays
    // 4:completed progress: 100

    // 处理数据，添加额外的状态信息
    const processedCategories = categories.mixed_categories.map(category => {
      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryNameInChinese: category.categoryNameInChinese,
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

module.exports = router;