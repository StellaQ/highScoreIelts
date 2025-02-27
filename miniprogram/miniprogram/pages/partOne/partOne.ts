const staticQuestions = require('../../assets/staticQuestions.js');

import { Category, SubCategory, TagList, FilteredTagIdsToday } from '../../utils/types'; // 导入定义的类型 
import Toast from '@vant/weapp/toast/toast'; 
const API = require('../../utils/api.js');
interface Tag {
  tagName: string;
  tagId: string;
}
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

    tagProcess: [],
    chosenTag: null as Tag | null,
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

  // 选中的tag下的questions start
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
    wx.request({
      url: 'http://localhost:3001/api/miniprogramOne/askAI',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        question: question,
        user: this.data.user
      },
      success: (res) => {  // 使用箭头函数，确保 `this` 指向正确
        console.log('Response from AI:', res.data);

         // 执行更新操作
        for (let i = 0; i < this.data.chosenTag.questions.length; i++) {
          if (this.data.chosenTag.questions[i].qId === qId) {
            // 更新该问题的 AIanswer
            this.data.chosenTag.questions[i].AIanswer = res.data.answer;
            this.data.chosenTag.questions[i].isButtonDisabled = false;  // 成功后恢复按钮
            this.data.chosenTag.questions[i].isButtonLoading = false;
            break;  // 找到并更新后，结束循环
          }
        }
        // 更新数据，通知小程序 UI 刷新
        this.setData({
          'chosenTag.questions': this.data.chosenTag.questions  // 更新 questions 数组
        });
      },
      fail: (err) => {
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
        Toast.fail('稍后再试...');
      }
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

  getLeftList(tagProcess: any[] | undefined) {
    return staticQuestions.map((category: Category) => {
      return {
        categoryNameInChinese: category.categoryNameInChinese,
        subCategories: category.subCategories.map((subCategory: SubCategory) => {
          const tagInfo = tagProcess.find(tag => tag.tagId === subCategory.tagId);
          const stage = tagInfo ? tagInfo.stage : 0;
  
          return {
            tagName: subCategory.tagName,
            tagId: subCategory.tagId,
            stage // 混合进阶段信息
            // progressStyle: `--progress: ${stage * 20}%;`
          };
        }),
      };
    });
  },
  // categoryNameInChinese: "个人信息"
  // subCategories: Array(2)
  // 0: {tagName: "Hometown", tagId: "t1", stage: 0}
  // 1: {tagName: "Where you live", tagId: "t2", stage: 0}

  // 结合tagProcess去staticQuestions里去找
  generateTagList(tagProcess: any[] | undefined) {
    const tagList: any[] = []; // 最终结果
  
    const today = new Date().toISOString().split('T')[0]; // 获取今天日期
    const filteredTagIds = tagProcess
      .filter((tag) =>
        tag.reviewDate <= today && [1, 2, 3, 4].includes(tag.stage)
      )
      .map((tag) => tag.tagId);
    this.setData({
      filteredTagIdsToday: filteredTagIds,
    });
    // 第二步：把今天要复习的tagId从staticQuestions找到并push到tagList
    const filteredTagIdsSet = new Set(this.data.filteredTagIdsToday);
    const addedTagIds = new Set();
    staticQuestions.forEach((category: any) => {
      category.subCategories.forEach((subCategory: any) => {
        if (
          filteredTagIdsSet.has(subCategory.tagId) &&
          !addedTagIds.has(subCategory.tagId)
        ) {
          const tagInfo = tagProcess.find(
            (tag) => tag.tagId === subCategory.tagId
          );
          // 给每个问题加上 step0, step1, step2, step3
          const updatedQuestions = subCategory.questions.map((question: any) => ({
            ...question,
            isSwitchChecked: false,
            isButtonDisabled: false,
            isButtonLoading: false,
            step0: '',
            step1: '',
            step2: '',
            step3: '',
          }));
          tagList.push({
            tagId: subCategory.tagId,
            tagName: subCategory.tagName,
            stage: tagInfo ? tagInfo.stage : 0,
            questions: updatedQuestions,
          });
          addedTagIds.add(subCategory.tagId);
  
          // 提前结束循环
          if (addedTagIds.size === filteredTagIdsSet.size) {
            return;
          }
        }
      });
    });
  
    // 第三步：查找不在tagProcess中的tagId,也就是全新的题目
    const tagIdsInProcess = new Set(tagProcess.map((tag) => tag.tagId));
    staticQuestions.forEach((category: any) => {
      category.subCategories.forEach((subCategory: any) => {
        if (!tagIdsInProcess.has(subCategory.tagId)) {
          const updatedQuestions = subCategory.questions.map((question: any) => ({
            ...question,
            isSwitchChecked: true,
            isButtonDisabled: false,
            isButtonLoading: false,
            step0: '',
            step1: '',
            step2: '',
            step3: '',
            AIanswer: ''
          }));
          tagList.push({
            tagId: subCategory.tagId,
            tagName: subCategory.tagName,
            stage: 0, // 默认 stage 为 0
            questions: updatedQuestions,
          });
        }
      });
    });
  
    return tagList;
  },
  // 结合this.data.filteredTagIdsToday和questionProcess来update tagList.questions内的字段
  getUpdatedTagList() {
    const filteredTagIdsTodaySet = new Set(this.data.filteredTagIdsToday);
  
    // 构建 questionProcess 的 Map
    const questionProcessMap = new Map(
      questionProcess.map((process) => [process.qId, process])
    );
  
    // 遍历 tagList，更新 filteredTagIdsToday 内的 tags
    const result2 = this.data.tagList;
    return result2.map((tag: any) => {
      if (filteredTagIdsTodaySet.has(tag.tagId)) {
        // 如果当前 tagId 在 filteredTagIdsToday 中，更新其 questions
        const updatedQuestions = tag.questions.map((question: any) => {
          const matchingProcess = questionProcessMap.get(question.qId);
          // 合并 AIanswer 到 question 中
          return {
            ...question, 
            AIanswer: matchingProcess ? matchingProcess.AIanswer : null, // 只添加 AIanswer 字段
          };
        });
        return {
          ...tag,
          questions: updatedQuestions, // 更新 questions
        };
      }
      return tag; // 不在 filteredTagIdsToday 中的 tags 保持不变
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
      // step 1 处理左端列表数九
      const result = this.getLeftList(tagProcess);
      this.setData({
        categories: result,
      }); 
      // step 2 处理正文中的 tagList, 得到综合了tagProcess的初步tagList
      const result2 = this.generateTagList(tagProcess);
      this.setData({
        tagList: result2,
      });    
      // step 3 处理正文中的 tagList, 对于复习了的题目，得到综合了questionProcess的tagList
      const result3 = this.getUpdatedTagList(); // 调用抽取的函数
      this.setData({
        tagList: result3,
        chosenTag: result3[0] || null, // 初始显示第一个标签
      });
      // console.log('===');
      // console.log(result3[0]);
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
    // console.log('onHide');
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