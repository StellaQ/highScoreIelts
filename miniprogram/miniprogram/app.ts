import { simpleSecureStorage } from './utils/simpleSecureStorage';

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  isVip: boolean;
  inviteCount: number;
  city?: string;
  country?: string;
  gender?: number;
  language?: string;
  province?: string;
}

interface IAppOption {
  globalData: {
    userInfo?: UserInfo;
    _pollingTimer: any;
    inviterId?: string;
    hasUsedInviteCode?: boolean;
    [key: string]: any;
  };
  userInfoReadyCallback?: (userInfo: UserInfo) => void;
  loginAndFetchUserData: () => void;
  getUserInfo: (callback: (userInfo: UserInfo) => void) => void;
  startPollingUserInfo: () => void;
  stopPollingUserInfo: () => void;
  onUserInfoUpdate: (callback: (userInfo: UserInfo) => void) => void;
  pollUserInfo: () => Promise<void>;
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
    _pollingTimer: null,
    inviterId: undefined,
    hasUsedInviteCode: false
  },

  // 注册用户信息更新观察者
  onUserInfoUpdate(callback: (userInfo: UserInfo) => void) {
    eventBus.on('userInfoUpdate', callback);
  },

  async onLaunch(options) {
    console.log("小程序启动，检查用户信息");

    // 检查是否已经使用过邀请码
    const hasUsedInviteCode = await simpleSecureStorage.getStorage('hasUsedInviteCode');
    this.globalData.hasUsedInviteCode = hasUsedInviteCode || false;

    if (options.query && options.query.inviter) {
      console.log("检测到邀请人ID:", options.query.inviter);
      this.globalData.inviterId = options.query.inviter;
      
      const userInfo = await simpleSecureStorage.getStorage('userInfo') as UserInfo | null;
      if (!userInfo || !userInfo.userId) {
        await simpleSecureStorage.setStorage('inviterId', options.query.inviter);
      }
    }

    const userInfo = await simpleSecureStorage.getStorage('userInfo') as UserInfo | null;
    if (userInfo && userInfo.userId) {
      console.log("本地缓存已有用户信息:", userInfo);
      this.globalData.userInfo = userInfo;
      // 启动轮询
      this.startPollingUserInfo();
    } else {
      console.log("无本地用户信息，执行登录流程");
      this.loginAndFetchUserData();
    }
  },

  // 在小程序关闭时停止轮询
  async onHide() {
    // 停止轮询
    this.stopPollingUserInfo();
  },

  // 在小程序重新显示时，重新启动轮询
  onShow() {
    if (this.globalData.userInfo && this.globalData.userInfo.userId) {
      this.startPollingUserInfo();
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
              await simpleSecureStorage.setStorage('userInfo', userInfo);
              this.globalData.userInfo = userInfo;

              console.log("app.ts接口api/user/getOpenId获取并存储用户数据:", userInfo);

              // 启动轮询
              this.startPollingUserInfo();

              // 触发回调，通知所有等待的页面
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(userInfo);
              }
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

  // 启动轮询用户信息
  startPollingUserInfo() {
    // 清除可能存在的旧定时器
    this.stopPollingUserInfo();
    
    // 设置2分钟轮询间隔
    const POLLING_INTERVAL = 2 * 60 * 1000; // 2分钟
    this.globalData._pollingTimer = setInterval(() => {
      this.pollUserInfo();
    }, POLLING_INTERVAL);

    // 立即执行一次
    this.pollUserInfo();
    console.log("启动全局用户信息轮询");
  },

  // 停止轮询
  stopPollingUserInfo() {
    if (this.globalData._pollingTimer) {
      clearInterval(this.globalData._pollingTimer);
      this.globalData._pollingTimer = null;
      console.log("停止全局用户信息轮询");
    }
  },

  // 轮询用户信息
  async pollUserInfo() {
    if (!this.globalData.userInfo || !this.globalData.userInfo.userId) return;

    try {
      const userId = this.globalData.userInfo.userId;
      console.log("轮询用户信息:", userId);
      
      const res = await new Promise<any>((resolve, reject) => {
        wx.request({
          url: 'http://localhost:3001/api/user/updateInviteCount',
          method: 'GET',
          data: { userId },
          success: (res: any) => resolve(res.data),
          fail: reject
        });
      });

      if (res?.inviteCount !== undefined) {
        // 只在邀请数变化时更新
        if (res.inviteCount !== this.globalData.userInfo.inviteCount) {
          console.log('检测到邀请数变化，从', this.globalData.userInfo.inviteCount, '更新为', res.inviteCount);
          
          // 更新全局用户信息
          this.globalData.userInfo.inviteCount = res.inviteCount;
          
          // 更新本地存储
          await simpleSecureStorage.setStorage('userInfo', this.globalData.userInfo);
          
          // 通知所有监听者
          eventBus.emit('userInfoUpdate', this.globalData.userInfo);
        }
      }
    } catch (err) {
      console.error('轮询用户信息失败:', err);
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
