const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: 'sk-1da737a934514aada285d8ed5502abcd'
});

async function getAIAnswer(system_prompt, user_prompt) {
  const messages = [
    { "role": "system", "content": system_prompt },
    { "role": "user", "content": user_prompt }
  ];
  try {
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "deepseek-chat",
      response_format: {
        'type': 'json_object'
      }
    });

    // 直接返回解析后的 JSON 对象，而不是仅仅打印
    return JSON.parse(completion.choices[0].message.content);  // 返回解析后的结果
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error;  // 如果有错误，抛出错误以便调用者处理
  }
}

// 确保导出 getAIAnswer 函数
module.exports = { getAIAnswer };