const axios = require('axios');

async function getAIAnswer(question, userData) {
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'gpt-3.5-turbo',  // 你可以根据需要选择模型
      prompt: question,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`
      }
    });

    return response.data.choices[0].text.trim();  // 获取 OpenAI 返回的答案
  } catch (error) {
    throw new Error('AI请求失败');
  }
}
