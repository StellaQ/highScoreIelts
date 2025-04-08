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
  categoryName_cn: string;
  topics: Topic[];
}

interface ProcessedCategory extends Category {
  masteredCount: number;
}

Page({
  data: {
    isLoaded: false,
    categories: [] as ProcessedCategory[],
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
    }
  },

  async fetchCategories(userId: string) {
    try {
      const res = await API.getExpertCategories(userId);
      
      const processedCategories = res.data.categories.map((category: Category) => ({
        ...category,
        masteredCount: category.topics.filter((topic: Topic) => topic.status.state === 4).length
      }));
      
      this.setData({
        categories: processedCategories,
        isLoaded: true
      });
    } catch (error) {
      console.error('获取分类数据失败:', error);
      wx.showToast({
        title: '获取数据失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  onTopicTap(e: WechatMiniprogram.CustomEvent) {
    const topic: Topic = e.currentTarget.dataset.topic;
    
    if (topic.status.state <= 1) {
      wx.navigateTo({
        url: `/pages/detailExpert/detailExpert?topicId=${topic.topicId}&topicName=${encodeURIComponent(topic.topicName)}&topicName_cn=${encodeURIComponent(topic.topicName_cn)}&&state=${topic.status.state}`,
        fail: (err) => {
          console.error('导航失败:', err);
        }
      });
    }
  }
}); 