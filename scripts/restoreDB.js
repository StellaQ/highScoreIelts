const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('../config/db');

async function restoreDatabase(backupPath) {
  try {
    // 检查备份文件是否存在
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }

    // 从环境变量获取数据库连接信息
    const env = process.env.NODE_ENV || 'development';
    const mongoURI = process.env[`${env.toUpperCase()}_MONGO_URI`];

    if (!mongoURI) {
      throw new Error('未找到数据库连接信息');
    }

    // 执行恢复命令
    const command = `mongorestore --uri="${mongoURI}" --drop "${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`恢复失败: ${error}`);
        return;
      }
      console.log(`恢复成功，从备份: ${backupPath}`);
      console.log(`stdout: ${stdout}`);
      if (stderr) console.log(`stderr: ${stderr}`);
    });

  } catch (error) {
    console.error('恢复过程中发生错误:', error);
  }
}

// 检查是否提供了备份路径参数
if (process.argv.length < 3) {
  console.error('请提供备份路径作为参数');
  console.error('用法: node restoreDB.js <备份路径>');
  process.exit(1);
}

// 执行恢复
restoreDatabase(process.argv[2]);