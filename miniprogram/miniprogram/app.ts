import { simpleSecureStorage } from './utils/simpleSecureStorage';

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  points: number;
}

interface IAppOption {
  globalData: {
    userInfo?: UserInfo;
    inviterId?: string;
    hasUsedInviteCode?: boolean;
    [key: string]: any;
  };
  userInfoReadyCallback?: (userInfo: UserInfo) => void;
  loginAndFetchUserData: () => void;
  getUserInfo: (callback: (userInfo: UserInfo) => void) => void;
  getShareConfig: (options?: { 
    title?: string; 
    path?: string; 
    query?: string;
    imageUrl?: string;
  }) => {
    title: string;
    path: string;
    query: string;
    imageUrl: string;
  };
}

// 创建一个简单的事件总线
const eventBus = {
  listeners: {} as Record<string, Function[]>,
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

App<IAppOption>({
  globalData: {
    userInfo: undefined,
    inviterId: undefined,
    hasUsedInviteCode: false
  },

  async onLaunch(options) {
    console.log("app.ts 小程序启动，检查用户信息");

    // 检查是否已经使用过邀请码
    const hasUsedInviteCode = await simpleSecureStorage.getStorage('hasUsedInviteCode');
    this.globalData.hasUsedInviteCode = hasUsedInviteCode || false;

    if (options.query && options.query.inviter) {
      console.log("app.ts 检测到邀请人ID:", options.query.inviter);
      this.globalData.inviterId = options.query.inviter;
      
      const userInfo = await simpleSecureStorage.getStorage('userInfo') as UserInfo | null;
      if (!userInfo || !userInfo.userId) {
        await simpleSecureStorage.setStorage('inviterId', options.query.inviter);
      }
    }

    // 先尝试从缓存获取用户信息
    const cachedUserInfo = await simpleSecureStorage.getStorage('userInfo') as UserInfo | null;
    if (cachedUserInfo && cachedUserInfo.userId) {
      console.log("app.ts 从缓存获取到用户信息:", cachedUserInfo);
      this.globalData.userInfo = cachedUserInfo;
    } else {
      console.log("app.ts 缓存中无用户信息，执行登录流程");
      this.loginAndFetchUserData();
    }
  },

  loginAndFetchUserData() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'http://localhost:3001/api/user/getOpenId',
            method: 'POST',
            data: { code: res.code },
            success: async (response: any) => {
              const userInfo = response.data.userInfo;
              
              // 如果后端返回的用户信息不完整，使用默认值
              const completeUserInfo: UserInfo = {
                userId: userInfo.userId || '',
                nickname: userInfo.nickname || '',
                avatarUrl: userInfo.avatarUrl || '',
                points: userInfo.points || 0
              };

              // 保存到本地存储
              await simpleSecureStorage.setStorage('userInfo', completeUserInfo);
              this.globalData.userInfo = completeUserInfo;

              console.log("app.ts api/user/getOpenId 获取并存储用户数据:", completeUserInfo);

              // 触发回调，通知所有等待的页面
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(completeUserInfo);
              }
            },
            fail: (error) => {
              console.error("app.ts /api/user/getOpenId 获取用户信息失败:", error);
              // wx.showToast({
              //   title: '获取用户信息失败',
              //   icon: 'none'
              // });
            }
          });
        }
      }
    });
  },

  // 封装全局方法，页面调用这个方法即可
  getUserInfo(callback: (userInfo: UserInfo) => void) {
    if (this.globalData.userInfo) {
      callback(this.globalData.userInfo);
    } else {
      this.userInfoReadyCallback = callback;
    }
  },

  getShareConfig(options = {}) {
    const openid = this.globalData.openid || '';
    const defaultTitle = '高分英语 - 助你轻松备考！';
    const defaultPath = '/pages/index/index';
    const defaultQuery = `inviter=${openid}`;
    const defaultImageUrl = '../../assets/pics/share-image.png';

    return {
      title: options.title || defaultTitle,
      path: options.path || defaultPath,
      query: options.query || defaultQuery,
      imageUrl: options.imageUrl || defaultImageUrl
    };
  }
});
