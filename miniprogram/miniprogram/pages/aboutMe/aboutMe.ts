import { simpleSecureStorage } from '../../utils/simpleSecureStorage';
import API from '../../utils/API';

interface PageData {
  userInfo: {
    userId: string;
    nickname: string;
    avatarUrl: string;
    inviteCode: string;
    phone?: string;
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
  isVip: boolean;
  showOfficialAccountPopup: boolean;
  showPhonePopup: boolean;
  qrcodeUrl: string;
  phoneNumber: string;
}

interface PhoneNumberResponse {
  success: boolean;
  phone: string;
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

    inputInviteCode: '',
    isVip: false,    // 添加VIP状态默认值
    vipExpireDate: '',

    showOfficialAccountPopup: false,
    showPhonePopup: false,
    qrcodeUrl: 'https://img.xiaoshuspeaking.site/official.jpg', // 替换为实际的二维码图片URL
    phoneNumber: '',
    hasbindedPhone: false
  },
  onLoad() {
    console.log('aboutMe 页面 onLoad');
    this.getUserInfoFromAppTs();
    this.getVipStatus();
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
  // 获取VIP状态
  async getVipStatus() {
    try {
      const res = await API.getVipStatus(this.data.userInfo.userId);
      this.setData({
        isVip: res.isVip,
        vipExpireDate: res.vipExpireDate
      });
    } catch (error) {
      console.error('获取VIP状态失败:', error);
    }
  },
  // points inviteCode hasCheckedIn streakDays
  async getLatestStatus() {
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
        hasUsedInviteCode: res.hasUsedInviteCode,
        phoneNumber: res.phone,
        hasbindedPhone: !!res.phone
      });
    } catch (error) {
      console.error('getLatestStatus失败:', error);
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
  },
  // 显示公众号弹窗
  showOfficialAccountPopup() {
    this.setData({
      showOfficialAccountPopup: true
    });
  },
  // 关闭公众号弹窗
  closeOfficialAccountPopup() {
    this.setData({
      showOfficialAccountPopup: false
    });
  },
  // 显示手机号弹窗
  showPhonePopup() {
    this.setData({
      showPhonePopup: true
    });
  },
  // 关闭手机号弹窗
  closePhonePopup() {
    this.setData({
      showPhonePopup: false
    });
  },
  // 手机号输入处理
  onPhoneInput(e: any) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },
  // 提交手机号
  async submitPhoneNumber() {
    const phoneNumber = this.data.phoneNumber.trim();
    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    // console.log(phoneNumber);
    try {
      // 调用后端接口保存手机号
      const res = await API.bindPhoneNumber(this.data.userInfo.userId, phoneNumber);
      if (res.success) {
        wx.showToast({
          title: '手机号绑定成功',
          icon: 'success'
        });
        this.setData({
          showPhonePopup: false,
          hasbindedPhone: true
        });
      } else {
        wx.showToast({
          title: res.message || '绑定失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('绑定手机号失败:', error);
      wx.showToast({
        title: '绑定失败，请重试',
        icon: 'error'
      });
    }
  }
}); 