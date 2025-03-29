Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowPopup: false
  },

  /**
   * 显示弹窗
   */
  showPopup() {
    this.setData({
      isShowPopup: true
    });
  },

  /**
   * 隐藏弹窗
   */
  hidePopup() {
    this.setData({
      isShowPopup: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  }
}) 