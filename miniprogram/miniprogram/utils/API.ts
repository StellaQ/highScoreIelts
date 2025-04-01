const BASE_URL = 'http://localhost:3001'; // 替换为实际的 API 地址

const API = {
  // basic 获取分类数据
  getCategories: (userId: string, type: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/basic/getCategories?userId=${userId}&type=${type}`,
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