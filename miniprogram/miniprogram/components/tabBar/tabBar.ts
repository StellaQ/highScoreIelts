Component({
  properties: {
    active: {
      type: Number,
      value: 0, // 默认第一个 Tab 被激活
    },
  },
  data: {
    tabBarList: [
      {
        text: 'Part One',
        icon: '/assets/number1.png',
        url: '/pages/partOne/partOne',
      },
      {
        text: 'Part Two',
        icon: '/assets/number2.png',
        url: '/pages/partTwo/partTwo',
      },
      {
        text: 'Part Three',
        icon: '/assets/number3.png',
        url: '/pages/partThree/partThree',
      },
      {
        text: '我的',
        icon: '/assets/user-info.png',
        url: '/pages/aboutMe/aboutMe',
      },
    ],
  },
  methods: {
    onChange(e: any) {
      const index = e.detail; // 获取选中的索引
      const targetUrl = this.data.tabBarList[index].url; // 根据索引获取目标 URL
  
      const pages = getCurrentPages();
      const currentPage = `/${pages[pages.length - 1].route}`;
  
      if (currentPage === targetUrl) {
        console.log('已经在当前页面，无需跳转');
        return;
      }
  
      // 使用 navigateTo 跳转
      wx.navigateTo({
        url: targetUrl,
        fail(err) {
          console.error('页面跳转失败', err);
        },
      });
    },
  },
  
});
