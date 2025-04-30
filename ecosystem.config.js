module.exports = {
  apps: [{
    name: 'xiaoshuspeaking-api',
    script: 'server.js',

    // 1. 集群模式，充分利用多核 CPU
    exec_mode: 'cluster',
    // 2. 实例数设为 max，自动开到和 CPU 核数一致
    instances: 'max',

    // 3. 内存超限自动重启，防止单进程内存泄漏
    max_memory_restart: '1G',

    // 4. 两次重启之间的延迟（毫秒），避免短时间内无限重启
    restart_delay: 5000,

    // 5. 日志合并，所有实例的日志写到同一文件，方便集中查看
    merge_logs: true,
    error_file: 'logs/err.log',
    out_file:   'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',

    // 6. 当进程响应 HTTP ‘ready’ 事件后才算启动完成，可配合应用发起 ready 事件来实现零停机重载
    // wait_ready: true,
    // listen_timeout: 80000,

    // 这里用 env，因为我们要在生产状态下也加载 .env
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
