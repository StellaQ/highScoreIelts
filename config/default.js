module.exports = {
    app: {
      port: process.env.PORT || 3001,
    },
    db: {
      uri: process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/highScoreIelts',
    },
  };


// config 包会根据 NODE_ENV 环境变量的值，自动加载对应的配置文件。
// 如果没有设置 NODE_ENV，它会默认加载 config/default.js。

// 当 NODE_ENV=development 时，config 会加载 default.js 和 development.js。
// 当 NODE_ENV=production 时，config 会加载 default.js 和 production.js。
// 当 NODE_ENV=test 时，config 会加载 default.js 和 test.js。
  