import { config } from './config';

export const BASE_URL = config.BASE_URL;

const API = {
  // index页面检查题库是否有更新
  checkIfShowUpdate: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/index/checkUpdate`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // listBasic 获取分类数据
  getBasicCategories: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/getBasicCategories`,
        method: 'GET',
        data: {
          userId
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailBasic 获取详情
  getBasicDetail: (userId: string, topicId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/getBasicDetail`,
        method: 'GET',
        data: {
          userId,
          topicId
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailBasic AI定制答案
  getBasicAI: (userId: string, question: string, answer: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/getBasicAI`,
        method: 'POST',
        data: {
          userId,
          question,
          answer
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailBasic 更新单个答案
  updateBasicAnswer: (userId: string, topicId: string, index: number, answer: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/updateBasicAnswer`,
        method: 'POST',
        data: {
          userId,
          topicId,
          index,
          answer
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailBasic 更新复习时间
  updateBasicReviewTime: (userId:string, topicId: string, nextReviewDate: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/updateBasicReviewTime`,
        method: 'POST',
        data: {
          userId,
          topicId,
          nextReviewDate
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // listAdvanced 获取分类数据
  getAdvancedCategories: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/advanced/getAdvancedCategories?userId=${userId}`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailAdvanced 获取详情
  getAdvancedDetail: (userId: string, topicId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/advanced/getAdvancedDetail?userId=${userId}&topicId=${topicId}`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailAdvanced AI定制答案
  getAdvancedAI: (userId: string, question: string, points: Array<string>): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/advanced/getAdvancedAI`,
        method: 'POST',
        data: {
          userId,
          question,
          points
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailAdvanced 更新答案
  updateAdvancedAnswer: (userId: string, topicId: string, answer: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/advanced/updateAdvancedAnswer`,
        method: 'POST',
        data: {
          userId,
          topicId,
          answer
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailAdvanced 更新复习时间
  updateAdvancedReviewTime: (userId: string, topicId: string, nextReviewDate: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/advanced/updateAdvancedReviewTime`,
        method: 'POST',
        data: {
          userId,
          topicId,
          nextReviewDate
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // listExpert 获取分类数据
  getExpertCategories: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/expert/getExpertCategories?userId=${userId}`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailExpert 获取题目详情
  getExpertDetail: (userId: string, topicId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/expert/getExpertDetail?userId=${userId}&topicId=${topicId}`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailExpert AI定制答案
  getExpertAI: (userId: string, question: string, answer: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/expert/getExpertAI`,
        method: 'POST',
        data: {
          userId,
          question,
          answer
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailExpert 更新答案
  updateExpertAnswer: (userId: string, topicId: string, index: number, answer: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/expert/updateExpertAnswer`,
        method: 'POST',
        data: {
          userId,
          topicId,
          index,
          answer
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // detailExpert 更新复习时间
  updateExpertReviewTime: (userId: string, topicId: string, nextReviewDate: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/expert/updateExpertReviewTime`,
        method: 'POST',
        data: {
          userId,
          topicId,
          nextReviewDate
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // app.ts 获取用户 openId
  getOpenId: (code: string, codeFromInviter?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/getOpenId`,
        method: 'POST',
        data: {
          code,
          codeFromInviter
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // abouMe 更新用户信息
  updateProfile: (userId: string, nickname: string, avatarUrl: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/updateProfile`,
        method: 'POST',
        data: {
          userId,
          nickname,
          avatarUrl
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // aboutMe 执行签到
  signIn: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/signIn/${userId}`,
        method: 'POST',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  // aboutMe 检查总的邀请人数和最近三天的邀请人数
  checkInvites: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/checkInvites/${userId}`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error('检查invite状态失败'));
          }
        },
        fail: reject
      });
    });
  },
  // aboutMe 今日最新数据 doing
  getLatestStatus: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/getLatestStatus/${userId}`,
        method: 'GET',
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error('检查签到状态失败'));
          }
        },
        fail: reject
      });
    });
  },
  // aboutMe 验证邀请码
  verifyInviteCode: (userId: string, inviteCode: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/verifyInviteCode`,
        method: 'POST',
        data: { userId, inviteCode },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.error || '验证邀请码失败'));
          }
        },
        fail: reject
      });
    });
  },
  // feedback 上传反馈
  uploadFeedback: (userId: string, content: string, images?: string[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/feedback/upload`,
        method: 'POST',
        data: {
          userId,
          content,
          images: images || []
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  }
};

export default API; 