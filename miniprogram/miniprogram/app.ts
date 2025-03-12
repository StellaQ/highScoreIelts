import userConfig from './assets/data/userConfig.js'; // 引入 userConfig.js
import { simpleSecureStorage } from './utils/simpleSecureStorage';

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  isVip: boolean;
  inviteCount: number;
}

interface IAppOption {
  globalData: {
    userInfo?: UserInfo;
    numberOfUses: number;
    [key: string]: any;
  };
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;
  loginAndFetchUserData: () => void;
  fetchNumberOfUses: (userInfo: UserInfo) => void;
  decreaseNumberOfUses: () => void;
  getUserInfo: (callback: (userInfo: UserInfo) => void) => void;
  onNumberOfUsesChange: (callback: (value: number) => void) => void;
  updateNumberOfUses: (value: number) => void;
}

// 创建一个简单的事件总线
const eventBus = {
  listeners: {} as Record<string, Function[]>,
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

App<IAppOption>({
  globalData: {
    userInfo: undefined,
    numberOfUses: 0
  },

  // 注册观察者
  onNumberOfUsesChange(callback: (value: number) => void) {
    eventBus.on('numberOfUsesChange', callback);
  },

  // 更新numberOfUses的方法
  updateNumberOfUses(value: number) {
    this.globalData.numberOfUses = value;
    eventBus.emit('numberOfUsesChange', value);
  },

  async onLaunch() {
    console.log("小程序启动，检查用户信息");

    const userInfo = await simpleSecureStorage.getStorage('userInfo') as UserInfo | null;
    if (userInfo && userInfo.userId) {
      console.log("本地缓存已有用户信息:", userInfo);
      this.globalData.userInfo = userInfo;
      this.fetchNumberOfUses(userInfo);
    } else {
      console.log("无本地用户信息，执行登录流程");
      this.loginAndFetchUserData();
    }
  },
  // **✅ 在小程序关闭时，保存最新的 numberOfUses**
  async onHide() {
    if (this.globalData.userInfo && this.globalData.userInfo.userId) {
      const isVip = this.globalData.userInfo.isVip;
      if (isVip) {
        console.log('检测到是vip，不需要缓存和调接口存numOfUsesLeftByNew');
        return
      }
      const newCount = Math.max(this.globalData.numberOfUses - userConfig.basicNumberOfUsesEachDay, 0);
      
      // **🔹 先存入本地缓存，防止后端请求失败数据丢失**
      if (newCount > 0) {
        console.log('每次非vip调用-1次操作时，如果newCount > 0，就缓存numOfUsesLeftByNew：newCount')
        await simpleSecureStorage.setStorage('numOfUsesLeftByNew', newCount);
      }

      wx.request({
        url: 'http://localhost:3001/api/user/updateNumOfUsesLeftByNew',
        method: 'POST',
        data: {
          userId: this.globalData.userInfo.userId,
          newCount: newCount
        },
        success: (res: any) => {
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
            success: async (response: any) => {
              const userInfo = response.data.userInfo;
              await simpleSecureStorage.setStorage('userInfo', userInfo);
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
  getUserInfo(callback: (userInfo: UserInfo) => void) {
    if (this.globalData.userInfo) {
      callback(this.globalData.userInfo);
    } else {
      this.userInfoReadyCallback = callback;
    }
  },

  // **✅ 获取 numOfUsesLeftByNew**
  async fetchNumberOfUses(userInfo: UserInfo) {
    console.log("去后端按userId查询numberOfUses:")
    const isVip = userInfo.isVip;
    const userId = userInfo.userId;
    if(isVip){
      console.log("如果是vip,则不用查询，直接返回");
      return
    }
    console.log("如果不是vip,去后端按userId查询numberOfUses");
    // **🔹 先从缓存获取 numberOfUses**
    const cachedNumberOfUses = await simpleSecureStorage.getStorage('numOfUsesLeftByNew') as number | null;

    if (cachedNumberOfUses !== null) {
      this.updateNumberOfUses(cachedNumberOfUses + userConfig.basicNumberOfUsesEachDay);
      // console.log(cachedNumberOfUses);
      // console.log(this.globalData.numberOfUses);
      console.log("从缓存获取 numberOfUses:", this.globalData.numberOfUses);
    } else {
      console.log("如果不是 VIP，且缓存里没有，去调 API 查询");
      wx.request({
        url: 'http://localhost:3001/api/user/updateNumOfUsesLeftByNew',
        method: 'GET',
        data: { userId },
        success: async (res: any) => {
          if (res.data.numOfUsesLeftByNew !== undefined) {
            const newValue = res.data.numOfUsesLeftByNew + userConfig.basicNumberOfUsesEachDay;
            this.updateNumberOfUses(newValue); // 使用新方法更新值
            console.log("通过userId调用get api接口获取numberOfUses + userConfig.basicNumberOfUsesEachDay:", this.globalData.numberOfUses);

            // **🔹 把数据存到本地缓存**
            await simpleSecureStorage.setStorage('numOfUsesLeftByNew', res.data.numOfUsesLeftByNew);
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
        simpleSecureStorage.setStorage('numOfUsesLeftByNew', newCount);
      }
    } else {
      wx.showToast({
        title: '可用次数不足',
        icon: 'none'
      });
    }
  }
});
