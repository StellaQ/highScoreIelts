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

// 连接 MongoDB 数据库
mongoose.connect(uri)
.then(() => {
console.log('Connected to the database');
})
.catch((error) => {
console.error('Database connection error:', error);
});

// 引用路由
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes');
// 使用 /api/test 作为 testRoutes 的基础路径
app.use('/api/test', testRoutes);
// 使用 /api/users 作为 userRoutes 的基础路径
app.use('/api/users', userRoutes);
// 你在 testRoutes.js 中定义的 /data 路由，将会被挂载到 /api/test/data 路径，
// 而 userRoutes.js 中定义的 /users 路由，将会被挂载到 /api/users/ 路径。

const part1Routes = require('./routes/partOne');
app.use('/api/partone', part1Routes);

const tagRoutes = require('./routes/tagRoutes');
app.use('/api/tag', tagRoutes);

const categoriesOneRoutes = require('./routes/categoriesOneRoutes');
app.use('/api/categories1', categoriesOneRoutes);

const miniProgramRoutes = require('./routes/miniProgram');
app.use('/api/miniprogram', miniProgramRoutes);

// 提供静态文件服务
app.use(express.static(path.join(__dirname, 'miniprogram')));
app.use('/admin', express.static(path.join(__dirname, 'vue-admin/dist')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
