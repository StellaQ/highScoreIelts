import { simpleSecureStorage } from './utils/simpleSecureStorage';
import API from './utils/API';

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  inviteCode: string
}

interface IAppOption {
  globalData: {
    userInfo?: {
      userId: string;
      avatarUrl: string;
      nickname: string;
      inviteCode: string
    },
    codeFromInviter?: string
  };
  userInfoReadyCallback?: (userInfo: UserInfo) => void;
  loginAndFetchUserData: () => void;
  getUserInfo: (callback: (userInfo: UserInfo) => void) => void;
  getShareInfo(): WechatMiniprogram.Page.ICustomShareContent;
  getTimelineInfo(): WechatMiniprogram.Page.ICustomTimelineContent;
}

App<IAppOption>({
  globalData: {
    userInfo: undefined,
    codeFromInviter: undefined
  },

  async onLaunch(options) {
    console.log("app.ts 小程序启动，检查用户信息");

    // path?inviter=ABCD12  // inviter参数使用inviteCode而不是userId
    if (options.query && options.query.inviter) {
      console.log("检测到邀请码:", options.query.inviter);
      // 验证邀请码格式
      if (/^[A-Z0-9]{6}$/.test(options.query.inviter)) {
        this.globalData.codeFromInviter = options.query.inviter;
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
          API.getOpenId(res.code, this.globalData.codeFromInviter)
            .then(async (response: any) => {
              const userInfo = response.data.userInfo;

              // 保存到本地存储
              await simpleSecureStorage.setStorage('userInfo', userInfo);
              this.globalData.userInfo = userInfo;

              console.log("app.ts api/user/getOpenId 获取并存储用户数据:", userInfo);

              // 触发回调，通知所有等待的页面
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(userInfo);
              }
            })
            .catch(error => {
              console.error("app.ts /api/user/getOpenId 获取用户信息失败:", error);
              // wx.showToast({
              //   title: '获取用户信息失败',
              //   icon: 'none'
              // });
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
  
  // 普通分享
  getShareInfo() {
    const code = this.globalData.userInfo?.inviteCode;
    return {
      title: '烤鸭们，主包在这里用AI学习SPEAKING',
      path: `/pages/index/index?inviter=${code}`,
      imageUrl: 'https://img.xiaoshuspeaking.site/share-info2.png'
    }
  },
  // 朋友圈分享
  getTimelineInfo() {
    const code = this.globalData.userInfo?.inviteCode
    return {
      title: '烤鸭们，主包在这里用AI学习SPEAKING',  // 朋友圈标题
      query: `inviter=${code}`,  // 注意这里用 query 而不是 path
      imageUrl: 'https://img.xiaoshuspeaking.site/share-info2.png'  // 朋友圈分享的图片尺寸要求可能与普通分享不同，建议使用 1:1 的图片
    }
  }
});
