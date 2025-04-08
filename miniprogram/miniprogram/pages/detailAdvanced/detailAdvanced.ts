// pages/detailAdvanced/detailAdvanced.ts
import API from '../../utils/API';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topicId: '',
    topicName: '',
    topicName_cn: '',
    state: -1, // 0: 新题目, 1: 今天待复习, 2: 今天已完成
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
      this.fetchAdvancedDetail(userId, options.topicId);
    }
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
  onShareAppMessage() {

  },

  async fetchAdvancedDetail(userId: string, topicId: string) {
    try {
      const result = await API.getAdvancedDetail(userId, topicId);
      if (result && result.state===1 || result && result.state===2) {
        const questions = result.points.map((q: any) => ({
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
          questions: result.points
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

  onChangeChoice(event: WechatMiniprogram.CustomEvent) {
    const value = event.detail;
    const { index } = event.currentTarget.dataset;
    const questions = this.data.questions;
    questions[index].choice = value;
    this.setData({
      questions
    });
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
    const { index, qTitle } = e.currentTarget.dataset;
    const question = this.data.questions[index];
    
    if (!question.answerUser) {
      wx.showToast({
        title: '请先输入答案',
        icon: 'none'
      });
      return;
    }

    try {
      const result = await API.getAdvancedAI({
        userId: this.data.userId,
        topicId: this.data.topicId,
        qTitle: qTitle,
        answerUser: question.answerUser
      });

      const questions = this.data.questions;
      questions[index].answerAI = result.data.answer;
      this.setData({
        questions
      });
    } catch (error) {
      console.error('Failed to get AI answer:', error);
      wx.showToast({
        title: '获取AI答案失败',
        icon: 'error'
      });
    }
  },

  onSelectTime(e: { currentTarget: { dataset: { time: string; }; }; }) {
    const time = e.currentTarget.dataset.time;
    let nextReviewText = '';
    let nextReviewDate = '';

    if (time === 'done') {
      nextReviewText = '已掌握';
      nextReviewDate = 'done';
    } else {
      const days = parseInt(time);
      const date = new Date();
      date.setDate(date.getDate() + days);
      nextReviewText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      nextReviewDate = nextReviewText;
    }

    this.setData({
      selectedTime: time,
      nextReviewText,
      nextReviewDate
    });
  },

  async onConfirmTime() {
    if (!this.data.nextReviewDate) {
      wx.showToast({
        title: '请选择复习时间',
        icon: 'none'
      });
      return;
    }

    try {
      await API.updateAdvancedReviewTime({
        userId: this.data.userId,
        topicId: this.data.topicId,
        nextReviewDate: this.data.nextReviewDate
      });

      // 获取页面栈
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      // 更新上一页面的状态
      if (prevPage) {
        const topics = prevPage.data.categories[0].topics;
        const topicIndex = topics.findIndex((t: any) => t.topicId === this.data.topicId);
        
        if (topicIndex !== -1) {
          if (this.data.selectedTime === 'done') {
            topics[topicIndex].status.state = 4;
            topics[topicIndex].status.progress = 100;
          } else {
            topics[topicIndex].status.state = 2;
          }
          
          prevPage.setData({
            'categories[0].topics': topics
          });
        }
      }

      wx.navigateBack();
    } catch (error) {
      console.error('Failed to update review time:', error);
      wx.showToast({
        title: '更新复习时间失败',
        icon: 'error'
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
  }
})