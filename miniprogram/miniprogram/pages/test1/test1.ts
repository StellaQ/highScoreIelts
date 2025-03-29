Page({
  data: {
    isLoaded: false, // 控制骨架屏显示
  },

  onLoad: function() {
    // 模拟数据加载
    setTimeout(() => {
      this.setData({
        isLoaded: true
      });
    }, 1500); // 1.5秒后显示实际内容
  }
}) 