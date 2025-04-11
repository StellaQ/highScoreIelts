const mongoose = require('mongoose');

// 默认是微信开发者工具
const env = process.env.NODE_ENV || 'development';

let mongoURI = '';

switch (env) {
  // 微信开发者工具
  case 'development':
    mongoURI = process.env.DEV_MONGO_URI;
    break;
  // 真机调试
  case 'debug':
    mongoURI = process.env.DEBUG_MONGO_URI;
    break;
  // 线上测试环境
  case 'test':
    mongoURI = process.env.TEST_MONGO_URI;
    break;
  // 线上生产环境
  case 'production':
    mongoURI = process.env.PROD_MONGO_URI;
    break;
  default:
    throw new Error(`❌ 未知环境变量: ${env}`);
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);

    // 从 mongoURI 中提取主机和数据库名
    // const uriParts = mongoURI.split('/');
    // const host = uriParts[2].split('@').pop() || uriParts[2]; // 处理带认证和不带认证的情况
    // const dbName = uriParts[uriParts.length - 1].split('?')[0];
    // console.log(`✅ 数据库连接成功，环境：${env}，主机：${host}，数据库：${dbName}`);
    console.log(`✅ 数据库连接成功，环境${env}`);
  } catch (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }
};

module.exports = { connectDB };
