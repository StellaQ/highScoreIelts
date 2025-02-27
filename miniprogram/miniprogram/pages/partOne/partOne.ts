import { Category, TagList, FilteredTagIdsToday } from '../../utils/types'; // 导入定义的类型 
import Toast from '@vant/weapp/toast/toast'; 
import { getLeftList, getFilteredTagIdsToday, getTagList} from '../../utils/onloadDataOne.js'; 

const staticQuestions = require('../../assets/staticQuestions.js');
const API = require('../../utils/api.js');

const questionProcess = [
  { qId: 'q8', 
    AIanswer: `Securing this type of work in my country can be quite challenging, primarily due to the high level of competition and the specific skill set required. However, for those who are highly skilled and have relevant experience, there are ample opportunities, especially in urban areas where the demand is higher. Networking and continuous professional development play crucial roles in enhancing one's chances of landing such positions.`},
  { qId: 'q9', 
    AIanswer: `Having work that I genuinely enjoy is extremely important to me because it brings numerous benefits, such as continuous personal and professional growth. Engaging in a job that aligns with my interests and passions not only motivates me to keep improving and learning new skills but also enhances my overall job satisfaction and well-being. This alignment between my work and personal interests ensures that I remain committed and enthusiastic about my career path, making every day at work a rewarding experience.`}
];
Page({
  data: {
    activeNames: ['个人信息','日常生活','兴趣爱好', '习惯与常规', '居住环境', '未来计划', '文化与社会', '技术与媒体'], // 左侧列表默认全部展开
    categories: [] as Category[], //
    showLeftPanel: false, // 左侧列表弹出/消失

    filteredTagIdsToday: [] as FilteredTagIdsToday,  //今天要复习的tagIds
    tagList: [] as TagList[],
    currentIndex: 0, // 当前标签索引
    isPrevDisabled: true, // 上一页按钮是否禁用
    isNextDisabled: false, // 下一页按钮是否禁用

    chosenTag: {},
    user: {
      uId: 'djdkdldlflf',
      isVip: true, // 决定review的时候能不能点开定制开关
      createCount: 10
    }
  },

  // sticky部分 start
  // 左侧列表弹出
  showLeftPanel() {
    this.setData({ showLeftPanel: true });
  },
  prevTag () {
    let { currentIndex, tagList } = this.data;
    if (currentIndex > 0) {
      currentIndex -= 1;
      this.setData({
        currentIndex,
        chosenTag: tagList[currentIndex] || null, // 更新 chosenTag
        isNextDisabled: false, // 确保下一页按钮可用
      });
      // 如果已经是第一个标签，禁用上一页按钮
      if (currentIndex === 0) {
        this.setData({
          isPrevDisabled: true,
        });
      }
    }
  },
  nextTag () {
    let { currentIndex, tagList } = this.data;
    if (currentIndex < tagList.length - 1) {
      currentIndex += 1;
      this.setData({
        currentIndex,
        chosenTag: tagList[currentIndex] || null, // 更新 chosenTag
        isPrevDisabled: false, // 确保上一页按钮可用
      });
      console.log('next-----------');
      console.log(tagList[currentIndex]);
      // 如果已经是最后一个标签，禁用下一页按钮
      if (currentIndex === tagList.length - 1) {
        this.setData({
          isNextDisabled: true,
        });
      }
    }
  },
  // sticky部分 end

  // 左侧列表 start
  // 左侧列表隐藏
  closeLeftPanel() {
    this.setData({ showLeftPanel: false });
  },
  // 点击切换各个category展开
  onChangeCategories(e: any) {
    this.setData({
      activeNames: e.detail,
    });
  },
  // 左侧列表 end

  // 点击question的开关
  onChangeSwitch(event: { currentTarget: { dataset: { id: any; }; }; detail: any; }) {
    let { chosenTag } = this.data;
  
    if (chosenTag.stage !== 0 && !this.data.user.isVip) {
      // 如果是 review 阶段并且用户不是 vip，那么返回
      return;
    }
  
    // 获取绑定的 data-id（即 item.questionId）
    const questionId = event.currentTarget.dataset.id;
    const newCheckedValue = event.detail;
  
    // 使用 find 找到第一个匹配的 item 并更新其 isSwitchChecked
    const question = chosenTag.questions.find((item: { qId: any; }) => item.qId === questionId);
    
    if (question) {
      question.isSwitchChecked = newCheckedValue;  // 更新 isSwitchChecked
    }
  
    // 更新 questions 数组
    this.setData({
      'chosenTag.questions': [...chosenTag.questions]  // 触发视图更新
    });
  
    // console.log('Updated item:', questionId, 'isSwitchChecked:', newCheckedValue);
  },  
  onChangeChoices(event: { detail: any; currentTarget: { dataset: { id: any; }; }; }) {
    const inputStr = event.detail;  // 获取选中的值
    const qId = event.currentTarget.dataset.id;  // 获取对应的 qId
  
    // console.log('Selected value:', inputStr);  // 打印选中的值
    // console.log('Question ID:', qId);  
  
    // 获取 chosenTag
    let { chosenTag } = this.data;
  
    // 遍历 chosenTag 中的 questions
    for (let i = 0; i < chosenTag.questions.length; i++) {
      const question = chosenTag.questions[i];  // 获取当前问题对象
  
      // 打印当前 question 信息
      // console.log('Question:', question);
  
      // 如果找到对应的 question，更新 step0
      if (question.qId === qId) {
        question.step0 = inputStr;  // 更新 step0 为选中的值
        break;  // 找到之后就不用再继续查找
      }
    }
  
    // 更新 chosenTag 和 questions
    this.setData({
      'chosenTag': { 
        ...this.data.chosenTag, 
        questions: [...chosenTag.questions]  // 确保数据更新
      }
    });
  },    
  onInput(event, field) {
    const inputStr = event.detail;  // 获取输入的值
    const qId = event.currentTarget.dataset.id;  // 获取对应的 qId
  
    // 使用 find 找到第一个匹配的 question
    const question = this.data.chosenTag.questions.find((question: { qId: any; }) => question.qId === qId);
    
    if (question) {
      question[field] = inputStr;  // 根据传入的字段名更新对应的问题属性
    }
    
    // 这里通过修改 questions 数组中的特定问题对象，而不完全重建数组
    this.setData({
      'chosenTag.questions': [...this.data.chosenTag.questions]
    });
  },
  // 对应 step1
  onInputStep1(event) {
    this.onInput(event, 'step1');
  },
  // 对应 step2
  onInputStep2(event) {
    this.onInput(event, 'step2');
  },
  // 对应 step3
  onInputStep3(event) {
    this.onInput(event, 'step3');
  },  
  produceAnswer(event: { currentTarget: { dataset: { id: any; }; }; }) {
    const qId = event.currentTarget.dataset.id; // 获取点击按钮的 question ID
    
    // 根据 qId 查找对应的问题
    const question = this.data.chosenTag.questions
      .find(q => q.qId === qId); // 找到匹配的 question
    
    if (question) {
      // 打印问题的信息
      console.log('用户定制的题目:', question);
      // 将按钮禁用，防止重复请求
      question.isButtonDisabled = true;
      question.isButtonLoading = true;
      // 更新数据，通知小程序 UI 刷新
      this.setData({
        'chosenTag.questions': this.data.chosenTag.questions
      });
    } else {
      console.log('没有找到对应的题目');
    }
    const userId = this.data.user.uId;
    API.getAIanswer(question, userId)
      .then((res: { answer: any; }) => {
        // 更新问题的 AIanswer
        for (let i = 0; i < this.data.chosenTag.questions.length; i++) {
          if (this.data.chosenTag.questions[i].qId === qId) {
            this.data.chosenTag.questions[i].AIanswer = res.answer;  // 更新 AIanswer
            this.data.chosenTag.questions[i].isButtonDisabled = false;  // 恢复按钮
            this.data.chosenTag.questions[i].isButtonLoading = false;
            break;
          }
        }
        // 更新数据，通知小程序 UI 刷新
        this.setData({
          'chosenTag.questions': this.data.chosenTag.questions  // 更新 questions 数组
        });
        console.log('Response from AI:', res);
      })
      .catch((err: any) => {
        console.error('Request failed:', err);
        // 请求失败后恢复按钮状态
        for (let i = 0; i < this.data.chosenTag.questions.length; i++) {
          if (this.data.chosenTag.questions[i].qId === qId) {
            this.data.chosenTag.questions[i].isButtonDisabled = false;
            this.data.chosenTag.questions[i].isButtonLoading = false;
            break;
          }
        }
        // 更新数据，通知小程序 UI 刷新
        this.setData({
          'chosenTag.questions': this.data.chosenTag.questions
        });
        // 显示失败提示
        Toast.fail('稍后再试...');
      });
  },  
  setRemindDay(e: any) {
    const day = e.currentTarget.dataset.day;
    this.setData({
      reminders: [...this.data.reminders, day],
    });
  },
  generateReminders() {
    const { memoryDays, today } = this.data;
    const reminders = memoryDays.map((day) => {
      const reminderDate = new Date(new Date(today).getTime() + day * 24 * 60 * 60 * 1000);
      return {
        day,
        date: reminderDate.toISOString().split('T')[0], // 格式化日期
      };
    });
    console.log(reminders);
    this.setData({ reminders });
  },
  // 结束复习提醒
  endReminder() {
    this.setData({
      isReminderActive: false,  // 停止提醒
    });
  },
  showGuide() {
    wx.showModal({
      title: '使用提示',
      content: '选择复习的天数，系统会按设定的间隔提醒你复习。点击结束复习即可停止提醒。',
      showCancel: false,
      confirmText: '知道了',
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    const userId = this.data.user.uId;
    try {
      const tagProcess = await API.getTagProcessByUserId(userId);
      this.setData({
        tagProcess: tagProcess
      });
      // 处理左端列表数据
      const leftList = getLeftList(tagProcess, staticQuestions);
      this.setData({
        categories: leftList
      });

      // 从记录tag状态改变的tagProcess筛选出今天要复习的tagIds
      const filteredTagIdsToday = getFilteredTagIdsToday(tagProcess);
      // console.log(filteredTagIdsToday); // ["t3"]
      this.setData({
        filteredTagIdsToday: filteredTagIdsToday,
      }); 

      const tagList = getTagList(tagProcess, questionProcess,staticQuestions, filteredTagIdsToday);
      this.setData({
        tagList: tagList,
        chosenTag: tagList[0] || null, // 初始显示第一个标签
      });
      console.log('===');
      console.log(tagList[0]);
    } catch (err) {
      console.error('获取tagProcess数据失败:', err);
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
    // console.log('onUnload');
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
  onShareAppMessage(opts:any): WechatMiniprogram.Page.ICustomShareContent {
    console.log(opts.target)
    return {}
  }
})