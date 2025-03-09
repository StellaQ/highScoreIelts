App<IAppOption>({
  globalData: {
    userInfo: null,
  },

  onLaunch() {
    console.log("小程序启动，检查用户信息");

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.userId) {
      console.log("本地已有用户信息:", userInfo);
      this.globalData.userInfo = userInfo;
    } else {
      console.log("无本地用户信息，执行登录流程");
      this.loginAndFetchUserData();
    }
  },
  loginAndFetchUserData() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'http://localhost:3001/api/user/getOpenId',
            method: 'POST',
            data: { code: res.code },
            success: (response) => {
              const userInfo = response.data.userInfo;
              wx.setStorageSync('userInfo', userInfo);
              this.globalData.userInfo = userInfo;

              console.log("app.ts接口api/user/getOpenId获取并存储用户数据:", userInfo);

              // **触发回调，通知所有等待的页面**
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(userInfo);
              }
            }
          });
        }
      }
    });
  },

  // **💡 封装全局方法，页面调用这个方法即可**
  getUserInfo(callback: (userInfo: any) => void) {
    if (this.globalData.userInfo) {
      callback(this.globalData.userInfo);
    } else {
      this.userInfoReadyCallback = callback;
    }
  }
});
