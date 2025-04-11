// pages/detailExpert/detailExpert.ts
import API from '../../utils/API';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topicId: '',
    topicName: '',
    topicName_cn: '',
    state: -1, // 0: 新题目, 1: 今天待复习
    userId: '',

    questions: [],

    selectedTime: '', // 选中的复习时间
    nextReviewText: '', // 下次复习时间文本
    nextReviewDate: '' // 下次复习时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: { topicId: string; topicName: string; topicName_cn: string; state: string; }) {
    if (options) {
      this.setData({
        topicId: options.topicId,
        topicName: decodeURIComponent(options.topicName),
        topicName_cn: decodeURIComponent(options.topicName_cn),
        state: parseInt(options.state)
      });
    }

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: decodeURIComponent(options.topicName_cn)
    });

    const app = getApp<IAppOption>();
    const userId = app.globalData.userInfo?.userId;
    
    if (userId) {
      this.setData({
        userId: userId
      });
      this.fetchExpertDetail(userId, options.topicId);
    }
  },
  async fetchExpertDetail(userId: string, topicId: string) {
    try {
      const result = await API.getExpertDetail(userId, topicId);
      if (result && result.state===1) {
        const questions = result.questions.map((q: any) => ({
          ...q,
          isFlipped: false
        }));
        this.setData({
          state: result.state,
          questions: questions
        });
      } else {
        this.setData({
          state: result.state,
          questions: result.questions
        });
      }
    } catch (error) {
      console.error('Failed to fetch detail:', error);
      wx.showToast({
        title: '获取数据失败',
        icon: 'error'
      });
    }
  },
  onInputTextarea(event: WechatMiniprogram.CustomEvent) {
    const { value } = event.detail;
    const { index } = event.currentTarget.dataset;
    const questions = this.data.questions;
    questions[index].answerUser = value;
    this.setData({
      questions
    });
  },
  async onSubmitAnswer(e: any) {
    const index = e.currentTarget.dataset.index;
    const question = e.currentTarget.dataset.qtitle;
    const answer = this.data.questions[index].answerUser;

    // console.log(question);
    // console.log(answer);
    // 显示loading
    wx.showLoading({
      title: 'AI定制答案中...',
      mask: true  // 防止用户点击其他区域
    });

    try {
      const resultAI = await API.getExpertAI(question, answer);

      const { questions } = this.data;
      // 更新对应问题的answerAI
      questions[index].answerAI = resultAI.answer;
      // 更新数据
      this.setData({
        questions
      });

      // 隐藏loading
      wx.hideLoading();
      // 可以添加一个提示
      wx.showToast({
        title: 'AI定制答案完成',
        icon: 'success',
        duration: 1500
      });
      // 尝试保存AI定制答案到数据库
      try {
        const { userId, topicId } = this.data;
        // 调用API更新答案
        const result = await API.updateExpertAnswer(userId, topicId, index,  resultAI.answer);
        // console.log(result);
        if (result.code !== 0) {
          wx.showToast({
            title: '答案保存失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('答案保存失败:', error);
        wx.showToast({
          title: '答案保存失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('getExpertAI', error);
      // 隐藏loading
      wx.hideLoading();
      wx.showToast({
        title: '获取AI定制答案失败',
        icon: 'none'
      });
    }
  },
  onSelectTime(e: { currentTarget: { dataset: { time: string; }; }; }) {

    // 只有在state为0时才检查
    const { questions, state } = this.data;
    if (state === 0) {
      // 检查所有问题的answerAI是否都存在
      const allQuestionsAnswered = questions.every(question => question.answerAI);
      if (!allQuestionsAnswered) {
        wx.showToast({
          title: '请先完成上面所有的AI定制答案',
          icon: 'none',
          duration: 2000
        });
        return;
      }
    }

    const time = e.currentTarget.dataset.time;
    this.setData({ selectedTime: time });

    if (time === 'done') {
      this.setData({
        nextReviewText: '已掌握，不再需要学习',
        nextReviewDate: 'done'
      });
    } else {
      const days = parseInt(time);
      const nextDate = new Date();
      nextDate.setHours(0, 0, 0, 0);  // 设置为本地时间的 00:00:00
      nextDate.setDate(nextDate.getDate() + days);

      // 格式化日期显示
      const year = nextDate.getFullYear();
      const month = nextDate.getMonth() + 1;
      const day = nextDate.getDate();
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      this.setData({
        nextReviewText: `下次复习时间：${dateStr}`,
        nextReviewDate: dateStr
      });
    }
  },
  async onConfirmTime() {
    const { userId, topicId, nextReviewDate } = this.data;
    try {
      const result = await API.updateExpertReviewTime(userId, topicId, nextReviewDate);

      if (result.code === 0) {
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        });
        // 获取页面栈
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2]; // 获取上一个页面
        
        // 根据选择的时间设置状态
        const newState = nextReviewDate === 'done' ? 4 : 2;
        
        // 更新上一个页面的数据
        if (prevPage) {
          // 找到对应的 topic 并更新状态
          const topics = prevPage.data.categories.flatMap((category: any) => category.topics);
          const topicIndex = topics.findIndex((topic: any) => topic.topicId === topicId);
          if (topicIndex !== -1) {
            topics[topicIndex].status.state = newState;
            topics[topicIndex].status.practiceCount++;
            // 如果是完成状态，更新进度为100
            if (newState === 4) {
              topics[topicIndex].status.progress = 100;
            } else if (newState === 2) {
              topics[topicIndex].status.progress = topics[topicIndex].status.practiceCount * 10;
            }
            // 更新页面数据
            prevPage.setData({
              categories: prevPage.data.categories
            });
          }
        }
        // 返回上一页
        wx.navigateBack();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('设置复习时间失败:', error);
        wx.showToast({
          title: '设置失败',
          icon: 'none'
        });
    }
  },
  onCardTap(e: { currentTarget: { dataset: { index: number; }; }; }) {
    const { index } = e.currentTarget.dataset;
    const questions = this.data.questions;
    questions[index].isFlipped = !questions[index].isFlipped;
    this.setData({
      questions
    });
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