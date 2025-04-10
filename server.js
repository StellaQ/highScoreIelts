const express = require('express');
const path = require('path');

// 获取当前环境 development debug test production
const env = process.env.NODE_ENV || 'development';
// 根据环境选择配置
const host = process.env[`${env.toUpperCase()}_HOST`] || 'localhost';
const port = process.env[`${env.toUpperCase()}_PORT`] || 3000;

const logger = require('./config/logger');
const morgan = require('morgan');

const cors = require('cors');

const app = express();

import { connectDB } from './config/db.js';
// 连接 MongoDB 数据库
await connectDB(); 

// 启用 CORS 以允许微信小程序访问
app.use(cors());

// 使用 JSON 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'miniprogram')));
// app.use('/admin', express.static(path.join(__dirname, 'vue-admin/dist')));

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);
const basicRoutes = require('./routes/basic');
app.use('/api/basic', basicRoutes);
const expertRoutes = require('./routes/expert');
app.use('/api/expert', expertRoutes);
const advancedRoutes = require('./routes/advanced');
app.use('/api/advanced', advancedRoutes);
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);


// 请求日志
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 全局错误处理
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '发生错误'
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason);
});

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port} in ${env} environment`);
});