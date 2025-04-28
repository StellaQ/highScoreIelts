import API from '../../utils/API';

Page({
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
            state: result.state,
            questions: questions
          });
        } else {
          // console.log('222');
          this.setData({
            state: result.state,
            questions: result.questions
          });
          // console.log(this.data.questions);
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
        const resultAI = await API.getBasicAI(this.data.userId, question, answer);
        // console.log(resultAI);
        const { questions } = this.data;
        // 更新对应问题的answerAI
        questions[index].answerAI = resultAI.data.answer;
        // 更新数据
        this.setData({
          questions
        });
        // 隐藏loading
        wx.hideLoading();
        let title = `消耗了${resultAI.pointsDeducted}积分`;
        // console.log(title);
        wx.showToast({
          title: title,
          icon: 'success',
          duration: 1500
        });
        // setTimeout(() => {
        //   wx.showToast({
        //     title: title,
        //     icon: 'success',
        //     duration: 1500
        //   });
        // }, 100);
        // 尝试保存AI定制答案到数据库
        try {
          const { userId, topicId } = this.data;
          // 调用API更新答案
          const result = await API.updateBasicAnswer(userId, topicId, index,  resultAI.data.answer);
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
        // console.error('getBasicAI', error);
        // 隐藏loading
        wx.hideLoading();
        // console.log(error.data.message);
        wx.showToast({
          title: error.data.message || '获取答案失败',
          icon: 'none',
          duration: 1500
        });
      }
    },
    // 选择复习时间
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
    // 确认复习时间
    async onConfirmTime() {
      const { userId, topicId, nextReviewDate } = this.data;
      try {
        const result = await API.updateBasicReviewTime(userId, topicId, nextReviewDate);
        
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
      const index = e.currentTarget.dataset.index;
      const questions = this.data.questions.map((q, i) => ({
        ...q,
        isFlipped: i === index ? !q.isFlipped : q.isFlipped
      }));
      
      this.setData({ questions });
    },
    // 普通分享
  onShareAppMessage() {
    return getApp().getShareInfo();
  },
  // 朋友圈分享
  onShareTimeline() {
    return getApp().getTimelineInfo();
  }
}); 