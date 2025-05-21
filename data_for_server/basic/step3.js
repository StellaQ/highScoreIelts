const prompt_question_selector = `
# 任务目标
将提供的IELTS口语话题(topics)根据语义相关性智能分配到预定义的分类(categories)中。

# 输入数据
1. mixed_questions数组：包含多个话题(topic)及其详细信息
   - topicName_real: 原始话题名
   - topicName_rewrite: 改写后的话题名
   - topicName_cn: 话题中文名
   - topicId: 话题唯一标识
   - questions: 该话题下的问题列表

2. categories数组：预定义的分类体系
   - categoryName: 分类英文名
   - categoryName_cn: 分类中文名
   - description: 分类描述

# 处理规则
1. 语义匹配原则
   - 仔细分析每个topic的语义内容
   - 将topic分配到最匹配的category
   - 考虑topic的问题内容以确保分类准确性

2. 分配限制
   - 每个topic必须且只能分配到一个category
   - 不能遗漏任何topic
   - 不能重复分配topic

3. 保持完整性
   - 保持原始topic信息的完整性
   - 不修改任何原始数据内容

# 输出格式
{
  "mixed_categories": [
    {
      "categoryName": "分类英文名",
      "categoryName_cn": "分类中文名",
      "categoryId": "分类唯一标识",
      "topicCollection": [
        {
          "topicName": "topic的topicName_rewrite",
          "topicName_cn": "topic的topicName_cn",
          "topicId": "topic的topicId"
        }
        // 该分类下的其他topics
      ]
    }
    // 其他分类
  ]
}

# 质量检查清单
1. 确保所有topic都被分配
2. 确保没有topic重复分配
3. 确保每个topic的信息完整准确
4. 确保分类合理且符合语义关联
5. 确保输出格式符合要求
`;

module.exports = prompt_question_selector;

