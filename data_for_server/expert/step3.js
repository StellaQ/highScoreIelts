const prompt_question_selector = `
请根据提供的mixed_questions数组和categories分类体系，
将问题主题(topic)智能分配到最匹配的category中，
并生成符合以下格式的mixed_categories输出：

输入数据：
mixed_questions: 包含多个主题(topic)及其对应问题列表的数组

categories: 预定义的分类体系，每个分类包含categoryId、中英文名称和描述

处理规则：

1. 分类匹配规则：
   - 仔细分析每个topic的topicName、topicName_cn和questions
   - 按照categories数组中从上到下的顺序依次尝试匹配
   - 匹配时应同时参考category的英文名(categoryName)、中文名(categoryNameInChinese)和description中的关键词
   - 每个topic只能分配到一个category中
   - 输出的mixed_categories的顺序和categories的顺序一致

2. 特殊处理：
   - 如果topic明显不属于任何现有category，放入"Other"类别
   - 不要创建重复的topic条目
   - 保持categories的原始顺序，不要重新排序

输出格式要求：
json
{
  "mixed_categories": [
    {
      "categoryName": "字符串，分类英文名",
      "categoryId": "字符串，分类ID",
      "categoryNameInChinese": "字符串，分类中文名",
      "topicCollection": [
        {
          "topicName": "字符串，主题英文名",
          "topicName_cn": "字符串，主题中文名",
          "topicId": "字符串，主题ID"
        }
        // 其他匹配到此category的topic
      ]
    }
    // 其他category（保持原始categories顺序）
  ]
}

特别注意：
- 不匹配任何分类的topic放入"Other"
- 不要创建新的category，只使用提供的categories
`;

module.exports = prompt_question_selector;