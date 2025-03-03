App<IAppOption>({
  globalData: {
    userInfo: null, 
  },
  onLaunch() {
    console.log("小程序启动，检查用户信息");

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.openid) {
      console.log("本地已有用户信息:", userInfo);
      this.globalData.userInfo = userInfo;
    } else {
      console.log("无本地用户信息，执行登录流程");
      this.loginAndFetchUserData();
    }
  },
  loginAndFetchUserData() {
    const that = this;
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: 'http://localhost:3001/api/user/getOpenId',
            method: 'POST',
            data: { code: res.code },
            success(response) {
              const { openid, session_key } = response.data;
              const userInfo = { openid }; 

              wx.setStorageSync('userInfo', userInfo);
              console.log("获取并存储用户数据:", openid, userInfo);
              that.globalData.userInfo = userInfo;
            }
          });
        }
      }
    });
  }
});
