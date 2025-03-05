Page({
  data: {
    userInfo: {
      userId: '',
      nickname: '',
      avatarUrl: '',
      isVip: false
    },
    active: 3
  },
  async updateUserProfile() {
    try {
      let storedUserInfo = wx.getStorageSync('userInfo');
  
      // **⚡ 这里判断是否真的有完整的用户信息**
      if (storedUserInfo && storedUserInfo.nickname && storedUserInfo.avatarUrl) {
        console.log('用户已授权，使用本地存储信息:', storedUserInfo);
        return; // 直接返回，不再重复 `setData`
      }
  
      // **如果本地信息不完整，调用 wx.getUserProfile**
      const res = await wx.getUserProfile({
        desc: '用于完善个人资料'
      });
  
      console.log('从 wx.getUserProfile 获取的用户信息:', res);
      const { avatarUrl, nickName } = res.userInfo;
  
      // **更新数据库**
      await wx.request({
        url: 'http://localhost:3001/api/user/updateProfile',
        method: 'POST',
        data: {
          userId: this.data.userInfo.userId,
          nickname: nickName,
          avatarUrl: avatarUrl
        },
        success: () => {
          console.log('用户信息更新成功');
  
          // **更新本地存储**
          const updatedUserInfo = {
            userId: this.data.userInfo.userId,
            nickname: nickName,
            avatarUrl: avatarUrl
          };
          wx.setStorageSync('userInfo', updatedUserInfo);
  
          // **更新页面显示**
          this.setData({ userInfo: updatedUserInfo });
        }
      });
    } catch (err) {
      console.warn('用户取消授权或获取失败', err);
    }
  },  
  // generateRandomNickname() {
  //   const nicknames = ['冒险家', '小小探索者', '智慧达人'];
  //   return nicknames[Math.floor(Math.random() * nicknames.length)];
  // },
  setUserInfo(userInfo: { userId: any; isVip: any; nickname: any; avatarUrl: any; }) {
    this.setData({
      userInfo: {
        userId: userInfo.userId,
        isVip: userInfo.isVip,
        nickname: userInfo.nickname,
        // nickname: userInfo.nickname || this.generateRandomNickname(),
        avatarUrl: userInfo.avatarUrl || '../../assets/user2.png'
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    const app = getApp();

    app.getUserInfo((userInfo: { userId: any; isVip: any; nickname: any; avatar: any; }) => {
      console.log("aboutMe页面获取用户信息:", userInfo);
      this.setUserInfo(userInfo);
    });
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
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage(opts): WechatMiniprogram.Page.ICustomShareContent {
  //   console.log(opts.target)
  //   return {}
  // }
})