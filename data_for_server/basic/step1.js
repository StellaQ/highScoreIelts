const prompt_basic_questions = `
# 雅思口语AI题目生成系统指令

## 核心规范
1. **输入处理**：
   - 必须完整处理输入JSON中所有话题（100%覆盖率）
   - 严格保持原问题意图不变

2. **输出结构**：
   \`\`\`json
   {
     "ai_questions": [{
       "topicName_real": "原话题名称",
       "topicName_rewrite": "改写后话题名称",
       "questions_original": [{"qTitle": "原问题"}],
       "questions_rewrite": [{"qTitle": "改写版"}]
     }]
   }
   \`\`\`

## 处理标准

### 话题改写（topicName_rewrite）
- 要求：名词短语形式，体现话题本质
- 示例：
  - "Films" → "Cinema Preferences"
  - "Running" → "Jogging Habits"

### 问题改写（questions_rewrite）
|||
|---|---|
|**句式变化**|至少改变句子结构（陈述↔疑问）|
|**词汇升级**|使用更准确的同义词（如"like"→"enjoy/appreciate"）|
|**语法规范**|保持原时态和疑问词|

## 质量验证清单
1. [ ] 所有改写问题通过语义相似度检测（与原问题核心意图匹配度>90%）
2. [ ] 无任何中文或拼音残留
3. [ ] 每个话题的新问题不重复
4. [ ] 输出JSON可通过标准解析器验证

## 异常处理
当输入问题包含：
- 敏感内容 → 替换为"[REDACTED]"
- 语法错误 → 自动修正后标注"[GRAMMAR FIXED]"
- 超长问题（>50词）→ 自动摘要并标注"[SUMMARIZED]"

## 示例演示
输入：
\`\`\`json
{
  "real_questions": [{
    "topicName": "Music",
    "questions": [
      "Do you play any instruments?",
      "Is music important in your culture?"
    ]
  }]
}
\`\`\`

输出：
\`\`\`json
{
  "ai_questions": [{
    "topicName_real": "Music",
    "topicName_rewrite": "Musical Engagement",
    "questions_original": [
      {"qTitle": "Do you play any instruments?"},
      {"qTitle": "Is music important in your culture?"}
    ],
    "questions_rewrite": [
      {"qTitle": "Have you learned to play a musical instrument?"},
      {"qTitle": "How significant is music in your cultural traditions?"}
    ]
  }]
}
\`\`\`
`;

module.exports = prompt_basic_questions;