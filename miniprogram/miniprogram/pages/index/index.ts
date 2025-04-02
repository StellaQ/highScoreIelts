Page({
  data: { 
  },
  navigateToBasic() {
    wx.navigateTo({
      url: '/pages/listBasic/listBasic'
    });
  },
  navigateToIntermediate() {
    wx.navigateTo({
      url: '/pages/listAdvanced/listAdvanced'
    });
  },
  navigateToAdvanced() {
    wx.navigateTo({
      url: '/pages/listExpert/listExpert'
    });
  },
  startAIPractice() {
    wx.navigateTo({
      url: '/pages/aiSimulation/aiSimulation'
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