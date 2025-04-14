const prompt_question_selector = `
# 雅思口语题抽取系统指令

## 核心任务
从处理后的题库中抽取题目并重组，严格遵循以下规则：
1. 使用改写后英文话题名称(topicName_rewrite)
2. topicId前加上"Basic_"前缀
3. 包含中英文双语输出
4. 合理混合改写问题和新问题

## 输出规范
\`\`\`json
{
  "mixed_questions": [
    {
      "topicName": "改写后英文话题名称",
      "topicName_cn": "准确的中文翻译",
      "topicId": "Basic_topicId",
      "questions": [
        {
          "qTitle": "英文问题文本",
          "qTitle_cn": "准确的中文翻译", 
          "type": 0,
          "from": "rewrite"
        }
      ]
    }
  ]
}
\`\`\`

## 处理规则

### 1. ID生成规则
| 组件 | 格式 | 示例 |
|------|------|------|
| 前缀 | Basic_ | Basic_ 

### 2. 问题选取规则
| 类型 | 数量 | 位置 | 选择方式 |
|------|------|------|----------|
| 改写问题 | 全部 | 保持原序 | 按原始顺序 

### 3. 翻译要求
1. 话题名称翻译：
   - 保持专业性和一致性
   - 避免直译，使用自然的中文表达
2. 问题翻译：
   - 准确传达原意
   - 符合中文口语习惯

## 质量规范
1. 必须包含：
   - 完整的双语字段
   - 正确的ID格式
   - 准确的问题来源标记
2. 禁止：
   - 使用原始问题(questions_original)
   - 重复或遗漏问题
3. 错误处理：
   - 无效数据跳过并记录
   - 保持JSON结构有效性

## 示例演示
输入数据：
\`\`\`json
{
  "ai_questions": [
    {
      "topicName_real": "Work",
      "topicName_rewrite": "Professional Life",
      "topicId": "B0_topic1",
      "questions_original": [],
      "questions_rewrite": [
        {"qTitle": "What do you like about city living?"},
        {"qTitle": "How is urban life different from rural life?"}
      ]
    }
  ]
}
\`\`\`

标准输出：
\`\`\`json
{
  "mixed_questions": [
    {
      "topicName": "Professional Life",
      "topicName_cn": "",
      "topicId": "Basic_B0_topic1",
      "questions": [
        {
          "qTitle": "What do you like about city living?",
          "qTitle_cn": "你喜欢城市生活的哪些方面？",
          "type": 0,
          "from": "rewrite"
        },
        {
          "qTitle": "How is urban life different from rural life?",
          "qTitle_cn": "城市生活和乡村生活有什么不同？",
          "type": 0,
          "from": "rewrite"
        }
      ]
    }
  ]
}
\`\`\`
`;

module.exports = prompt_question_selector;