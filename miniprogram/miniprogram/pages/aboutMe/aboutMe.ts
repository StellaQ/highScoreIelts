import userConfig = require('../../assets/data/userConfig');
import { simpleSecureStorage } from '../../utils/simpleSecureStorage';
import Toast from '@vant/weapp/toast/toast';

interface UserInfo {
  avatarUrl: string;
  nickName: string;
}

interface InviteInfo {
  inviteCount: number;x
  invitePercent: number;
}

interface PageData {
  userInfo: {
    avatarUrl: string;
    nickName: string;
  };
  points: number;
  hasCheckedIn: boolean;
  showInvitePopup: boolean;
  inviteCode: string;
  showPrivacyPopup: boolean;
  streakDays: number;
  totalTopics: number;
  aiScore: number;
  lastPractice: string;
  showInviteCodeInputPopup: boolean;
  inputInviteCode: string;
  hasUsedInviteCode: boolean;
  inviterId?: string;
}

interface ApiResponse {
  code: number;
  data: any;
  message: string;
}

interface IAppOption {
  globalData: {
    userInfo?: UserInfo;
    _pollingTimer: any;
    inviterId?: string;
    hasUsedInviteCode?: boolean;
    [key: string]: any;
  };
}

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    points: 0,
    hasCheckedIn: false,
    showInvitePopup: false,
    inviteCode: '',
    showPrivacyPopup: false,
    streakDays: 0,
    totalTopics: 0,
    aiScore: 0,
    lastPractice: '暂无',
    showInviteCodeInputPopup: false,
    inputInviteCode: '',
    hasUsedInviteCode: false,
    inviterId: undefined
  } as PageData,

  onLoad() {
    this.getUserInfo();
    this.getPointsInfo();
    this.checkTodaySignIn();
    this.generateInviteCode();
    this.checkInviteStatus();
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      });
    }
  },

  getPointsInfo() {
    const points = wx.getStorageSync('points') || 0;
    this.setData({ points });
  },

  checkTodaySignIn() {
    const today = new Date().toDateString();
    const lastSignIn = wx.getStorageSync('lastSignIn');
    this.setData({
      hasCheckedIn: lastSignIn === today
    });
  },

  handleCheckIn() {
    if (this.data.hasCheckedIn) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    const today = new Date().toDateString();
    wx.setStorageSync('lastSignIn', today);
    
    const newPoints = this.data.points + 5;
    wx.setStorageSync('points', newPoints);
    
    this.setData({
      hasCheckedIn: true,
      points: newPoints
    });

    wx.showToast({
      title: '签到成功 +5积分',
      icon: 'success'
    });
  },

  generateInviteCode() {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.setData({ inviteCode: code });
  },

  handleInvite() {
    this.setData({ showInvitePopup: true });
  },

  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({
          title: '邀请码已复制',
          icon: 'success'
        });
      }
    });
  },

  closeInvitePopup() {
    this.setData({ showInvitePopup: false });
  },

  showPrivacyPolicy() {
    this.setData({ showPrivacyPopup: true });
  },

  closePrivacyPopup() {
    this.setData({ showPrivacyPopup: false });
  },

  showInviteCodeInput() {
    const app = getApp<IAppOption>();
    
    // 如果已经使用过邀请码，显示提示
    if (app.globalData.hasUsedInviteCode) {
      wx.showToast({
        title: '您已使用过邀请码',
        icon: 'none'
      });
      return;
    }

    // 如果是从分享链接进入的，显示更友好的提示
    if (app.globalData.inviterId) {
      wx.showModal({
        title: '提示',
        content: '您已通过分享链接获得邀请奖励，无需再次输入邀请码',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    this.setData({ showInviteCodeInputPopup: true });
  },

  closeInviteCodeInputPopup() {
    this.setData({ 
      showInviteCodeInputPopup: false,
      inputInviteCode: ''
    });
  },

  onInviteCodeInput(e: any) {
    this.setData({
      inputInviteCode: e.detail.value.toUpperCase()
    });
  },

  async submitInviteCode() {
    const app = getApp<IAppOption>();
    
    // 如果已经使用过邀请码，直接返回
    if (app.globalData.hasUsedInviteCode) {
      wx.showToast({
        title: '您已使用过邀请码',
        icon: 'none'
      });
      return;
    }

    // 如果是从分享链接进入的，显示更友好的提示
    if (app.globalData.inviterId) {
      wx.showModal({
        title: '提示',
        content: '您已通过分享链接获得邀请奖励，无需再次输入邀请码',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    const code = this.data.inputInviteCode.trim();
    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入6位邀请码',
        icon: 'none'
      });
      return;
    }

    try {
      // 这里应该调用后端API验证邀请码
      // 暂时模拟验证成功
      const newPoints = this.data.points + 20;
      wx.setStorageSync('points', newPoints);
      
      // 标记已使用邀请码
      app.globalData.hasUsedInviteCode = true;
      await simpleSecureStorage.setStorage('hasUsedInviteCode', true);
      
      this.setData({
        points: newPoints,
        showInviteCodeInputPopup: false,
        inputInviteCode: ''
      });

      wx.showToast({
        title: '邀请码验证成功 +20积分',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '邀请码无效',
        icon: 'none'
      });
    }
  },

  navigateToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  updateUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo: UserInfo = {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
        };
        this.setUserInfo(userInfo);
        
        // 保存到本地存储
        simpleSecureStorage.setStorage('userInfo', userInfo);
        
        // 更新全局数据
        const app = getApp<IAppOption>();
        if (app.globalData) {
          app.globalData.userInfo = userInfo as any;
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
        });
      }
    });
  },

  async updateInviteInfo() {
    try {
      const inviteCount = await simpleSecureStorage.getStorage('inviteCount') || 0;
      const invitePercent = Math.min(100, (Number(inviteCount) / userConfig.inviteNumberToBeVip) * 100);
      
      this.setData({
        inviteInfo: {
          inviteCount: Number(inviteCount),
          invitePercent,
        }
      });
    } catch (error) {
      console.error('获取邀请信息失败', error);
    }
  },

  setUserInfo(userInfo: UserInfo) {
    this.setData({
      userInfo
    });
  },

  async onShow() {
    // 每次显示页面时更新邀请信息
    await this.updateInviteInfo();
    
    // 从全局数据获取最新的用户信息
    const app = getApp<IAppOption>();
    if (app.globalData && app.globalData.userInfo) {
      this.setUserInfo(app.globalData.userInfo as unknown as UserInfo);
    }
  },

  onShareAppMessage() {
    const app = getApp<IAppOption>();
    const shareConfig = app.getShareConfig();
    
    return {
      title: shareConfig.title,
      path: shareConfig.path,
      imageUrl: shareConfig.imageUrl
    };
  },

  onShareTimeline() {
    const app = getApp<IAppOption>();
    const shareConfig = app.getShareConfig();
    
    return {
      title: shareConfig.title,
      query: shareConfig.query,
      imageUrl: shareConfig.imageUrl
    };
  },

  async getTrainingStats() {
    try {
      // 这里应该从服务器获取数据，暂时使用模拟数据
      this.setData({
        streakDays: 5,
        aiScore: 7.2,
        totalTopics: 120,
        voiceScore: 7.2,
        topTopics: '旅游、美食',
        lastPractice: '3小时前'
      });
    } catch (error) {
      console.error('获取训练统计失败:', error);
      Toast.fail('获取训练统计失败');
    }
  },

  startPractice() {
    wx.navigateTo({
      url: '/pages/basicPractice/basicPractice'
    });
  },

  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  navigateToPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },

  checkInviteStatus() {
    const app = getApp<IAppOption>();
    this.setData({
      hasUsedInviteCode: app.globalData.hasUsedInviteCode || false,
      inviterId: app.globalData.inviterId
    });
  },
}); 