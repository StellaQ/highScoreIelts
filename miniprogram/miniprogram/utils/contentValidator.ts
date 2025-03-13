// 内容验证工具

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// 敏感词过滤（示例）
const sensitiveWords = ['spam', 'attack', 'hack'];

// 检查文本长度
export function validateLength(text: string, minLength = 5, maxLength = 500): ValidationResult {
  if (!text || text.trim().length < minLength) {
    return {
      isValid: false,
      message: `内容长度不能少于${minLength}个字符`
    };
  }
  if (text.length > maxLength) {
    return {
      isValid: false,
      message: `内容长度不能超过${maxLength}个字符`
    };
  }
  return { isValid: true };
}

// 检查是否包含敏感词
export function validateContent(text: string): ValidationResult {
  const lowerText = text.toLowerCase();
  for (const word of sensitiveWords) {
    if (lowerText.includes(word)) {
      return {
        isValid: false,
        message: '内容包含敏感词'
      };
    }
  }
  return { isValid: true };
}

// XSS 防护
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 图片验证
export function validateImage(tempFilePaths: string[]): ValidationResult {
  if (!tempFilePaths || tempFilePaths.length === 0) {
    return { isValid: true };
  }
  
  if (tempFilePaths.length > 3) {
    return {
      isValid: false,
      message: '最多只能上传3张图片'
    };
  }
  
  return { isValid: true };
}

// 综合验证
export function validateFeedback(text: string, images: string[]): ValidationResult {
  // 验证文本长度
  const lengthValidation = validateLength(text);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }

  // 验证内容
  const contentValidation = validateContent(text);
  if (!contentValidation.isValid) {
    return contentValidation;
  }

  // 验证图片
  const imageValidation = validateImage(images);
  if (!imageValidation.isValid) {
    return imageValidation;
  }

  return { isValid: true };
} 