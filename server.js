const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const config = require('config');
const port = config.get('app.port');
const uri = config.get('db.uri');

const cors = require('cors');

const app = express();

// 启用 CORS 以允许微信小程序访问
app.use(cors());

// 使用 JSON 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'miniprogram')));
// app.use('/admin', express.static(path.join(__dirname, 'vue-admin/dist')));

// 连接 MongoDB 数据库
mongoose.connect(uri)
.then(() => {
console.log('Connected to the database');
})
.catch((error) => {
console.error('Database connection error:', error);
});

// 引用路由
const miniProgramOneRoutes = require('./routes/miniProgramOne');
app.use('/api/miniprogramOne', miniProgramOneRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);
const basicRoutes = require('./routes/basic');
app.use('/api/basic', basicRoutes);

const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
