import { simpleSecureStorage } from '../../utils/simpleSecureStorage';
import Toast from '@vant/weapp/toast/toast';
import API from '../../utils/API';

Page({
  data: {
    userInfo: {
      userId: '',
      avatarUrl: '',
      nickname: ''
    },            // 和app.ts的userInfo同步
    
    configCheckedInNum: 20, // 每天签到+积分数
    configInviteNum: 50,    // 邀请一个好友得到的积分数

    points: 0,    // aboutMe.ts 积分数
    hasCheckedIn: false,    // 判断今日是否已签到
    inviteCode: '',     // 邀请好友的邀请码

    streakDays: 0,          // 连续训练 天数
    totalTopics: 0,         // 练习话题 个数
    aiScore: 0,             // AI模拟考分数
    lastPractice: '暂无',    // 最近练习

    showInvitePopup: false,   // 弹窗：邀请好友
    showInviteCodeInputPopup: false,  // 弹窗：填写收到的邀请码
    showPrivacyPopup: false,  // 弹窗：隐私政策

    hasUsedInviteCode: false,
    inputInviteCode: '',
    inviterId: ''
  },
  onLoad() {
    console.log('aboutMe 页面 onLoad');
    this.getUserInfoFromAppTs();
    this.getLatestStatus();
    this.checkInviteStatus();
  },
  getUserInfoFromAppTs() {
    const app = getApp<IAppOption>();
    if (app.globalData.userInfo) {
      console.log('aboutMe.ts 获取 app.globalData.userInfo');
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },
  async getLatestStatus() {
    // 先从缓存获取用户信息
    const cachedTodayStatus = await simpleSecureStorage.getStorage('todayStatus');
    // console.log(cachedTodayStatus);
    if (cachedTodayStatus) {
      // console.log('每次aboutMe页面onLoad,若缓存存在，先赋值缓存cachedTodayStatus')
      this.setData({
        points: cachedTodayStatus.points,
        inviteCode: cachedTodayStatus.points,
        hasCheckedIn: cachedTodayStatus.hasCheckedIn,
        streakDays: cachedTodayStatus.streakDays
      });
    };
    try {
      // console.log('每次aboutMe页面onLoad,再请求后端api')
      const res = await API.getLatestStatus(this.data.userInfo.userId);
      this.setData({
        points: res.points,
        inviteCode: res.inviteCode,
        hasCheckedIn: res.hasCheckedIn,
        streakDays: res.streakDays
      });
      const todayStatus = {
        points: res.points,
        inviteCode: res.inviteCode,
        hasCheckedIn: res.hasCheckedIn,
        streakDays: res.streakDays
      }
      await simpleSecureStorage.setStorage('todayStatus', todayStatus);
    } catch (error) {
      // console.error('检查签到状态失败:', error);
    }
  },
  async handleCheckIn() {
    try {
      if (this.data.hasCheckedIn) {
        wx.showToast({
          title: '今日已签到',
          icon: 'none'
        });
        return;
      }

      const res = await API.signIn(this.data.userInfo.userId);
      
      // 更新页面数据
      this.setData({
        points: res.points,
        hasCheckedIn: true,
        streakDays: res.streakDays
      }); 
      // 更新缓存
      const cachedTodayStatus = await simpleSecureStorage.getStorage('todayStatus');
      if(cachedTodayStatus) {
        cachedTodayStatus.points = res.points,
        cachedTodayStatus.hasCheckedIn = true,
        cachedTodayStatus.streakDays = res.streakDays
      }
      await simpleSecureStorage.setStorage('todayStatus', cachedTodayStatus);

      wx.showToast({
        title: '签到成功 +' + this.data.configCheckedInNum + '积分',
        icon: 'success'
      });
    } catch (error) {
      console.error('签到失败:', error);
      wx.showToast({
        title: '签到失败，请重试',
        icon: 'error'
      });
    }
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
      const newPoints = this.data.userInfo.points + this.data.configInviteNum;
      
      // 更新全局数据
      if (app.globalData.userInfo) {
        app.globalData.userInfo.points = newPoints;
      }
      
      // 更新缓存
      const updatedUserInfo = {
        ...this.data.userInfo,
        points: newPoints
      };
      await simpleSecureStorage.setStorage('userInfo', updatedUserInfo);
      
      // 标记已使用邀请码
      app.globalData.hasUsedInviteCode = true;
      await simpleSecureStorage.setStorage('hasUsedInviteCode', true);
      
      // 更新页面数据
      this.setData({
        'userInfo.points': newPoints,
        showInviteCodeInputPopup: false,
        inputInviteCode: ''
      });

      wx.showToast({
        title: '邀请码验证成功 +' + this.data.configInviteNum +'积分',
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
        const userInfo = {
          userId: this.data.userInfo.userId,
          avatarUrl: res.userInfo.avatarUrl,
          nickname: res.userInfo.nickName
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

  // 处理刷新邀请
  async handleRefreshInvite() {
    try {
      const userId = this.data.userInfo.userId;
      const res = await API.getUserInviteCount(userId);
      
      if (res && res.inviteCount > 0) {
        // 计算新增的邀请数
        const newInvites = res.inviteCount;
        const pointsToAdd = newInvites * this.data.configInviteNum;
        
        // 更新用户积分
        const newPoints = this.data.userInfo.points + pointsToAdd;
        
        // 更新全局数据
        const app = getApp<IAppOption>();
        app.globalData.userInfo.points = newPoints;
        
        // 更新本地缓存
        const updatedUserInfo = {
          ...this.data.userInfo,
          points: newPoints
        };
        await simpleSecureStorage.setStorage('userInfo', updatedUserInfo);
        
        // 更新页面数据
        this.setData({
          'userInfo.points': newPoints
        });

        wx.showToast({
          title: `获得${pointsToAdd}积分`,
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '暂无新的邀请',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('刷新邀请失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      });
    }
  },
}); 