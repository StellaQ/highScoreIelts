const prompt_topics_selector = `
任务描述：
你需要将给定的 mixed_topics（混合问题集）中的每个 topic（主题）智能分类到预定义的 categories（分类体系）中，确保分类精准且无遗漏。

输入数据：

mixed_topics：包含多个 topic 的数组，每个 topic 包含：

topicName（英文主题名）

topicName_cn（中文主题名）

topicId（唯一标识符）


categories：预定义的分类体系，每个分类包含：

categoryId（分类ID）

categoryName（英文分类名）

categoryName_cn（中文分类名）

description（分类描述，含关键词）

处理规则：

精准匹配优先

分析每个 topic 的 topicName、topicName_cn，结合 category 的 名称（中英文）和描述 进行匹配。

不能简单按顺序匹配，必须计算语义相似度，选择最合适的分类。

分类逻辑

完全匹配（标题或关键词完全一致）→ 直接归类

部分匹配（如问题内容与分类描述的关键词重合）→ 计算相似度，取最高分

输出要求

保持 categories 的原始顺序，即使某些分类没有匹配的 topic，仍需保留空数组。

每个 topic 只能出现在一个分类中，不能重复。

输出格式（JSON）：
json
{
  "mixed_categories": [
    {
      "categoryName": "分类英文名",
      "categoryId": "分类ID",
      "categoryName_cn": "分类中文名",
      "topicCollection": [
        {
          "topicName": "主题英文名",
          "topicName_cn": "主题中文名",
          "topicId": "主题ID"
        }
        // 其他匹配到此分类的 topic
      ]
    }
    // 其他分类（保持原始顺序）
  ]
}
特别注意：

不能创建新的 category，仅使用提供的分类体系。

不能遗漏任何 topic

分类必须精准，不能仅因顺序靠前就强行匹配。

示例（伪代码逻辑）：

python
for topic in mixed_topics:
    best_category = None
    max_score = 0
    
    for category in categories:
        score = calculate_similarity(topic, category)  # 计算相似度
        if score > max_score:
            max_score = score
            best_category = category
    
    if max_score < THRESHOLD:  # 低于阈值则归入 Other
        best_category = find_category("Other")
    
    assign_topic_to_category(topic, best_category)
请严格按照要求处理并输出 JSON 格式结果。
`;

module.exports = prompt_topics_selector;