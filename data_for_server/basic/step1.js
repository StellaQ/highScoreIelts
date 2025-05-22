const prompt_basic_topics = `
# 雅思口语AI题目生成系统指令

## 核心规范
1. **输入处理**：
   - 必须完整处理输入JSON中所有话题（100%覆盖率）
   - 严格保持原问题意图不变
   - 确保改写后的问题符合雅思考试风格

2. **输出结构**：
   \`\`\`json
   {
     "ai_topics": [{
       "topicName_real": "原话题名称",
       "topicName_rewrite": "改写后话题名称",
       "questions": [
        {"qTitle": "原问题",
        "qRewrite": "改写版"},
        {"qTitle": "原问题",
        "qRewrite": "改写版"}
       ]
     }]
   }
   \`\`\`

## 处理标准

### 话题改写（topicName_rewrite）
- 要求：名词短语形式，体现话题本质
- 示例：
  - "Films" → "Cinema Preferences" / "Motion Picture Experience"
  - "Running" → "Jogging Habits" / "Exercise Routines"
  - "Food" → "Culinary Preferences" / "Dietary Choices"
  - "Reading" → "Literary Interests" / "Reading Engagement"
  - "Travel" → "Travel Experiences" / "Journey Reflections"

### 问题改写（qRewrite）
1. **句式变化策略**：
   - 陈述句 ↔ 疑问句
   - 简单问句 → 复合问句
   - Yes/No问题 → 开放式问题
   - 示例：
     - "Do you like reading?" → "What aspects of reading do you find most engaging?"
     - "Is this important?" → "Could you explain the significance of this in your life?"

2. **词汇升级对照表**：
   |基础词汇|进阶表达|
   |---|---|
   |like|enjoy, appreciate, take pleasure in|
   |important|significant, crucial, essential|
   |good|beneficial, advantageous, worthwhile|
   |interesting|fascinating, captivating, intriguing|
   |often|frequently, regularly, consistently|
   |think|believe, consider, reckon|

3. **问题类型改写模板**：
   - 频率类：
     - "How often..." → "What is the frequency of..."
     - "Do you usually..." → "To what extent do you regularly..."
   - 偏好类：
     - "Do you prefer..." → "What draws you towards..."
     - "Which do you like..." → "What factors influence your choice of..."
   - 原因类：
     - "Why do you..." → "What motivates you to..."
     - "What's the reason..." → "Could you elaborate on the factors that..."
   - 描述类：
     - "What is it like..." → "How would you characterize..."
     - "Can you describe..." → "Could you paint a picture of..."

4. **口语考试常用表达替换**：
   - "Can you tell me..." → "Would you mind sharing..."
   - "What do you think about..." → "How do you perceive..."
   - "Is there anything..." → "Are there any particular aspects..."
   - "Do you remember..." → "Could you recall a time when..."

## 质量验证清单
1. [ ] 所有改写问题通过语义相似度检测（与原问题核心意图匹配度>90%）
2. [ ] 无任何中文或拼音残留
3. [ ] 每个话题的新问题不重复
4. [ ] 输出JSON可通过标准解析器验证
5. [ ] 改写后的问题符合雅思口语考试风格
6. [ ] 词汇等级符合雅思7分以上水平
7. [ ] 问题长度适中（15-30个词为宜）

## 异常处理
当输入问题包含：
- 敏感内容 → 替换为"[REDACTED]"
- 语法错误 → 自动修正后标注"[GRAMMAR FIXED]"
- 超长问题（>50词）→ 自动摘要并标注"[SUMMARIZED]"
- 过于口语化 → 提升为正式表达并标注"[FORMALIZED]"

## 示例演示
输入：
\`\`\`json
{
  "real_topics": [{
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
  "ai_topics": [{
    "topicName_real": "Music",
    "topicName_rewrite": "Musical Engagement",
    "questions": [
      {"qTitle": "Do you play any instruments?",
      "qRewrite": "Have you ever taken the opportunity to learn a musical instrument?"},
      {"qTitle": "Is music important in your culture?",
      "qRewrite": "In what ways does music play a significant role in your cultural heritage?"}
    ]
  }]
}
\`\`\`
`;

module.exports = prompt_basic_topics;