import API from '../../utils/API';

Page({
  data: {
    isLoaded: false, // 控制骨架屏显示
    categories: [], // 存储分类数据
  },

  onLoad: function() {
    this.fetchCategories();
  },

  // 获取分类数据
  async fetchCategories() {
    try {
      const res = await API.getCategories();
      // console.log('分类数据:', res.data);
      
      // 设置数据并关闭骨架屏
      this.setData({
        categories: res.data.categories,
        isLoaded: true
      });
    } catch (error) {
      console.error('获取分类数据失败:');
      // 即使失败也关闭骨架屏
      this.setData({
        isLoaded: true
      });
      // 显示错误提示
      wx.showToast({
        title: '获取数据失败',
        icon: 'none',
        duration: 2000
      });
    }
  }
}) 