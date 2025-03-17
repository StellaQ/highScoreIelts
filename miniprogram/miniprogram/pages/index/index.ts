import userConfig from '../../assets/data/userConfig';
import { simpleSecureStorage } from '../../utils/simpleSecureStorage';

const app = getApp();

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  isVip: boolean;
  inviteCount: number;
}

interface InviteInfo {
  inviteCount: number;
  invitePercent: number;
}

interface PageData {
  userInfo: UserInfo;
  inviteInfo: InviteInfo;
  inviterId: string;
  hasProgress: boolean;
  continuousDays: number;
  aiScore: number;
  progressRate: number;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  inviteCount?: number;
}

Page({
  data: {
    userInfo: {
      userId: '',
      nickname: '',
      avatarUrl: '',
      isVip: false,
      inviteCount: 0
    },
    inviteInfo: {
      inviteCount: 0,
      invitePercent: 0
    },
    inviterId: '',
    hasProgress: false,
    continuousDays: 0,
    aiScore: 0,
    progressRate: 0
  } as PageData,

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
            isVip: this.data.userInfo.isVip,
            inviteCount: this.data.userInfo.inviteCount
          };
          
          await simpleSecureStorage.setStorage('userInfo', updatedUserInfo);
          this.setData({ userInfo: updatedUserInfo });
        }
      });
    } catch (err) {
      console.warn('用户取消授权或获取失败', err);
    }
  },

  updateInviteInfo(inviteCount: number) {
    const targetInvites = 10;
    const percent = Math.min(Math.round((inviteCount / targetInvites) * 100), 100);
    
    this.setData({
      inviteInfo: {
        inviteCount,
        invitePercent: percent
      }
    });
  },

  setUserInfo(userInfo: UserInfo & { inviteCount?: number }) {
    const inviteCount = userInfo.inviteCount || 0;
    this.setData({
      userInfo: {
        userId: userInfo.userId,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatarUrl,
        isVip: userInfo.isVip,
        inviteCount
      }
    });
    this.updateInviteInfo(inviteCount);
  },

  onLoad(options) {
    if (options.inviterId) {
      this.setData({ inviterId: options.inviterId });
      console.log('url参数，邀请人ID:', options.inviterId);
    }

    app.onUserInfoUpdate((userInfo: UserInfo) => {
      console.log('用户信息已更新:', userInfo);
      this.setUserInfo(userInfo);
    });

    app.getUserInfo((userInfo: UserInfo & { inviteCount?: number }) => {
      console.log("index页面从app.ts获取用户信息:", userInfo);
      this.setUserInfo(userInfo);
      
      if (this.data.inviterId) {
        this.handleInvite();
      }
    });
  },

  onShow() {
    // 页面显示时更新数据
    this.loadUserProgress();
  },

  loadUserProgress() {
    // 这里可以从本地存储或服务器获取用户进度
    const progress = wx.getStorageSync('userProgress');
    if (progress) {
      this.setData({
        hasProgress: true,
        continuousDays: progress.continuousDays || 3,
        aiScore: progress.aiScore || 7.5,
        progressRate: progress.progressRate || 15
      });
    }
  },

  startPractice() {
    // 跳转到练习模式选择页面
    wx.navigateTo({
      url: '/pages/practiceMode/practiceMode'
    });
  },

  startAIPractice() {
    wx.navigateTo({
      url: '/pages/aiSimulation/aiSimulation'
    });
  },

  navigateToBasic() {
    wx.navigateTo({
      url: '/pages/basicPractice/basicPractice'
    });
  },

  navigateToIntermediate() {
    wx.navigateTo({
      url: '/pages/advancedPractice/advancedPractice'
    });
  },

  navigateToAdvanced() {
    wx.navigateTo({
      url: '/pages/expertPractice/expertPractice'
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI口语助手 - 让你的英语口语更流利',
      path: '/pages/index/index',
      imageUrl: '/images/share-image.png'
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