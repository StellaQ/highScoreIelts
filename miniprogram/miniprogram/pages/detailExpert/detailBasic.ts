import API from '../../utils/API';

Page({
    data: {
        topicId: '',
        topicName: '',
        topicName_cn: '',
        state: -1, // 0: 新题目, 1: 待复习, 2: 已完成
        questions: [
          {
            qTitle: "What's the duration of your stay at your current residence?",
            qTitle_cn: "您在当前住所居住了多长时间？",
            answer: "I have been living in my current apartment for about three years now. It's a comfortable place located in a convenient neighborhood with easy access to public transportation and various amenities.",
            isFlipped: false
          },
          {
            qTitle: "How does your current neighborhood influence your daily life?",
            qTitle_cn: "您当前的社区环境如何影响您的日常生活？",
            answer: "My neighborhood has a significant positive impact on my daily life. The area is quite safe and peaceful, with plenty of green spaces for outdoor activities. There are numerous shops and restaurants within walking distance, which makes running errands very convenient.",
            isFlipped: false
          }
        ],
        feedbacks: [false, false], // 控制每个问题的反馈显示
        selectedTime: '', // 选中的复习时间
        nextReviewText: '', // 下次复习时间文本
        canConfirm: false, // 是否可以确认复习时间
    },
    onLoad(options: { topicId: any; topicName: string; topicName_cn: string; state: any; }) {
      if (options) {
        this.setData({
          topicId: options.topicId,
          topicName: decodeURIComponent(options.topicName),
          topicName_cn: decodeURIComponent(options.topicName_cn),
          state: 2
        });
      }
      // if (options) {
      //     this.setData({
      //     topicId: options.topicId,
      //     topicName: decodeURIComponent(options.topicName),
      //     topicName_cn: decodeURIComponent(options.topicName_cn),
      //     state: parseInt(options.state) 
      //     });
      //     console.log(this.data.state);
      // }
    },
    // 提交答案
    onSubmitAnswer(e: { currentTarget: { dataset: { index: any; }; }; }) {
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
    onSelectTime(e: { currentTarget: { dataset: { time: any; }; }; }) {
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
    onCardTap(e) {
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