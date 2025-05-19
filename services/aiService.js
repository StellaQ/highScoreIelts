const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_ENDPOINT,
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
      // console.error('AI响应内容为空');
      throw new Error('AI响应中没有内容');
    }

    // console.log('AI原始响应:', responseContent);

    try {
      // 首先尝试直接解析
      try {
        const directParsed = JSON.parse(responseContent);
        // console.log('直接解析成功:', directParsed);
        return directParsed;
      } catch (directError) {
        // console.log('直接解析失败，尝试清理后解析');
      }

      // 如果直接解析失败，进行清理后再解析
      let cleanedContent = responseContent
        .trim()
        // 移除可能的BOM和其他不可见字符
        .replace(/^\uFEFF/, '')
        // 移除所有控制字符
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        // 确保引号是标准的双引号
        .replace(/[""]/g, '"')
        // 移除多余的空格
        .replace(/\s+/g, ' ')
        // 修复可能的小数点问题
        .replace(/(\d+)\.(\d+)\/(\d+)/g, '$1.$2');

      // 确保是一个有效的JSON字符串
      if (!cleanedContent.startsWith('{')) {
        cleanedContent = '{' + cleanedContent;
      }
      if (!cleanedContent.endsWith('}')) {
        cleanedContent = cleanedContent + '}';
      }
      
      // console.log('清理后的响应:', cleanedContent);
      
      const parsedResponse = JSON.parse(cleanedContent);
      // console.log('解析后的JSON:', parsedResponse);
      
      return parsedResponse;
    } catch (parseError) {
      // console.error('JSON解析错误:', parseError);
      // console.error('无效的JSON内容:', responseContent);
      throw new Error('AI返回了无效的JSON格式');
    }
  } catch (error) {
    // console.error('AI服务错误:', error);
    throw error;
  }
}

module.exports = { getAIService };