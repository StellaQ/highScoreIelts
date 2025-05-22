const prompt_topics_selector = `
# 雅思口语题库智能抽取系统

## 系统定位
从结构化题库中自动抽取口语题目，添加ID和中文翻译，并按标准格式重组输出

## 核心功能要求
1. 必须使用改写后的英文话题名称(topicName_rewrite)
2. 自动生成带"Advanced_2025Q2_t"+ 数字的标准题号
3. 自动生成带"Advanced_2025Q2_p"+ 数字的标准问题点ID
4. 输出中英双语内容
5. 保持数据结构完整性

## 数据输出规范
\`\`\`json
{
  "mixed_topics": [
    {
      "topicName_real": "原始英文话题",
      "topicId": "Advanced_2025Q2_t"+数字,
      "topicName_rewrite": "改写后的英文话题",
      "topicName_cn": "中文翻译",
      "points": [
        {
          "point_real": "原始英文问题点",
          "pointId": "Advanced_2025Q2_p"+数字,
          "point_rewrite": "改写后的英文问题点",
          "point_cn": "中文翻译"
        }
      ]
    }
  ]
}
\`\`\`

## 处理规则详解

### 1. ID生成规则
| ID类型 | 格式 | 示例 |
|--------|------|------|
| 话题ID | Advanced_2025Q2_t + 序号 | Advanced_2025Q2_t1 |
| 问题点ID | Advanced_2025Q2_p + 序号 | Advanced_2025Q2_p1 |

### 2. 翻译质量标准
1. 话题名称翻译：
   - 保持专业术语统一
   - 符合中文表达习惯
   - 避免生硬直译
2. 问题要点翻译：
   - 准确传达英文原意
   - 使用自然的中文表达
   - 保持问句形式的一致性

## 完整示例演示

### 输入数据
\`\`\`json
{
  "topicName_real": "an outdoor sport you want to try for the first time",
  "topicName_rewrite": "Describe an outdoor sport you would like to try",
  "points": [
    {
      "point_real": "What it was",
      "point_rewrite": "What is this sport"
    },
    {
      "point_real": "When you first played it",
      "point_rewrite": "When would you like to try it"
    },
    {
      "point_real": "Who you played it with",
      "point_rewrite": "Who would you like to try it with"
    },
    {
      "point_real": "And explain how you felt about it",
      "point_rewrite": "And explain why you want to try this sport"
    }
  ]
}
\`\`\`

### 标准输出
\`\`\`json
{
  "topicName_real": "an outdoor sport you want to try for the first time",
  "topicId": "Advanced_2025Q2_t1",
  "topicName_rewrite": "Describe an outdoor sport you would like to try",
  "topicName_cn": "描述一项你想尝试的户外运动",
  "points": [
    {
      "point_real": "What it was",
      "pointId": "Advanced_2025Q2_p1",
      "point_rewrite": "What is this sport",
      "point_cn": "这是什么运动"
    },
    {
      "point_real": "When you first played it",
      "pointId": "Advanced_2025Q2_p2",
      "point_rewrite": "When would you like to try it",
      "point_cn": "你什么时候想尝试这项运动"
    },
    {
      "point_real": "Who you played it with",
      "pointId": "Advanced_2025Q2_p3",
      "point_rewrite": "Who would you like to try it with",
      "point_cn": "你想和谁一起尝试"
    },
    {
      "point_real": "And explain how you felt about it",
      "pointId": "Advanced_2025Q2_p4",
      "point_rewrite": "And explain why you want to try this sport",
      "point_cn": "解释为什么你想尝试这项运动"
    }
  ]
}
\`\`\`

## 注意事项
1. ID必须按顺序生成，不能重复
2. 中文翻译要准确、自然
3. 保持数据结构的完整性
4. 确保所有必填字段都存在
`;

module.exports = prompt_topics_selector;