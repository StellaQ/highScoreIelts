import userConfig from './assets/data/userConfig.js'; // 引入 userConfig.js

App<IAppOption>({
  globalData: {
    userInfo: null,
    numberOfUses: 0
  },

  onLaunch() {
    console.log("小程序启动，检查用户信息");

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.userId) {
      console.log("本地已有用户信息:", userInfo);
      this.globalData.userInfo = userInfo;

      // **✅ 获取 numOfUsesLeftByNew**
      this.fetchNumberOfUses(userInfo);
    } else {
      console.log("无本地用户信息，执行登录流程");
      this.loginAndFetchUserData();
    }
  },
  // **✅ 在小程序关闭时，保存最新的 numberOfUses**
  onHide() {
    if (this.globalData.userInfo && this.globalData.userInfo.userId) {
      const isVip = this.globalData.userInfo.isVip;
      if (isVip) {
        console.log('检测到是vip，不需要缓存和调接口存numOfUsesLeftByNew');
        return
      }
      const newCount = Math.max(this.globalData.numberOfUses - userConfig.basicNumberOfUsesEachDay, 0);
      
      // **🔹 先存入本地缓存，防止后端请求失败数据丢失**
      wx.setStorageSync('numOfUsesLeftByNew', newCount);

      wx.request({
        url: 'http://localhost:3001/api/user/updateNumOfUsesLeftByNew',
        method: 'POST',
        data: {
          userId: this.globalData.userInfo.userId,
          newCount: newCount
        },
        success: (res) => {
          console.log("用户离开时保存 numOfUsesLeftByNew:", res.data.numOfUsesLeftByNew);
        }
      });
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

              // **✅ 确保登录后获取 numOfUsesLeftByNew**
              this.fetchNumberOfUses(userInfo);

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
  },

  // **✅ 获取 numOfUsesLeftByNew**
  fetchNumberOfUses(userInfo) {
    console.log("去后端按userId查询numberOfUses")
    const isVip = userInfo.isVip;
    const userId = userInfo.userId;
    if(isVip){
      console.log("如果是vip,则不用查询，直接返回");
      return
    }
    console.log("如果不是vip,去调api查询");
    // **🔹 先从缓存获取 numberOfUses**
    const cachedNumberOfUses = wx.getStorageSync('numOfUsesLeftByNew');

    if (cachedNumberOfUses !== "" && cachedNumberOfUses !== null) {
      this.globalData.numberOfUses = cachedNumberOfUses + userConfig.basicNumberOfUsesEachDay;;
      console.log("从缓存获取 numberOfUses:", this.globalData.numberOfUses);
    } else {
      console.log("如果不是 VIP，且缓存里没有，去调 API 查询");
      wx.request({
        url: 'http://localhost:3001/api/user/updateNumOfUsesLeftByNew',
        method: 'GET',
        data: { userId },
        success: (res) => {
          if (res.data.numOfUsesLeftByNew !== undefined) {
            this.globalData.numberOfUses = res.data.numOfUsesLeftByNew + userConfig.basicNumberOfUsesEachDay;
            console.log("通过userId调用get api接口获取numberOfUses + userConfig.basicNumberOfUsesEachDay:", this.globalData.numberOfUses);

            // **🔹 把数据存到本地缓存**
            wx.setStorageSync('numOfUsesLeftByNew', res.data.numOfUsesLeftByNew);
          }
        }
      });
    }
  },

  // **✅ 公用方法：减少 numberOfUses**
  decreaseNumberOfUses() {
    if (this.globalData.userInfo?.isVip) {
      return; // **VIP 用户不减少次数**
    }

    if (this.globalData.numberOfUses > 0) {
      this.globalData.numberOfUses -= 1;

      const newCount = Math.max(this.globalData.numberOfUses - userConfig.basicNumberOfUsesEachDay, 0);
      // **🔹 先存入本地缓存，防止后端请求失败数据丢失**
      if (newCount > 0) {
        console.log('每次非vip调用-1次操作时，如果newCount > 0，就缓存numOfUsesLeftByNew：newCount')
        wx.setStorageSync('numOfUsesLeftByNew', newCount);
      }
    } else {
      wx.showToast({
        title: '可用次数不足',
        icon: 'none'
      });
    }
  }
});
