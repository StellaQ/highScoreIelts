const prompt_question_selector = `
# 雅思口语题库智能抽取系统

## 系统定位
从结构化题库中自动抽取口语题目，并按标准格式重组输出

## 核心功能要求
1. 必须使用改写后的英文话题名称(topicName_rewrite)
2. 自动生成带"Advanced_2025Q2_"+ 数字的标准题号
3. 输出中英双语内容

## 数据输出规范
\`\`\`json
{
  "mixed_questions": [
    {
      "topicName": "改写后的英文话题名称",
      "topicName_cn": "准确的中文翻译",
      "topicId": "Advanced_2025Q2_t"+数字,
      "points": [
        {
          "qTitle": "改写后的问题要点",
          "qTitle_cn": "准确的中文翻译", 
          "type": 0,
          "from": "rewrite"
        }
      ]
    }
  ]
}
\`\`\`

## 处理规则详解

### 1. 题号生成规则
| 组成部分 | 格式要求 | 示例说明 |
|----------|----------|----------|
| 前缀 | Advanced_ | 固定前缀 |

### 2. 翻译质量标准
1. 话题名称翻译：
   - 保持专业术语统一
   - 符合中文表达习惯，避免生硬直译
2. 问题要点翻译：
   - 准确传达英文原意
   - 使用口语化表达方式

## 质量控制
1. 必填字段验证：
   - 完整的中英文字段
   - 符合规范的题号格式
   - 正确的数据来源标记
2. 异常处理：
   - 自动跳过无效数据并记录日志
   - 确保输出的JSON格式有效性

## 完整示例演示

### 输入数据
\`\`\`json
{
  "ai_questions": [
    {
      "topicName_real": "a person you know who likes to talk a lot",
      "topicName_rewrite": "someone in your life who is particularly talkative",
      "points_original": [
        "who this person is",
        "how you know this person",
        "what this person usually talks about",
        "and explain how you felt about him/her"
      ],
      "points_rewrite": [
        "identify this individual",
        "describe your relationship with them",
        "explain the typical subjects of their conversations",
        "share your personal impressions of this person"
      ]
    }
  ]
}
\`\`\`

### 标准输出(2025年第一季度)
\`\`\`json
{
  "mixed_questions": [
    {
      "topicName": "someone in your life who is particularly talkative",
      "topicName_cn": "你生活中特别健谈的人",
      "topicId": "Advanced_25Q2_t"+数字,
      "points": [
        {
          "qTitle": "identify this individual",
          "qTitle_cn": "说明这个人是谁",
          "type": 0,
          "from": "rewrite"
        },
        {
          "qTitle": "describe your relationship with them",
          "qTitle_cn": "描述你们的关系",
          "type": 0,
          "from": "rewrite"
        },
        {
          "qTitle": "explain the typical subjects of their conversations",
          "qTitle_cn": "说明他们常聊的话题",
          "type": 0,
          "from": "rewrite"
        },
        {
          "qTitle": "share your personal impressions of this person",
          "qTitle_cn": "谈谈你对这个人的印象",
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