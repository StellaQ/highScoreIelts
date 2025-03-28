const prompt_question_selector = `
# 雅思口语题抽取系统指令

## 核心任务
从处理后的题库中抽取题目，按照以下规则重组：
1. 每个话题(topic)只保留改写后名称(topicName_rewrite)
2. 每个话题下包含4-5个问题，组合规则：
   - 必选：3-4个改写问题(questions_rewrite)
   - 必选：1-2个新增问题(questions_new)
   - 禁止：包含原始问题(questions_original)

## 输出格式要求
\`\`\`json
{
  "questions": [
    {
      "topicName": "改写后话题名称",
      "topicId": "当前年份+季度+'_t'+从上往下顺序1、2、3、4",
      "questions": [
        {"qTitle": "问题文本", "from": "rewrite"},
        {"qTitle": "问题文本", "from": "new"}
      ]
    }
  ]
}
\`\`\`

## 抽取规则
|||
|---|---|
|**改写问题**|从questions_rewrite中随机选取3-4题|
|**新增问题**|从questions_new中随机选取1-2题|
|**混合比例**|每个topic至少包含1题from:"new"|
|**去重机制**|确保不重复选取同一题库的相同问题|

## 质量规范
1. 每个topic的问题总数控制在4-5题
2. 保持问题多样性（避免相同题型的连续出现）
3. 新增问题(from:"new")必须占20%-30%

## 示例演示
输入数据：
\`\`\`json
{
  "ai_questions": [{
    "topicName_real": "Chatting",
    "topicName_rewrite": "Conversation",
    "questions_rewrite": [
      {"qTitle": "How frequent are your social conversations?"},
      {"qTitle": "Which communication mode do you prefer: in-person or digital?"},
      {"qTitle": "Which do you favor: group discussions or one-on-one talks?"},
      {"qTitle": "How common are conversational conflicts in your friendships?"}
    ],
    "questions_new": [
      {"qTitle": "How has digital communication changed conversation dynamics?"},
      {"qTitle": "What makes for truly meaningful dialogue?"}
    ]
  }]
}
\`\`\`

标准输出：
\`\`\`json
{
  "questions": [
    {
      "topicName": "Conversation",
      "topicId": "2025Q1_t1",
      "questions": [
        {"qTitle": "How frequent are your social conversations?", "from": "rewrite"},
        {"qTitle": "Which communication mode do you prefer: in-person or digital?", "from": "rewrite"},
        {"qTitle": "How has digital communication changed conversation dynamics?", "from": "new"},
        {"qTitle": "Which do you favor: group discussions or one-on-one talks?", "from": "rewrite"}
      ]
    }
  ]
}
\`\`\`
`;

module.exports = prompt_question_selector;