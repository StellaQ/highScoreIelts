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
    BASE_URL: 'https://test-api.dds.com'
  },
  // 生产环境
  PROD: {
    BASE_URL: 'https://api.hlts.com'
  }
};

// 根据当前环境选择配置
const getEnvConfig = () => {
  let env = 'develop'
  switch (env) {
    case 'develop':
      return ENV.DEV;
    case 'debug':
      return ENV.DEBUG;
    case 'test':
      return ENV.TEST;
    case 'prod':
      return ENV.PROD;
    default:
      return ENV.DEV;
  }
};

export const config = getEnvConfig(); 