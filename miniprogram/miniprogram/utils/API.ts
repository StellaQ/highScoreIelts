import { BASE_URL } from './config';
import { simpleSecureStorage } from './simpleSecureStorage';

// 统一的请求函数
const request = async <T>(options: WechatMiniprogram.RequestOption): Promise<T> => {
  // console.log('==========API.ts 中的 request 被调用');
  
  // 获取 token
  const token = await simpleSecureStorage.getStorage('token');
  // console.log('==========token is:', token);
  
  // 合并请求头
  const headers = {
    'content-type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.header
  };
  
  // console.log('==========request url:', options.url);
  // console.log('==========request headers:', headers);

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header: headers,
      success: (res: any) => {
        // 如果返回401，说明token过期或无效
        if (res.statusCode === 401) {
          // console.log('==========token 已过期，清除缓存并重新登录');
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
          
          reject(new Error('token已过期，正在重新登录'));
          return;
        }

        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
};

interface VipOrderResponse {
  code: number;
  message?: string;
  data: {
    payParams: WechatMiniprogram.RequestPaymentOption;
    orderId: string;
  };
}

interface PaymentSuccessResponse {
  success: boolean;
  message?: string;
  isVip: boolean;
  vipExpireDate: string;
}

// 负责处理所有请求相关的逻辑
const API = {
  // index页面决定是否显示题库的更新消息
  checkIfShowUpdate: (): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/index/checkUpdate`,
      method: 'GET'
    });
  },
  // 上传微信头像临时地址到七牛云
  uploadAvatarToServer: async (filePath: string): Promise<any> => {
    // 获取 token
    const token = await simpleSecureStorage.getStorage('token');
    // console.log('==========uploadAvatarToServer token is:', token);
    // 合并请求头
    const headers = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    // console.log('==========uploadAvatarToServer headers:', headers);

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BASE_URL}/api/qiniu/uploadAvatar`, 
        filePath: filePath,
        name: 'file', // 必须和后台 multer 配置一致
        header: headers,
        success: (uploadRes) => {
          try {
            // 如果返回401，说明token过期或无效
            if (uploadRes.statusCode === 401) {
              // console.log('==========token 已过期，清除缓存并重新登录');
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
              
              reject(new Error('token已过期，正在重新登录'));
              return;
            }

            const data = JSON.parse(uploadRes.data);
            if (data.qiniuUrl) {
              resolve(data.qiniuUrl);
            } else {
              reject('未返回七牛云地址');
            }
          } catch (err) {
            reject('解析上传响应失败');
          }
        },
        fail: (err) => {
          reject('上传失败: ' + err.errMsg);
        }
      });
    });
  },
  // 获取用户VIP状态
  getVipStatus: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/vip-status`,
      method: 'GET',
      data: { userId }
    });
  },
  // listBasic 获取分类数据
  getBasicCategories: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/basic/getBasicCategories`,
      method: 'GET',
      data: { userId }
    });
  },
  // detailBasic 获取详情
  getBasicDetail: (userId: string, topicId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/basic/getBasicDetail`,
      method: 'GET',
      data: { userId, topicId }
    });
  },
  // detailBasic AI定制答案
  getBasicAI: (userId: string, question: string, answer: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/basic/getBasicAI`,
      method: 'POST',
      data: { userId, question, answer }
    });
  },
  // detailBasic 更新单个答案
  updateBasicAnswer: (userId: string, topicId: string, index: number, answer: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/basic/updateBasicAnswer`,
      method: 'POST',
      data: { userId, topicId, index, answer }
    });
  },
  // detailBasic 更新复习时间
  updateBasicReviewTime: (userId:string, topicId: string, nextReviewDate: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/basic/updateBasicReviewTime`,
      method: 'POST',
      data: { userId, topicId, nextReviewDate }
    });
  },
  // listAdvanced 获取分类数据
  getAdvancedCategories: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/advanced/getAdvancedCategories`,
      method: 'GET',
      data: { userId }
    });
  },
  // detailAdvanced 获取详情
  getAdvancedDetail: (userId: string, topicId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/advanced/getAdvancedDetail`,
      method: 'GET',
      data: { userId, topicId }
    });
  },
  // detailAdvanced AI定制答案
  getAdvancedAI: (userId: string, question: string, points: Array<string>): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/advanced/getAdvancedAI`,
      method: 'POST',
      data: { userId, question, points }
    });
  },
  // detailAdvanced 更新答案
  updateAdvancedAnswer: (userId: string, topicId: string, answer: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/advanced/updateAdvancedAnswer`,
      method: 'POST',
      data: { userId, topicId, answer }
    });
  },
  // detailAdvanced 更新复习时间
  updateAdvancedReviewTime: (userId: string, topicId: string, nextReviewDate: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/advanced/updateAdvancedReviewTime`,
      method: 'POST',
      data: { userId, topicId, nextReviewDate }
    });
  },
  // listExpert 获取分类数据
  getExpertCategories: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/expert/getExpertCategories`,
      method: 'GET',
      data: { userId }
    });
  },
  // detailExpert 获取题目详情
  getExpertDetail: (userId: string, topicId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/expert/getExpertDetail`,
      method: 'GET',
      data: { userId, topicId }
    });
  },
  // detailExpert AI定制答案
  getExpertAI: (userId: string, question: string, answer: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/expert/getExpertAI`,
      method: 'POST',
      data: { userId, question, answer }
    });
  },
  // detailExpert 更新答案
  updateExpertAnswer: (userId: string, topicId: string, index: number, answer: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/expert/updateExpertAnswer`,
      method: 'POST',
      data: { userId, topicId, index, answer }
    });
  },
  // detailExpert 更新复习时间
  updateExpertReviewTime: (userId: string, topicId: string, nextReviewDate: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/expert/updateExpertReviewTime`,
      method: 'POST',
      data: { userId, topicId, nextReviewDate }
    });
  },
  // app.ts 获取用户 openId
  getOpenId: (code: string, codeFromInviter?: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/getOpenId`,
      method: 'POST',
      data: { code, codeFromInviter }
    });
  },
  // abouMe 更新用户信息
  updateProfile: (userId: string, nickname: string, avatarUrl: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/updateProfile`,
      method: 'POST',
      data: { userId, nickname, avatarUrl }
    });
  },
  // aboutMe 执行签到
  signIn: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/signIn/${userId}`,
      method: 'POST'
    });
  },
  // aboutMe 检查总的邀请人数和最近三天的邀请人数
  checkInvites: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/checkInvites/${userId}`,
      method: 'GET'
    });
  },
  // aboutMe 今日最新数据 doing
  getLatestStatus: (userId: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/getLatestStatus/${userId}`,
      method: 'GET'
    });
  },
  // aboutMe 验证邀请码
  verifyInviteCode: (userId: string, inviteCode: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/verifyInviteCode`,
      method: 'POST',
      data: { userId, inviteCode }
    });
  },
  // feedback 上传反馈 忽略
  uploadFeedback: (userId: string, content: string, images?: string[]): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/feedback/upload`,
      method: 'POST',
      data: { userId, content, images: images || [] }
    });
  },
  // 绑定手机号 不用
  bindPhoneNumber: (userId: string, phoneNumber: string): Promise<any> => {
    return request({
      url: `${BASE_URL}/api/user/bind-phone`,
      method: 'POST',
      data: { userId, phoneNumber }
    });
  },
  // 创建VIP订单
  createVipOrder: (userId: string, subscribeType: 'season' | 'yearly'): Promise<VipOrderResponse> => {
    return request({
      url: `${BASE_URL}/api/user/subscribe`,
      method: 'POST',
      data: { userId, subscribeType }
    });
  },
  // 支付成功后更新状态
  updatePaymentSuccess: (userId: string, orderId: string): Promise<PaymentSuccessResponse> => {
    return request({
      url: `${BASE_URL}/api/user/pay/success`,
      method: 'POST',
      data: { userId, orderId }
    });
  }
};

export default API; 