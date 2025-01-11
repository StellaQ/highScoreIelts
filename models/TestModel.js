const mongoose = require('mongoose');

// 定义 Schema
const TestSchema = new mongoose.Schema({
  name: String
});

// 创建并导出模型
const TestModel = mongoose.model('Test', TestSchema);

module.exports = TestModel;
