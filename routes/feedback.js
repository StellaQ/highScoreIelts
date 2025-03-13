const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Feedback } = require('../models/feedback');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成安全的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件！'));
    }
  }
});

// 上传图片
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer 错误处理
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件大小不能超过5MB' });
      }
      return res.status(400).json({ message: '文件上传错误', error: err.message });
    } else if (err) {
      // 其他错误
      return res.status(500).json({ message: '上传失败', error: err.message });
    }

    // 检查文件是否存在
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }

    // 返回文件URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
});

// 提交反馈
router.post('/submit', async (req, res) => {
  try {
    const { content, images } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '反馈内容不能为空' });
    }

    const feedback = new Feedback({
      content,
      images,
      createdAt: new Date()
    });

    await feedback.save();
    res.json({ message: '反馈提交成功' });
  } catch (error) {
    res.status(500).json({ message: '提交失败', error: error.message });
  }
});

module.exports = router; 