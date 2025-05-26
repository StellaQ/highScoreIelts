// 环境配置
const ENV = {
  // 微信开发者工具环境
  DEV: {
    BASE_URL: 'http://localhost:3001'
  },
  // 真机调试环境
  DEBUG: {
    BASE_URL: 'http://192.168.31.185:3001'  // 替换为您的本地IP地址
  },
  // 测试环境
  TEST: {
    BASE_URL: 'https://test.xiaoshuspeaking.site'
  },
  // 生产环境
  PROD: {
    BASE_URL: 'https://www.xiaoshuspeaking.site'
  }
};

// 根据当前环境选择配置
const getEnvConfig = () => {
  const { envVersion } = wx.getAccountInfoSync().miniProgram;
  console.log(envVersion);
  // let env = 'release'
  switch (envVersion) {
    case 'develop':
      return ENV.DEV;
    // case 'debug':
      // return ENV.DEBUG;
    case 'trial':
      return ENV.TEST;
    case 'release':
      return ENV.PROD;
    default:
      return ENV.DEV;
  }
};

export const config = getEnvConfig();
export const BASE_URL = config.BASE_URL;

export const baiduConfig = {
  apiKey: 'Spkt9kI8LlfdQBM0AqrLc4qg',
  secretKey: '8DunxvxwTbvWD1h0JoXhVLfrdQS3aZV7'
} 