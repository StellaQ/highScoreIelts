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
    BASE_URL: 'https://test-api.highscoreielts.com'
  },
  // 生产环境
  PROD: {
    BASE_URL: 'https://api.highscoreielts.com'
  }
};

// 根据当前环境选择配置
const getEnvConfig = () => {
  // 判断是否在微信开发者工具中
  const isDevTools = __wxConfig.envVersion === 'develop';
  // 判断是否在真机调试中
  const isDebug = __wxConfig.envVersion === 'trial';
  // 判断是否在生产环境中
  const isProd = __wxConfig.envVersion === 'release';

  if (isDevTools) {
    return ENV.DEV;
  } else if (isDebug) {
    return ENV.DEBUG;
  } else if (isProd) {
    return ENV.PROD;
  } else {
    return ENV.TEST;
  }
};

export const config = getEnvConfig(); 