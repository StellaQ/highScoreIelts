import API from '../../utils/API';

Page({
    data: {
        topicId: '',
        topicName: '',
        topicName_cn: '',
        state: -1, // 0: 新题目, 1: 今天待复习, 2: 今天已完成
        userId: '',
        questions: [],
        answersFromAI: [] as boolean[], // 控制每个问题的反馈显示
        selectedTime: '', // 选中的复习时间
        nextReviewText: '', // 下次复习时间文本
        canConfirm: false, // 是否可以确认复习时间
        loading: true, // 加载状态
    },

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
        this.fetchBasicDetail(userId, options.topicId);
      }
    },
    async fetchBasicDetail(userId: string, topicId: string) {
      try {
        const result = await API.getBasicDetail(userId, topicId);
        // console.log(result);
        if (result && result.state===1 || result && result.state===2) {
          // console.log('111');
          const questions = result.questions.map((q: any) => ({
            ...q,
            isFlipped: false
          }));
          this.setData({
            questions: questions,
            answersFromAI: new Array(result.questions.length).fill(false),
            loading: false
          });
        } else {
          // console.log('222');
          this.setData({
            questions: result.questions,
            answersFromAI: new Array(result.questions.length).fill(false),
            loading: false
          });
          // console.log(this.data.questions);
        }
      } catch (error) {
        console.error('Failed to fetch detail:', error);
        wx.showToast({
          title: '获取数据失败',
          icon: 'error'
        });
        // this.setData({ loading: false });
      }
    },
    onChangeChoice(event: WechatMiniprogram.CustomEvent) {
      const value = event.detail;  // 获取选中的选项值
      const { index } = event.currentTarget.dataset;  // 从data-index获取当前问题的索引
      // 获取当前questions数组
      const questions = this.data.questions;
      // 更新对应问题的choice
      questions[index].choice = value;
      // 更新数据
      this.setData({
        questions
      });
    },
    onInputTextarea(event: WechatMiniprogram.CustomEvent) {
      const { value } = event.detail;
      const { index } = event.currentTarget.dataset;  // 从data-index获取当前问题的索引
      
      // 获取当前questions数组
      const questions = this.data.questions;
      // 更新对应问题的answerUser
      questions[index].answerUser = value;
      // console.log(questions[index].answerUser);
      // 更新数据
      this.setData({
        questions
      });
    },
    // 提交答案
    async onSubmitAnswer(e: any) {
      const index = e.currentTarget.dataset.index;
      const question = e.currentTarget.dataset.qtitle;
      const answer = e.currentTarget.dataset.choice + this.data.questions[index].answerUser;

      // console.log(question);
      // console.log(answer);
      // 显示loading
      wx.showLoading({
        title: 'AI定制答案中...',
        mask: true  // 防止用户点击其他区域
      });
      try {
        const resultAI = await API.getBasicAI(question, answer);
        // console.log(result.answer);

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
          const result = await API.updateBasicAnswer(userId, topicId, index,  resultAI.answer);
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
        console.error('getBasicAI', error);
        // 隐藏loading
        wx.hideLoading();
        wx.showToast({
          title: '获取AI定制答案失败',
          icon: 'none'
        });
      }
      // const answersFromAI = [...this.data.answersFromAI];
      // answersFromAI[index] = true;
      
      // this.setData({ answersFromAI });
  
      // // 检查是否所有问题都已获得反馈
      // if (answersFromAI.every(f => f)) {
      //   this.setData({
      //     nextReviewText: '请选择下次复习时间'
      //   });
      // }
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