import API from '../../utils/API';

Page({
    data: {
        topicId: '',
        topicName: '',
        topicName_cn: '',
        state: -1, // 0: 新题目, 1: 待复习, 2: 已完成
        userId: '',
        questions: [] as Array<{
          qTitle: string;
          qTitle_cn: string;
          answer: string;
          isFlipped: boolean;
        }>,
        feedbacks: [] as boolean[], // 控制每个问题的反馈显示
        selectedTime: '', // 选中的复习时间
        nextReviewText: '', // 下次复习时间文本
        canConfirm: false, // 是否可以确认复习时间
        loading: true, // 加载状态
    },

    async onLoad(options: { topicId: string; topicName: string; topicName_cn: string; state: string; }) {
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
        this.setData({ userId });
        try {
          const result = await API.getDetailBasic(userId, options.topicId);
          if (result && result.data) {
            const questions = result.data.questions.map((q: any) => ({
              ...q,
              isFlipped: false
            }));
            this.setData({
              questions,
              feedbacks: new Array(questions.length).fill(false),
              loading: false
            });
          }
        } catch (error) {
          console.error('Failed to fetch detail:', error);
          wx.showToast({
            title: '获取数据失败',
            icon: 'error'
          });
          this.setData({ loading: false });
        }
      }
    },

    // 提交答案
    onSubmitAnswer(e: { currentTarget: { dataset: { index: number; }; }; }) {
      const index = e.currentTarget.dataset.index;
      const feedbacks = [...this.data.feedbacks];
      feedbacks[index] = true;
      
      this.setData({ feedbacks });
  
      // 检查是否所有问题都已获得反馈
      if (feedbacks.every(f => f)) {
        this.setData({
          nextReviewText: '请选择下次复习时间'
        });
      }
    },
  
    // 选择复习时间
    onSelectTime(e: { currentTarget: { dataset: { time: string; }; }; }) {
      const time = e.currentTarget.dataset.time;
      this.setData({ selectedTime: time });
  
      if (time === 'done') {
        this.setData({
          nextReviewText: '该主题已掌握，无需再复习',
          canConfirm: true
        });
      } else {
        const days = parseInt(time);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        const dateStr = `${nextDate.getFullYear()}年${nextDate.getMonth() + 1}月${nextDate.getDate()}日`;
        
        this.setData({
          nextReviewText: `下次复习时间：${dateStr}`,
          canConfirm: true
        });
      }
    },

    onCardTap(e: { currentTarget: { dataset: { index: number; }; }; }) {
      const index = e.currentTarget.dataset.index;
      const questions = this.data.questions.map((q, i) => ({
        ...q,
        isFlipped: i === index ? !q.isFlipped : q.isFlipped
      }));
      
      this.setData({ questions });
    },

    // 确认复习时间
    onConfirmTime() {
      if (!this.data.canConfirm) return;
      
      // TODO: 处理确认逻辑
      wx.showToast({
        title: '设置成功',
        icon: 'success'
      });
    }
}); 