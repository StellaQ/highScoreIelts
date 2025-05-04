import { simpleSecureStorage } from './simpleSecureStorage';
import { BASE_URL } from './config';

// 基础配置
const baseConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  header: {
    'content-type': 'application/json'
  }
};

// 请求拦截器
const requestInterceptor = async (config: any) => {
  // 合并基础配置
  const finalConfig = {
    ...baseConfig,
    ...config,
    header: {
      ...baseConfig.header,
      ...config.header
    }
  };

  // 获取token
  const token = await simpleSecureStorage.getStorage('token');
  
  // 如果有token，添加到请求头
  if (token) {
    finalConfig.header['Authorization'] = `Bearer ${token}`;
  }
  
  return finalConfig;
};

// 响应拦截器
const responseInterceptor = (response: any) => {
  // 如果返回401，说明token过期或无效
  if (response.statusCode === 401) {
    // 清除本地存储的token和用户信息
    simpleSecureStorage.removeStorage('token');
    simpleSecureStorage.removeStorage('userInfo');
    
    // 获取全局 app 实例并执行静默登录
    const app = getApp();
    // @ts-ignore
    if (app?.loginAndFetchUserData) {
      // @ts-ignore
      app.loginAndFetchUserData();
    }
    
    return Promise.reject(new Error('token已过期，正在重新登录'));
  }
  
  return response;
};

// 重写wx.request方法
const originalRequest = wx.request;
// @ts-ignore
wx.request = function(options: any) {
  // 应用请求拦截器
  return requestInterceptor(options).then(config => {
    return new Promise((resolve, reject) => {
      originalRequest({
        ...config,
        success: (res) => {
          // 应用响应拦截器
          try {
            const processedResponse = responseInterceptor(res);
            // 如果原始请求有 success 回调，执行它
            if (options.success) {
              options.success(processedResponse);
            }
            resolve(processedResponse);
          } catch (error) {
            if (options.fail) {
              options.fail(error);
            }
            reject(error);
          }
        },
        fail: (err) => {
          if (options.fail) {
            options.fail(err);
          }
          reject(err);
        }
      });
    });
  }).catch(err => {
    if (options.fail) {
      options.fail(err);
    }
    return Promise.reject(err);
  });
};

// 导出原始request方法，以防需要直接使用
export const originalWxRequest = originalRequest;

// 导出封装后的request方法
export default wx.request; 