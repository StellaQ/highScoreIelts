const prompt_question_selector = `
请根据提供的mixed_questions数组和categories分类体系，
将问题主题(topic)智能分配到最匹配的category中，
并生成符合以下格式的mixed_categories输出：

输入数据：
mixed_questions: 包含多个主题(topic)及其对应问题列表的数组

categories: 预定义的分类体系，每个分类包含中英文名称和描述

处理规则：

仔细分析每个topic的topicName和问题内容，匹配到最合适的category

匹配时应参考category的英文名(categoryName)和中文名(categoryNameInChinese)，以及description中的关键词

每个topic只能分配到一个category中

保持原始topic的完整结构不变

输出格式要求：
json
{
  "mixed_categories": [
    {
      "categoryName": "字符串，分类英文名",
      "categoryName_cn": "字符串，分类中文名",
      "categoryId": "字符串，分类ID",
      "topicCollection": [
        {
          "topicName": "字符串，主题英文名",
          "topicName_cn": "字符串，主题中文名",
          "topicId": "字符串，主题ID"
        }
        // 其他匹配到此category的topic
      ]
    }
    // 其他category
  ]
}
特别注意：

不要修改原始输入的内容和顺序

不要创建示例中重复的topic条目
`;

module.exports = prompt_question_selector;

