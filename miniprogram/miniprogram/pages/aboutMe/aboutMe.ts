import { simpleSecureStorage } from '../../utils/simpleSecureStorage';
import API from '../../utils/API';

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      inviteCode: '',
      nickname: '',
      userId: ''
    },            // 和app.ts的userInfo同步

    isVip: false,    // 添加VIP状态默认值

    // vip会员
    vipExpireDate: '',
    vipConfig: {
      seasonPrice: 0,    // 季卡价格
      yearlyPrice: 0,    // 年卡价格
      seasonName: '季卡',    // 季卡名称
      yearlyName: '年卡'     // 年卡名称
    },
    // 非vip会员的用户
    configSignInPoints: 0, // 每天签到+积分数 API.getLatestStatus
    configInvitePoints: 0,    // 邀请一个好友得到的积分数 API.getLatestStatus

    points: 0,    // 非vip用户的积分数 API.getLatestStatus
    hasCheckedIn: false,    // 判断今日是否已签到 API.getLatestStatus

    recentInvites: 0,   // 最近3天邀请到的新用户数 API.getLatestStatus
    totalInvites: 0,    // 总的邀请到的新用户数 API.getLatestStatus

    inputInviteCode: '',
    hasUsedInviteCode: false,   // 用户已经使用了邀请码 API.getLatestStatus

    streakDays: 0,          // 连续训练 天数 API.getLatestStatus 不用

    showInvitePopup: false,   // 弹窗：邀请好友
    showInviteCodeInputPopup: false,  // 弹窗：填写收到的邀请码

    // 会员与非会员都需要的字段
    totalTopics: 0,         // 练习话题 个数 API.getLatestStatus

    showPrivacyPopup: false,  // 弹窗：隐私政策
    showOfficialAccountPopup: false,  // 弹窗：公众号二维码
    qrcodeUrl: 'https://img.xiaoshuspeaking.site/official.jpg', // 公众号二维码图片URL
    hasAgreed: false, // 会员订阅同意付款协议

    targetScore: 6,  // 默认目标分数
    showTargetScoreHelp: false,  // 目标分说明弹窗显示状态
  },
  async onLoad() {
    this.getUserInfoFromAppTs();
    try {
      await this.getUserState();
    } catch (error) {
      console.error('加载用户最新状态失败:', error);
    }
  },
  // 从app.ts获取userInfo
  getUserInfoFromAppTs() {
    const app = getApp<IAppOption>();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },
  // 获取用户完整状态
  async getUserState() {
    try {
      // 1. 先获取VIP状态
      const vipRes = await API.getVipStatus(this.data.userInfo.userId);
      const isVip = vipRes.isVip;
      
      // 2. 更新VIP相关状态
      this.setData({
        isVip,
        vipExpireDate: vipRes.vipExpireDate,
        vipConfig: vipRes.vipConfig
      });

      // 3. 获取用户最新状态
      const statusRes = await API.getLatestStatus(this.data.userInfo.userId);
      
      // 4. 更新通用数据
      this.setData({
        totalTopics: statusRes.totalTopics,
        targetScore: statusRes.targetScore || 6  // 添加目标分的获取
      });

      // 5. 如果不是VIP，更新积分相关数据
      if (!isVip) {
        this.setData({
          points: statusRes.points,
          configSignInPoints: statusRes.configSignInPoints,
          configInvitePoints: statusRes.configInvitePoints,
          hasCheckedIn: statusRes.hasCheckedIn,
          streakDays: statusRes.streakDays,
          hasUsedInviteCode: statusRes.hasUsedInviteCode
        });

        // 6. 获取邀请数据
        const invitesRes = await API.checkInvites(this.data.userInfo.userId);
        this.setData({
          recentInvites: invitesRes.recentInvites,
          totalInvites: invitesRes.totalInvites
        });

        // 7. 显示新邀请用户提示
        if (invitesRes.newInvites > 0) {
          wx.showToast({
            title: `您有 ${invitesRes.newInvites} 位新朋友通过您的邀请加入！`,
            icon: 'success',
            duration: 2000
          });
        }
      }
    } catch (error) {
      console.error('获取用户状态失败:', error);
      throw error; // 向上传递错误，让onLoad统一处理
    }
  },
  async onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;
  
    try {
      const qiniuUrl = await API.uploadAvatarToServer(avatarUrl);
      console.log('上传成功，七牛地址:', qiniuUrl);
  
      const userInfo = {
        userId: this.data.userInfo.userId,
        avatarUrl: qiniuUrl, // 替换为七牛地址
        nickname: this.data.userInfo.nickname
      };
  
      this.updateUserInfo(userInfo); // 上传成功后再执行
    } catch (err) {
      console.error('上传头像失败', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },
  onChooseNickname(e: any) {
    console.log(e.detail);
    if (e.detail.cursor === 0) {
      return;
    };
    const nickname = e.detail.value;
    const userInfo = {
      userId: this.data.userInfo.userId,
      avatarUrl: this.data.userInfo.avatarUrl,
      nickname: nickname
    };
    this.updateUserInfo(userInfo);
  },
  updateUserInfo (userInfo: any) {
    // 更新页面数据
    this.setData({ userInfo });

    // 更新全局数据
    const app = getApp<IAppOption>();
    if (app.globalData) {
      app.globalData.userInfo = userInfo;
    };

    // 保存到本地存储
    simpleSecureStorage.setStorage('userInfo', userInfo);

    // 后端更新用户信息
    API.updateProfile(userInfo.userId, userInfo.nickname, userInfo.avatarUrl)
      .then(res => {
        console.log('api/user/updateProfile 用户信息更新成功');
      })
      .catch(err => {  
        console.error('api/user/updateProfile 用户信息更新失败');
      });
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
      data: this.data.userInfo.inviteCode,
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
        title: '邀请码验证成功,得 +' + this.data.configInvitePoints + '积分',
        icon: 'success'
      });
    } catch (error: any) {
      wx.showToast({
        title: error.message || '邀请码验证失败',
        icon: 'none'
      });
    }
  },
  // 普通分享
  onShareAppMessage() {
    return getApp().getShareInfo();
  },
  // 朋友圈分享
  onShareTimeline() {
    return getApp().getTimelineInfo();
  },
  // 显示会员订阅弹窗
  showVipSubscribePopup() {
    this.setData({
      showVipSubscribePopup: true,
      hasAgreed: false
    });
  },
  // 关闭会员订阅弹窗
  closeVipSubscribePopup() {
    this.setData({
      showVipSubscribePopup: false
    });
  },
  // 处理协议勾选
  onAgreementChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      hasAgreed: e.detail.value.length > 0
    });
  },
  // 处理订阅
  async handleSubscribe(e: WechatMiniprogram.CustomEvent) {
    if (!this.data.hasAgreed) {
      wx.showToast({
        title: '请先同意服务说明',
        icon: 'none'
      });
      return;
    }

    const subscribeType = e.currentTarget.dataset.type as 'season' | 'yearly';
    
    try {
      // console.log('[支付流程] 开始创建订单:', {
      //   userId: this.data.userInfo.userId,
      //   subscribeType
      // });

      wx.showLoading({
        title: '订单创建中...',
        mask: true
      });

      // 调用自己的后端API创建订单
      const res = await API.createVipOrder(this.data.userInfo.userId, subscribeType);
      // console.log('[支付流程] 创建订单结果:', res);

      if (res.code === 0 && res.data) {
        const { payParams, orderId } = res.data;
        if (!orderId) {
          // console.error('[支付流程] 订单创建成功但未返回orderId');
          throw new Error('订单创建异常');
        }
        
        // console.log('[支付流程] 订单创建成功，准备调起支付:', {
        //   orderId,
        //   payParams: { ...payParams, signType: payParams.signType }
        // });
        
        // 调起支付
        wx.requestPayment({
          ...payParams,
          success: async () => {
            // console.log('[支付流程] 微信支付成功，开始更新会员状态:', {
            //   userId: this.data.userInfo.userId,
            //   orderId
            // });
            
            try {
              // 调用支付成功接口，传入 orderId
              const updateRes = await API.updatePaymentSuccess(this.data.userInfo.userId, orderId);
              console.log('[支付流程] 更新会员状态结果:', updateRes);
              
              if (updateRes.success) {
                console.log('[支付流程] 会员状态更新成功:', {
                  isVip: updateRes.isVip,
                  vipExpireDate: updateRes.vipExpireDate
                });
                
                // 更新本地VIP状态
                this.setData({
                  isVip: updateRes.isVip,
                  vipExpireDate: updateRes.vipExpireDate,
                  showVipSubscribePopup: false
                });
                wx.showToast({
                  title: '开通成功',
                  icon: 'success'
                });
              } else {
                console.error('[支付流程] 会员状态更新失败:', updateRes);
                wx.showToast({
                  title: '状态更新失败',
                  icon: 'error'
                });
              }
            } catch (error) {
              console.error('[支付流程] 更新会员状态异常:', error);
              wx.showToast({
                title: '状态更新失败',
                icon: 'error'
              });
            }
          },
          fail: (res: WechatMiniprogram.GeneralCallbackResult) => {
            console.error('[支付流程] 微信支付失败:', res);
            wx.showToast({
              title: '支付失败',
              icon: 'error'
            });
          }
        });
      } else {
        console.error('[支付流程] 创建订单失败:', res);
        throw new Error(res.message || '创建订单失败');
      }
    } catch (error: unknown) {
      console.error('[支付流程] 订阅过程异常:', error);
      wx.showToast({
        title: '订阅失败，请稍后重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
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
  // 显示目标分说明
  showTargetScoreHelp() {
    this.setData({
      showTargetScoreHelp: true
    });
  },
  // 关闭目标分说明
  closeTargetScoreHelp() {
    this.setData({
      showTargetScoreHelp: false
    });
  },
  // 减少目标分
  decreaseScore() {
    const currentScore = this.data.targetScore;
    if (currentScore > 6) {
      const newScore = Math.round((currentScore - 0.5) * 10) / 10;
      this.setData({
        targetScore: newScore
      });
      this.updateTargetScore(newScore);
    }
  },
  // 增加目标分
  increaseScore() {
    const currentScore = this.data.targetScore;
    if (currentScore < 9) {
      const newScore = Math.round((currentScore + 0.5) * 10) / 10;
      this.setData({
        targetScore: newScore
      });
      this.updateTargetScore(newScore);
    }
  },
  // 更新目标分到后端
  async updateTargetScore(score: number) {
    try {
      await API.updateTargetScore(this.data.userInfo.userId, score);
    } catch (error) {
      console.error('更新目标分失败:', error);
      // wx.showToast({
      //   title: '更新失败',
      //   icon: 'error'
      // });
    }
  },
}); 