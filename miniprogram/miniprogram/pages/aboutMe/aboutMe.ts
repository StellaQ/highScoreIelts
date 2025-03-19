import { simpleSecureStorage } from '../../utils/simpleSecureStorage';
import Toast from '@vant/weapp/toast/toast';

interface UserInfo {
  userId: string;
  avatarUrl: string;
  nickname: string;
  points: number;
}

interface PageData {
  userInfo: UserInfo;
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
      userId: '',
      avatarUrl: '',
      nickname: '',
      points: 0
    },
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
    const app = getApp<IAppOption>();
    if (app.globalData.userInfo) {
      console.log('aboutMe.ts 获取 app.globalData.userInfo');
      this.setData({
        userInfo: app.globalData.userInfo
      });
      // console.log(this.data.userInfo);
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
    
    const newPoints = this.data.userInfo.points + 5;
    wx.setStorageSync('points', newPoints);
    
    this.setData({
      hasCheckedIn: true,
      'userInfo.points': newPoints
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
      const newPoints = this.data.userInfo.points + 20;
      wx.setStorageSync('points', newPoints);
      
      // 标记已使用邀请码
      app.globalData.hasUsedInviteCode = true;
      await simpleSecureStorage.setStorage('hasUsedInviteCode', true);
      
      this.setData({
        'userInfo.points': newPoints,
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
    if (this.data.userInfo.avatarUrl) {
      // console.log('aboutMe.ts userInfo.avatarUrl有值说明已经更新头像过');
      return;
    };
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        // console.log(res);
        const userInfo: UserInfo = {
          userId: this.data.userInfo.userId,
          avatarUrl: res.userInfo.avatarUrl,
          nickname: res.userInfo.nickName,
          points: this.data.userInfo.points
        };
        
        // 保存到本地存储
        simpleSecureStorage.setStorage('userInfo', userInfo);
        
        // 更新全局数据
        const app = getApp<IAppOption>();
        if (app.globalData) {
          app.globalData.userInfo = userInfo;
        }

        // 更新页面数据
        this.setData({ userInfo });

        // 后端更新用户信息
        wx.request({
          url: 'http://localhost:3001/api/user/updateProfile',
          method: 'POST',
          data: {
            userId: this.data.userInfo.userId,
            nickname: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl
          },
          success: () => {
            console.log('api/user/updateProfile 用户信息更新成功');
          },
          fail: () => {  
            console.error('api/user/updateProfile 用户信息更新失败');
          }
        });
      }
    });
  },

  async onShow() {
    // 从全局数据获取最新的用户信息
    const app = getApp<IAppOption>();
    if (app.globalData && app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },

  onShareAppMessage() {
    const app = getApp<IAppOption>();
    const shareConfig = app.getShareConfig({
      title: '高分英语 - 助你轻松备考！',
      path: '/pages/index/index'
    });
    
    return {
      title: shareConfig.title,
      path: shareConfig.path,
      imageUrl: shareConfig.imageUrl
    };
  },

  onShareTimeline() {
    const app = getApp<IAppOption>();
    const shareConfig = app.getShareConfig({
      title: '高分英语 - 助你轻松备考！',
      query: 'page=about'
    });
    
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