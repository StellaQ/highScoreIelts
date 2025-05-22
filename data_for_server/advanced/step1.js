const prompt_basic_topics = `
# IELTS口语Part 2考题改写系统

## 核心原则
1. 严格保持原意(最重要):
   - 改写必须完全保持原题的核心含义
   - 每个要点的问题方向必须与原题完全一致
   - 确保考生理解和回答方向不变

2. 合理改写:
   - 适当使用同义词替换
   - 自然调整句式结构
   - 避免生硬或过度修饰

3. 避免抄袭:
   - 灵活改变表达方式
   - 保持表达的自然性
   - 符合考试风格

## 输入数据
来自step0_real_topics.json的原始考题,格式如下：
\`\`\`
Describe a person you know who enjoys dressing well.
You should say:
Who the person is
What job/studies the person does
What sort of clothes the person wears
And explain why you think this person enjoys dressing well.
\`\`\`

## 输出格式
JSON格式,包含原始内容和改写内容：
\`\`\`json
{
  "topicName_real": "原始题目主题",
  "topicName_rewrite": "改写后的主题(保持原意)",
  "points": [
    {
      "point_real": "原始要点",
      "point_rewrite": "改写后的要点(自然的同义表达)"
    }
  ]
}
\`\`\`

## 改写指南

### 1. 主题改写原则
- 基本要求：完整保留原意,自然改写
- 改写方法：
  - 使用合适的同义词替换
  - 调整语序保持自然
  - 确保表达清晰易懂
- 示例：
  原题："a person who enjoys dressing well"
  改写："someone who takes pride in their appearance"
  说明：使用自然的同义表达，保持原意不变

### 2. 要点改写原则
1. **改写策略**：
   - 选用适当的同义词
   - 保持表达自然流畅
   - 确保易于理解

2. **表达参考**：
   |原始表达|改写参考|
   |---|---|
   |tell about|describe, explain|
   |what you did|your activities|
   |why you like|reasons for liking|
   |how you felt|your feelings about|

3. **改写示例**：
   原始要点："What sort of clothes the person wears"
   改写："The type of clothing they choose"
   说明：通过自然的同义表达保持原意

## 质量检查清单
1. 原意检查(最重要)：
   - [ ] 改写后的含义与原题完全一致
   - [ ] 问题指向保持不变
   - [ ] 考生容易理解

2. 表达检查：
   - [ ] 用词自然恰当
   - [ ] 句式流畅清晰
   - [ ] 避免生硬表达

## 实际示例
输入：
\`\`\`
Describe a person you know who enjoys dressing well.
You should say:
Who the person is
What job/studies the person does
What sort of clothes the person wears
And explain why you think this person enjoys dressing well.
\`\`\`

输出：
\`\`\`json
{
  "topicName_real": "a person you know who enjoys dressing well",
  "topicName_rewrite": "someone who takes pride in their appearance",
  "points": [
    {
      "point_real": "Who the person is",
      "point_rewrite": "Tell me about this person"
    },
    {
      "point_real": "What job/studies the person does",
      "point_rewrite": "Their occupation or field of study"
    },
    {
      "point_real": "What sort of clothes the person wears",
      "point_rewrite": "The type of clothing they choose"
    },
    {
      "point_real": "And explain why you think this person enjoys dressing well",
      "point_rewrite": "Why do you think they care about their appearance"
    }
  ]
}
\`\`\`

## 改写注意事项
1. 必做事项：
   - 确保原意不变
   - 使用自然的表达
   - 保持易于理解
   - 避免重复原文

2. 禁止事项：
   - 不改变问题的核心含义
   - 不使用不自然的表达
   - 不过度修饰
   - 不偏离原意

3. 特殊情况处理：
   - 遇到简单表达：使用自然的同义词
   - 遇到复杂表达：适当简化但保持原意
   - 遇到重复表达：灵活变换但不改变含义
`;

module.exports = prompt_basic_topics;