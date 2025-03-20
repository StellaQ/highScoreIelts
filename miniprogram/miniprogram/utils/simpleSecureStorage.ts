const SECRET_KEY = 'your-secret-key-2024'; // 实际使用时应该放在环境变量中

// Base64 编码表
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// 简单的异或加密
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Base64编码
function base64Encode(str: string): string {
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const char1 = str.charCodeAt(i++);
    const char2 = i < str.length ? str.charCodeAt(i++) : NaN;
    const char3 = i < str.length ? str.charCodeAt(i++) : NaN;

    const enc1 = char1 >> 2;
    const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
    const enc3 = ((char2 & 15) << 2) | (char3 >> 6);
    const enc4 = char3 & 63;

    result += BASE64_CHARS[enc1] +
              BASE64_CHARS[enc2] +
              (isNaN(char2) ? '=' : BASE64_CHARS[enc3]) +
              (isNaN(char3) ? '=' : BASE64_CHARS[enc4]);
  }
  
  return result;
}

// Base64解码
function base64Decode(str: string): string {
  str = str.replace(/[^A-Za-z0-9+/]/g, '');
  let result = '';
  let i = 0;

  while (i < str.length) {
    const enc1 = BASE64_CHARS.indexOf(str.charAt(i++));
    const enc2 = BASE64_CHARS.indexOf(str.charAt(i++));
    const enc3 = BASE64_CHARS.indexOf(str.charAt(i++));
    const enc4 = BASE64_CHARS.indexOf(str.charAt(i++));

    const char1 = (enc1 << 2) | (enc2 >> 4);
    const char2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const char3 = ((enc3 & 3) << 6) | enc4;

    result += String.fromCharCode(char1);
    if (enc3 !== 64) result += String.fromCharCode(char2);
    if (enc4 !== 64) result += String.fromCharCode(char3);
  }

  return result;
}

// 计算简单的校验和
function calculateChecksum(data: string): number {
  return Array.from(data).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export interface SimpleSecureStorage {
  setStorage(key: string, data: any): Promise<void>;
  getStorage(key: string): Promise<any>;
  removeStorage(key: string): Promise<void>;
}

export const simpleSecureStorage: SimpleSecureStorage = {
  async setStorage(key: string, data: any): Promise<void> {
    try {
      // 将数据转换为字符串
      const jsonStr = JSON.stringify(data);
      
      // 使用异或加密
      const encrypted = xorEncrypt(jsonStr, SECRET_KEY);
      
      // 计算校验和
      const checksum = calculateChecksum(encrypted);
      
      // 组合数据
      const finalData = {
        data: encrypted,
        checksum: checksum
      };
      
      // 保存数据
      return new Promise((resolve, reject) => {
        wx.setStorage({
          key,
          data: JSON.stringify(finalData),
          success: () => resolve(),
          fail: (error) => reject(error)
        });
      });
    } catch (error) {
      console.error('存储失败:', error);
      throw error;
    }
  },

  async getStorage(key: string): Promise<any> {
    try {
      // 获取数据
      return new Promise((resolve, reject) => {
        wx.getStorage({
          key,
          success: (res) => {
            try {
              const storedData = res.data;
              
              if (!storedData) {
                resolve(null);
                return;
              }

              // 解析存储的数据
              const parsedData = JSON.parse(storedData);
              
              // 验证数据格式
              if (!parsedData || !parsedData.data || parsedData.checksum === undefined) {
                console.warn('存储的数据格式不正确');
                resolve(null);
                return;
              }

              // 验证校验和
              const currentChecksum = calculateChecksum(parsedData.data);
              if (currentChecksum !== parsedData.checksum) {
                console.warn('数据校验失败，可能被篡改');
                resolve(null);
                return;
              }
              
              // 解密数据
              const decrypted = xorEncrypt(parsedData.data, SECRET_KEY);
              
              // 解析JSON
              resolve(JSON.parse(decrypted));
            } catch (error) {
              console.error('读取失败:', error);
              resolve(null);
            }
          },
          fail: (error) => {
            if (error.errMsg.includes('data not found')) {
              resolve(null);
            } else {
              reject(error);
            }
          }
        });
      });
    } catch (error) {
      console.error('读取失败:', error);
      return null;
    }
  },

  async removeStorage(key: string): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        wx.removeStorage({
          key,
          success: () => resolve(),
          fail: (error) => reject(error)
        });
      });
    } catch (error) {
      console.error('删除失败:', error);
      throw error;
    }
  }
}; 