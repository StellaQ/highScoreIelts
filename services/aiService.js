const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

async function getAIService(system_prompt, user_prompt) {
  const messages = [
    { role: "system", content: system_prompt },
    { role: "user", content: user_prompt }
  ];
  
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-chat",
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('AI响应中没有内容');
    }

    try {
      return JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('AI返回了无效的JSON格式');
    }
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error; // 保持错误传播
  }
}

module.exports = { getAIService };