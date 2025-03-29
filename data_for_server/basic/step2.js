const prompt_question_selector = `
# 雅思口语题抽取系统指令

## 核心任务
从处理后的题库中抽取题目并重组，严格遵循以下规则：
1. 使用改写后英文话题名称(topicName_rewrite)
2. 自动生成带"Basic_"前缀的topicId
3. 包含中英文双语输出
4. 合理混合改写问题和新问题

## 输出规范
\`\`\`json
{
  "questions": [
    {
      "topicName": "改写后英文话题名称",
      "topicName_cn": "准确的中文翻译",
      "topicId": "Basic_YYYYQX_tN (X=季度，N=顺序号)",
      "questions": [
        {
          "qTitle": "英文问题文本",
          "qTitle_cn": "准确的中文翻译", 
          "type": 0,
          "from": "rewrite/new"
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
| 前缀 | Basic_ | Basic_ |
| 年份 | YYYY | 2025 |
| 季度 | Q1-Q4 | Q1(1-3月) |
| 顺序号 | _t+N | _t1 |

### 2. 问题选取规则
| 类型 | 数量 | 位置 | 选择方式 |
|------|------|------|----------|
| 改写问题 | 全部 | 保持原序 | 按原始顺序 |
| 新增问题 | 1题 | 随机插入 | 随机2选1 |

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
      "topicName_rewrite": "Urban Life",
      "questions_rewrite": [
        {"qTitle": "What do you like about city living?"},
        {"qTitle": "How is urban life different from rural life?"}
      ],
      "questions_new": [
        {"qTitle": "What are the biggest challenges of urbanization?"},
        {"qTitle": "How can cities become more livable?"}
      ]
    }
  ]
}
\`\`\`

标准输出(2025年Q1季度)：
\`\`\`json
{
  "questions": [
    {
      "topicName": "Urban Life",
      "topicName_cn": "城市生活",
      "topicId": "Basic_2025Q1_t1",
      "questions": [
        {
          "qTitle": "What do you like about city living?",
          "qTitle_cn": "你喜欢城市生活的哪些方面？",
          "type": 0,
          "from": "rewrite"
        },
        {
          "qTitle": "How can cities become more livable?",
          "qTitle_cn": "城市如何才能变得更宜居？",
          "type": 0,
          "from": "new" 
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