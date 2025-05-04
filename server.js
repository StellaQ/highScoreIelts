require('dotenv').config();  

const express = require('express');
const path = require('path');
const logger = require('./config/logger');
const morgan = require('morgan');
const cors = require('cors');

const authMiddleware = require('./middleware/auth');

const { connectDB } = require('./config/db');

// 获取当前环境 development/debug/test/production
const env = process.env.NODE_ENV || 'development';
const host = process.env[`${env.toUpperCase()}_HOST`] || 'localhost';
const port = process.env[`${env.toUpperCase()}_PORT`] || 3001;

const app = express();

(async () => {
  try {
    // 连接数据库
    await connectDB();

    // 中间件和路由
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use('/static', express.static(path.join(__dirname, 'static')));

    // 路由模块
    // 先注册不需要验证的路由
    const { router: userRouter, getOpenId } = require('./routes/user');
    app.post('/api/user/getOpenId', getOpenId);
    app.use('/api/index', require('./routes/index'));
    // 再注册需要验证的路由
    app.use('/api/user', authMiddleware, userRouter);
    app.use('/api/basic', authMiddleware, require('./routes/basic'));
    app.use('/api/advanced', authMiddleware, require('./routes/advanced'));
    app.use('/api/expert', authMiddleware, require('./routes/expert'));
    app.use('/api/qiniu', authMiddleware, require('./routes/qiniu'));
    // app.use('/api/feedback', require('./routes/feedback'));

    // 日志
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));

    // 错误处理
    app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(500).json({
        error: '服务器内部错误',
        message: env === 'development' ? err.message : '发生错误'
      });
    });

    // 未捕获异常和 Promise 拒绝
    process.on('uncaughtException', (err) => {
      logger.error('未捕获的异常:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的 Promise 拒绝:', reason);
    });

    // 启动服务
    app.listen(port, host, () => {
      console.log(`✅ Server is running at http://${host}:${port} in ${env} environment`);
    });

  } catch (err) {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  }
})();
