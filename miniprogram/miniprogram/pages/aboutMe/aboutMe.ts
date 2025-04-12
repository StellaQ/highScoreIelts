import { simpleSecureStorage } from '../../utils/simpleSecureStorage';
import API from '../../utils/API';

interface PageData {
  userInfo: {
    userId: string;
    nickname: string;
    avatarUrl: string;
    inviteCode: string;
  };
  configSignInPoints: number;
  configInvitePoints: number;
  points: number;
  hasCheckedIn: boolean;
  inviteCode: string;
  recentInvites: number;
  totalInvites: number;
  streakDays: number;
  inputInviteCode: string;
}

Page({
  data: {
    userInfo: {
      userId: '',
      avatarUrl: '',
      nickname: ''
    },            // 和app.ts的userInfo同步
    
    configSignInPoints: 0, // 每天签到+积分数
    configInvitePoints: 0,    // 邀请一个好友得到的积分数

    points: 0,    // aboutMe.ts 积分数
    hasCheckedIn: false,    // 判断今日是否已签到

    inviteCode: '',     // 邀请好友的邀请码
    recentInvites: 0,   // 最近3天邀请到的新用户数
    totalInvites: 0,    // 总的邀请到的新用户数

    hasUsedInviteCode: false,   // 用户已经使用了邀请码

    streakDays: 0,          // 连续训练 天数
    totalTopics: 0,         // 练习话题 个数
    aiScore: 0,             // AI模拟考分数
    lastPractice: '暂无',    // 最近练习

    showInvitePopup: false,   // 弹窗：邀请好友
    showInviteCodeInputPopup: false,  // 弹窗：填写收到的邀请码
    showPrivacyPopup: false,  // 弹窗：隐私政策

    inputInviteCode: ''
  },
  onLoad() {
    console.log('aboutMe 页面 onLoad');
    this.getUserInfoFromAppTs();
    this.getLatestStatus();
    this.checkInvites();
  },
  // 从app.ts获取userInfo
  getUserInfoFromAppTs() {
    const app = getApp<IAppOption>();
    if (app.globalData.userInfo) {
      console.log('aboutMe.ts 获取 app.globalData.userInfo');
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },
  // points inviteCode hasCheckedIn streakDays
  async getLatestStatus() {
    // 先从缓存获取用户信息
    const cachedTodayStatus = await simpleSecureStorage.getStorage('todayStatus');
    // console.log(cachedTodayStatus);
    if (cachedTodayStatus) {
      // console.log('每次aboutMe页面onLoad,若缓存存在，先赋值缓存cachedTodayStatus')
      this.setData({
        points: cachedTodayStatus.points,
        configSignInPoints: cachedTodayStatus.configSignInPoints,
        configInvitePoints: cachedTodayStatus.configInvitePoints,
        inviteCode: cachedTodayStatus.inviteCode,
        hasCheckedIn: cachedTodayStatus.hasCheckedIn,
        totalTopics: cachedTodayStatus.totalTopics,
        streakDays: cachedTodayStatus.streakDays,
        hasUsedInviteCode: cachedTodayStatus.hasUsedInviteCode
      });
    };
    try {
      // console.log('每次aboutMe页面onLoad,再请求后端api')
      const res = await API.getLatestStatus(this.data.userInfo.userId);
      this.setData({
        points: res.points,
        configSignInPoints: res.configSignInPoints,
        configInvitePoints: res.configInvitePoints,
        inviteCode: res.inviteCode,
        hasCheckedIn: res.hasCheckedIn,
        totalTopics: res.totalTopics,
        streakDays: res.streakDays,
        hasUsedInviteCode: res.hasUsedInviteCode
      });
      const todayStatus = {
        points: res.points,
        configSignInPoints: res.configSignInPoints,
        configInvitePoints: res.configInvitePoints,
        inviteCode: res.inviteCode,
        hasCheckedIn: res.hasCheckedIn,
        totalTopics: res.totalTopics,
        streakDays: res.streakDays,
        hasUsedInviteCode: res.hasUsedInviteCode
      }
      await simpleSecureStorage.setStorage('todayStatus', todayStatus);
    } catch (error) {
      // console.error('getLatestStatus失败:', error);
    }
  },
  // [邀请好友]下的邀请好友总数&最近3天邀请好友总数
  async checkInvites() {
    try {
      const res = await API.checkInvites(this.data.userInfo.userId);
      this.setData({
        recentInvites: res.recentInvites,
        totalInvites: res.totalInvites
      });
      // 显示鼓励信息
      if (res.newInvites > 0) {
        wx.showToast({
          title: `您有 ${res.newInvites} 位新朋友通过您的邀请加入！`,
          icon: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Failed to check new invites:', error);
    }
  },
  // [每日签到]
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
        title: '签到成功 +' + this.data.configSignInPoints + '积分',
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
  // [邀请好友]
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
  // [隐私政策]
  showPrivacyPolicy() {
    this.setData({ showPrivacyPopup: true });
  },
  closePrivacyPopup() {
    this.setData({ showPrivacyPopup: false });
  },
  // [填写您收到的邀请码]
  showInviteCodeInput() {
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
    const code = this.data.inputInviteCode.trim();
    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入6位邀请码',
        icon: 'none'
      });
      return;
    }

    try {
      const res = await API.verifyInviteCode(this.data.userInfo.userId, code);
      
      // 更新页面数据
      this.setData({
        points: res.points,
        hasUsedInviteCode: true,
        showInviteCodeInputPopup: false,
        inputInviteCode: ''
      });

      // 更新缓存中的状态
      const todayStatus = await simpleSecureStorage.getStorage('todayStatus') || {};
      await simpleSecureStorage.setStorage('todayStatus', {
        ...todayStatus,
        points: res.points,
        hasUsedInviteCode: true
      });

      wx.showToast({
        title: '邀请码验证成功 +' + this.data.configInvitePoints + '积分',
        icon: 'success'
      });
    } catch (error: any) {
      wx.showToast({
        title: error.message || '邀请码验证失败',
        icon: 'none'
      });
    }
  },
  // [反馈与建议]
  navigateToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
    // wx.openEmbeddedMiniProgram({
    //   appId: 'wx8abaf00ee8c3202e',  // 微信官方反馈收集小程序的 appId
    //   extraData: {
    //     id: '740829'  // 这里填写你的小程序的 sourceId
    //   }
    // });
  },
  // 更新头像
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
        API.updateProfile(this.data.userInfo.userId, this.data.userInfo.nickname, this.data.userInfo.avatarUrl)
          .then(res => {
            console.log('api/user/updateProfile 用户信息更新成功');
          })
          .catch(err => {  
            console.error('api/user/updateProfile 用户信息更新失败');
          });
      }
    });
  },
  // 普通分享
  onShareAppMessage() {
    return getApp().getShareInfo();
  },
  // 朋友圈分享
  onShareTimeline() {
    return getApp().getTimelineInfo();
  }
}); 