module.exports = {
    app: {
      port: process.env.PORT || 80, // 生产环境可能使用标准的 HTTP 端口
    },
    db: {
      uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/highScoreIelts_prod', // 生产环境的数据库
    },
  };
  