// config/db.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// 默认是微信开发者工具
const env = process.env.NODE_ENV || 'development';

let mongoURI = '';

switch (env) {
    //   微信开发者工具 
  case 'development':
    mongoURI = process.env.DEV_MONGO_URI;
    break;
    //   真机调试
  case 'debug':
    mongoURI = process.env.DEBUG_MONGO_URI;
    break;
    //   线上测试环境
  case 'test':
    mongoURI = process.env.TEST_MONGO_URI;
    break;
    //   线上生产环境
  case 'production':
    mongoURI = process.env.PROD_MONGO_URI;
    break;
  default:
    throw new Error(`❌ 未知环境变量: ${env}`);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`✅ 数据库连接成功，环境：${env}`);
  } catch (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }
};
