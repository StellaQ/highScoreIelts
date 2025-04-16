const express = require('express');
const router = express.Router();
const config = require('../config/configForMiniProgram');

// 检查更新状态
router.get('/checkUpdate', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        showUpdateAlert: config.showUpdateAlert,
        updateTip: config.updateTip
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 