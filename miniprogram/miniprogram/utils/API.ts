const BASE_URL = 'http://localhost:3001'; // 替换为实际的 API 地址

const API = {
  // 更新用户积分
  updateUserPoints: (userId: string, points: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/updatePoints`,
        method: 'POST',
        data: {
          userId,
          points
        },
        success: (res: any) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '更新积分失败'));
          }
        },
        fail: reject
      });
    });
  },
  // 获取用户邀请数量
  getUserInviteCount: (userId: string): Promise<{ inviteCount: number }> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/user/invite/count`,
        method: 'GET',
        data: { userId },
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error('获取邀请数量失败'));
          }
        },
        fail: reject
      });
    });
  }
};

export default API; 