import API from '../../utils/API';

Page({
  data: { 
    showUpdateAlert: false,
    updateTip: '多多练习吧～'
  },
  onLoad() {
    this.checkUpdateStatus();
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