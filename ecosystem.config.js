module.exports = {
    apps: [{
      name: 'littlehamsterspeaking',
      script: 'server.js',
      instances: 'max',  // 根据 CPU 核心数自动设置实例数
      exec_mode: 'cluster',  // 使用集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: 'logs/err.log',  // 错误日志
      out_file: 'logs/out.log',    // 输出日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '1G',    // 内存超过 1G 自动重启
      watch: false,                // 生产环境不监听文件变化
      merge_logs: true
    }]
  }

 