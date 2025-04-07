const BASE_URL = 'http://localhost:3001'; // 替换为实际的 API 地址

const API = {
  // basic 获取分类数据
  getBasicCategories: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/getBasicCategories?userId=${userId}`,
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
  // expert 获取分类数据
  getExpertCategories: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/expert/getCategories?userId=${userId}`,
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
  // advanced 获取分类数据
  getAdvancedCategories: (userId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/advanced/getCategories?userId=${userId}`,
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
  // basic 调用AI来定制化口语答案
  getBasicAI: (question: string, answer: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/getBasicAI`,
        method: 'POST',
        data: {
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
  // basic 更新单个答案
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
  // basic 更新下次复习时间
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
  // 执行签到 done
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
  // 检查总的邀请人数和最近三天的邀请人数
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
  // 今日最新数据 doing
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
  // 验证邀请码
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
  }
};

export default API; 