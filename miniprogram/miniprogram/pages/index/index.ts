Page({
  data: { 
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