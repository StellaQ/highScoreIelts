const prompt_question_selector = `
# 雅思口语题目处理系统指令

## 核心要求
1. **严格的顺序对应**：
   - 必须保持与 step1_ai_generated_questions.json 中完全相同的话题顺序
   - 每个话题下的问题顺序必须与原文件一一对应
   - 不允许跳过或遗漏任何话题或问题
   - ID的编号必须按照话题和问题的实际顺序递增

2. **翻译处理**：
   - 将 topicName_rewrite 翻译成中文，添加到 topicName_cn
   - 将 qRewrite 翻译成中文，添加到 qTitle_cn

3. **ID生成规则**：
   - 话题ID (topicId)：
     * 前缀：Basic_25Q2_t
     * 编号：从1开始严格按照话题顺序递增（如 Basic_25Q2_t1, Basic_25Q2_t2, ...)
   - 问题ID (qId)：
     * 前缀：Basic_25Q2_q
     * 编号：从1开始严格按照所有问题的顺序递增（如 Basic_25Q2_q1, Basic_25Q2_q2, ...)
     * 问题编号必须连续，不能跳号或重复

## 输出结构
\`\`\`json
{
  "mixed_questions": [{
    "topicName_real": "原话题名称",
    "topicName_rewrite": "改写后话题名称",
    "topicName_cn": "中文话题名称",
    "topicId": "Basic_25Q2_t序号",
    "questions": [
      {
        "qTitle": "原问题",
        "qRewrite": "改写版问题",
        "qTitle_cn": "中文翻译",
        "qId": "Basic_25Q2_q序号"
      }
    ]
  }]
}
\`\`\`

## 翻译标准
1. 保持专业性和准确性
2. 符合中文表达习惯
3. 保留原文的学术性和正式程度
4. 确保问题的核心意图不变

## 示例演示
输入：
\`\`\`json
{
  "ai_questions": [{
    "topicName_real": "Work",
    "topicName_rewrite": "Professional Engagement",
    "questions": [
      {"qTitle": "What's your job?",
      "qRewrite": "Could you elaborate on your current professional role and responsibilities?"}
    ]
  }]
}
\`\`\`

输出：
\`\`\`json
{
  "mixed_questions": [{
    "topicName_real": "Work",
    "topicName_rewrite": "Professional Engagement",
    "topicName_cn": "职业参与",
    "topicId": "Basic_25Q2_t1",
    "questions": [
      {
        "qTitle": "What's your job?",
        "qRewrite": "Could you elaborate on your current professional role and responsibilities?",
        "qTitle_cn": "您能详细描述一下您目前的职业角色和职责吗？",
        "qId": "Basic_25Q2_q1"
      }
    ]
  }]
}
\`\`\`

## 质量验证清单
1. [ ] 话题顺序与 step1_ai_generated_questions.json 完全一致
2. [ ] 每个话题下的问题顺序与原文件一一对应
3. [ ] 所有话题和问题都有对应的ID
4. [ ] 话题ID和问题ID严格按顺序递增，不存在跳号
5. [ ] 中文翻译准确且自然
6. [ ] 保持原文的正式程度
7. [ ] JSON格式完整且有效
8. [ ] 确认没有遗漏任何话题或问题
`;

module.exports = prompt_question_selector;