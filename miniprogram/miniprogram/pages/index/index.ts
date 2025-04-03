Page({
  data: { 
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