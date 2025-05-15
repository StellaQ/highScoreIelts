import API from '../../utils/API';
import { simpleSecureStorage } from '../../utils/simpleSecureStorage';

const app = getApp<IAppOption>();

Page({
  data: { 
    showUpdateAlert: false,
    updateTip: '多多加油哦～',
    showTargetScoreReminder: false,
    dontRemindAgain: false
  },
  async onLoad() {
    // console.log('0');
    // 等待app.ts中的userInfo准备好
    if (!app.globalData?.userInfo) {
      // console.log('waiting for userInfo');
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (app.globalData?.userInfo) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // 同时也监听callback
        app.userInfoReadyCallback = () => {
          clearInterval(checkInterval);
          resolve();
        };
      });
    }
    
    // console.log('1');
    try {
      const userInfo = await simpleSecureStorage.getStorage('userInfo');
      // console.log('2');
      if (userInfo && userInfo.userId) {
        // console.log('3');
        // 使用新的专门接口查询提醒状态
        const res = await API.checkTargetScoreReminded(userInfo.userId);
        if (res.success && !res.data?.hasTargetScoreReminded) {
          this.setData({
            showTargetScoreReminder: true
          });
        }
      }
      this.checkUpdateStatus();
    } catch (error) {
      console.error('获取用户状态失败:', error);
    }
  },
  onCheckboxChange(e: WechatMiniprogram.CustomEvent<{ value: string[] }>) {
    this.setData({
      dontRemindAgain: e.detail.value.includes('dontRemind')
    });
  },

  async handleReminderConfirm() {
    try {
      const userInfo = await simpleSecureStorage.getStorage('userInfo');
      if (this.data.dontRemindAgain && userInfo && userInfo.userId) {
        await API.updateTargetScoreReminded(userInfo.userId);
      }
      this.setData({
        showTargetScoreReminder: false
      });
      // 跳转到我的页面
      wx.navigateTo({
        url: '/pages/aboutMe/aboutMe'
      });
    } catch (error) {
      console.error('更新提醒状态失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },
  async checkUpdateStatus() {
    try {
      const res = await API.checkIfShowUpdate();
      if (res.success) {
        this.setData({
          showUpdateAlert: res.data.showUpdateAlert,
          updateTip: res.data.updateTip
        });
      }
    } catch (error) {
      console.error('检查更新状态失败:', error);
    }
  },
  navigateToBasic() {
    wx.navigateTo({
      url: '/pages/listBasic/listBasic'
    });
  },
  navigateToExpert() {
    wx.navigateTo({
      url: '/pages/listExpert/listExpert'
    });
  },
  navigateToAdvanced() {
    wx.navigateTo({
      url: '/pages/listAdvanced/listAdvanced'
    });
  },
  // startAIPractice() {
  //   wx.navigateTo({
  //     url: '/pages/aiSimulation/aiSimulation'
  //   });
  // },
  // 普通分享
  onShareAppMessage() {
    return getApp().getShareInfo();
  },
  // 朋友圈分享
  onShareTimeline() {
    return getApp().getTimelineInfo();
  }
});