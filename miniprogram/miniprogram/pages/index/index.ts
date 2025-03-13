import userConfig from '../../assets/data/userConfig';
import { simpleSecureStorage } from '../../utils/simpleSecureStorage';

const app = getApp();

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  isVip: boolean;
}

interface InviteInfo {
  inviteCount: number;
  invitePercent: number;
}

interface PageData {
  userInfo: UserInfo;
  inviteInfo: InviteInfo;
  numberOfUses: number;
  active: number;
  inviterId: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  inviteCount?: number;
}

Page<PageData, WechatMiniprogram.Page.CustomOption>({
  data: {
    userInfo: {
      userId: '',
      nickname: '',
      avatarUrl: '',
      isVip: false
    },
    inviteInfo: {
      inviteCount: 0,
      invitePercent: 0
    },
    numberOfUses: 0,
    active: 3,
    inviterId: ''
  },

  // 添加定时器变量
  _pollingTimer: null as any,

  // 添加轮询方法
  async pollUserInfo() {
    if (!this.data.userInfo.userId) return;

    try {
      const res = await new Promise<ApiResponse>((resolve, reject) => {
        wx.request({
          url: 'http://localhost:3001/api/user/updateInviteCount',
          method: 'GET',
          data: {
            userId: this.data.userInfo.userId
          },
          success: (res: any) => resolve(res.data),
          fail: reject
        });
      });

      if (res?.inviteCount !== undefined) {
        // 只在邀请数变化时更新
        if (res.inviteCount !== this.data.inviteInfo.inviteCount) {
          console.log('检测到邀请数变化，更新UI');
          this.updateInviteInfo(res.inviteCount);
        }
      }
    } catch (err) {
      console.error('轮询用户信息失败:', err);
    }
  },

  // 启动轮询
  startPolling() {
    // 清除可能存在的旧定时器
    if (this._pollingTimer) {
      clearInterval(this._pollingTimer);
    }
    
    // 设置2分钟轮询间隔
    const POLLING_INTERVAL = 2 * 60 * 1000; // 2分钟
    this._pollingTimer = setInterval(() => {
      this.pollUserInfo();
    }, POLLING_INTERVAL);

    // 立即执行一次
    this.pollUserInfo();
  },

  // 停止轮询
  stopPolling() {
    if (this._pollingTimer) {
      clearInterval(this._pollingTimer);
      this._pollingTimer = null;
    }
  },

  async updateUserProfile() {
    try {
      let storedUserInfo = await simpleSecureStorage.getStorage('userInfo');
  
      if (storedUserInfo && storedUserInfo.nickname && storedUserInfo.avatarUrl) {
        console.log('用户已授权，使用本地存储信息:', storedUserInfo);
        return;
      }
  
      const res = await wx.getUserProfile({
        desc: '用于完善个人资料'
      });
  
      console.log('从 wx.getUserProfile 获取的用户信息:', res);
      const { avatarUrl, nickName } = res.userInfo;
  
      await wx.request({
        url: 'http://localhost:3001/api/user/updateProfile',
        method: 'POST',
        data: {
          userId: this.data.userInfo.userId,
          nickname: nickName,
          avatarUrl: avatarUrl
        },
        success: async () => {
          console.log('用户信息更新成功');
  
          const updatedUserInfo: UserInfo = {
            userId: this.data.userInfo.userId,
            nickname: nickName,
            avatarUrl: avatarUrl,
            isVip: this.data.userInfo.isVip
          };
          
          await simpleSecureStorage.setStorage('userInfo', updatedUserInfo);
          this.setData({ userInfo: updatedUserInfo });
        }
      });
    } catch (err) {
      console.warn('用户取消授权或获取失败', err);
    }
  },

  // 更新邀请信息
  updateInviteInfo(inviteCount: number) {
    const inviteTarget = userConfig.inviteNumberToBeVip || 50;
    const percent = Math.min((inviteCount / inviteTarget) * 100, 100);
    
    const inviteInfo = {
      inviteCount,
      invitePercent: percent
    };

    this.setData({ inviteInfo });
    simpleSecureStorage.setStorage('inviteInfo', inviteInfo);
  },

  setUserInfo(userInfo: UserInfo & { inviteCount?: number }) {
    const { inviteCount, ...basicUserInfo } = userInfo;
    
    this.setData({
      userInfo: {
        ...this.data.userInfo,
        ...basicUserInfo
      }
    });

    if (typeof inviteCount === 'number') {
      this.updateInviteInfo(inviteCount);
    }
  },

  async onLoad(options) {
    if (options.inviterId) {
      this.setData({ inviterId: options.inviterId });
      console.log('url参数，邀请人ID:', options.inviterId);
    }

    // 监听numberOfUses的变化
    app.onNumberOfUsesChange((value: number) => {
      console.log('numberOfUses changed:', value);
      this.setData({ numberOfUses: value });
    });

    // 获取用户信息
    app.getUserInfo((userInfo: UserInfo & { inviteCount?: number }) => {
      console.log("index页面从app.ts获取用户信息:", userInfo);
      this.setUserInfo(userInfo);
      
      if (this.data.inviterId) {
        this.handleInvite();
      }

      this.startPolling();
    });
  },

  onShow() {
    // 页面显示时同步一次当前值
    this.setData({
      numberOfUses: app.globalData.numberOfUses
    });
  },

  onUnload() {
    this.stopPolling();
  },

  onShareAppMessage() {
    return {
      title: '🎉 快来一起刷题！',
      path: `/pages/index/index?inviterId=${this.data.userInfo.userId}`,
      imageUrl: '/assets/pics/share5.jpg',
    };
  },

  async handleInvite() {
    const { inviterId } = this.data;
    const { userId } = this.data.userInfo;

    if (!inviterId || !userId || inviterId === userId) {
      console.log('无效的邀请关系');
      return;
    }

    try {
      const result = await new Promise<ApiResponse>((resolve, reject) => {
        wx.request({
          url: 'http://localhost:3001/api/user/checkAndRecordInvite',
          method: 'POST',
          data: {
            inviterId: inviterId,
            inviteeId: userId
          },
          success: (res: any) => resolve(res.data),
          fail: reject
        });
      });

      if (result.success && result.inviteCount !== undefined) {
        console.log('邀请记录成功');
        this.updateInviteInfo(result.inviteCount);
      } else {
        console.log('邀请失败:', result.message);
      }
    } catch (err) {
      console.error('处理邀请关系失败:', err);
    }
  },

  navigateToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },
});