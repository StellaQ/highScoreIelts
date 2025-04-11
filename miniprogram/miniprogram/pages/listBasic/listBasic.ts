import API from '../../utils/API';

interface IAppOption {
  globalData: {
    userInfo: {
      userId: string;
    };
  };
}

interface Topic {
  topicId: string;
  topicName: string;
  topicName_cn: string;
  status: {
    state: number;
    progress: number;
    practiceCount: number;
  };
}

interface Category {
  categoryId: string;
  categoryName: string;
  categoryNameInChinese: string;
  topics: Topic[];
}

interface ProcessedCategory extends Category {
  masteredCount: number;
}

Page({
  data: {
    isLoaded: false, // 控制骨架屏显示
    categories: [] as ProcessedCategory[], // 存储分类数据
  },

  onLoad: function() {
    const app = getApp<IAppOption>();
    const userId = app.globalData.userInfo?.userId;
    if (userId) {
      this.fetchCategories(userId);
    } else {
      console.error('未获取到userId');
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none',
        duration: 2000
      });
      // 即使失败也关闭骨架屏
      // this.setData({
      //   isLoaded: true
      // });
    }
  },

  // 获取分类数据
  async fetchCategories(userId: string) {
    try {
      const res = await API.getBasicCategories(userId);
      // console.log('分类数据:', res.data);
      
      // 处理数据，计算每个分类的已掌握题目数量
      const processedCategories = res.data.categories.map((category: Category) => ({
        ...category,
        masteredCount: category.topics.filter((topic: Topic) => topic.status.state === 4).length
      }));
      
      // 设置数据并关闭骨架屏
      this.setData({
        categories: processedCategories,
        isLoaded: true
      });
    } catch (error) {
      console.error('获取分类数据失败:', error);
      // 即使失败也关闭骨架屏
      // this.setData({
      //   isLoaded: true
      // });
      // 显示错误提示
      wx.showToast({
        title: '获取数据失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 处理话题卡片点击
  onTopicTap(e: WechatMiniprogram.CustomEvent) {
    const topic: Topic = e.currentTarget.dataset.topic;
    
    // 只有state为0、1的话题可以跳转
    if (topic.status.state <= 1) {
      wx.navigateTo({
        url: `/pages/detailBasic/detailBasic?topicId=${topic.topicId}&topicName=${encodeURIComponent(topic.topicName)}&topicName_cn=${encodeURIComponent(topic.topicName_cn)}&&state=${topic.status.state}`,
        fail: (err) => {
          // console.error('导航失败:', err);
          // wx.showToast({
          //   title: '导航失败',
          //   icon: 'none',
          //   duration: 2000
          // });
        }
      });
    }
  },
  // 普通分享
  onShareAppMessage() {
    return getApp().getShareInfo();
  },
  // 朋友圈分享
  onShareTimeline() {
    return getApp().getTimelineInfo();
  }
}) 