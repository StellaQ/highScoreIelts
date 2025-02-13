const staticQuestions = require('../../assets/staticQuestions.js');

import { Category, SubCategory, TagProcess, TagList, FilteredTagIdsToday } from '../../utils/types'; // 导入定义的类型 

// 根据userId获取对应的tag进度
const tagProcess: TagProcess[] = [
  { tagId: 't3', stage: 1, reviewDate: '2025-01-21' },
  { tagId: 't4', stage: 1, reviewDate: '2025-02-24' },
  { tagId: 't5', stage: 2, reviewDate: '2025-02-14' },
  { tagId: 't6', stage: 3, reviewDate: '2025-02-16' },
  { tagId: 't7', stage: 4, reviewDate: '2025-02-16' },
  { tagId: 't8', stage: 5, reviewDate: '' },
  { tagId: 't9', stage: 1, reviewDate: '2025-02-16' },
  { tagId: 't10', stage: 2, reviewDate: '2025-02-16' }
];
// todo 这里的questionProcess应该是筛选的符合今天的tagId下的qId
// 比如说今天选定要复习的是t3,t3下的问题是q8，q9，
// 那么数据库下选定的就是用userId下的q8，q9的定制化答案
// { qId: "q8", qText: "How easy is it to get this kind of work in your country?", type: 1 },
// { qId: "q9", qText: "How important is it to you to have work that you enjoy doing?", type: 1 }
const questionProcess = [
  { qId: 'q8', AIanswer: '这里是AI返回的答案答案大的快点快点快点', step1: '', step2: 'not easy', step3: 'small palce'},
  { qId: 'q9', AIanswer: '这里是AI返回的答案答案大的快点快点快点', step1: '', step2: 'very important', step3: '兴趣很重要'}
];
Page({
  data: {
    categories: [] as Category[], // 通过类型断言，确保类型匹配 ???onload处理
    tagList: [] as TagList[],
    filteredTagIdsToday: [] as FilteredTagIdsToday,
    showLeftPanel: true, // 左侧列表弹出/消失
    // todo onload处理activeNames
    activeNames: ['个人信息','日常生活','兴趣爱好', '习惯与常规', '居住环境', '未来计划', '文化与社会', '技术与媒体'], // 左侧列表默认全部展开
    currentTag: {}, // todo 当前选中的话题下的3-4个小问题???
    chosenTag: {},
    user: {
      uId: 'djdkdldlflf',
      tags: [
        {tagId: 't1', tagState: 0, nextDate: '2025-102'},
        {tagId: 't2', tagState: 1},
      ],
      questions: [
        // AIanswer为空则判断showPrompt取反 todo
        {qId: 'q1', AIanswer: '库斯库斯溜达溜达', choice: 'city', step1: 'djddk', step2: '', step3: '' },
        {qId: 'q2', step1: '和谐的氛围', step2: '从小住这里，邻居都很熟悉', step3: '非常熟悉周围的环境，给我一种innerpeace' }
      ]
    },
    today: new Date().toISOString().split('T')[0], // 当前日期
    memoryDays: [1, 3, 7, 15],  // 提醒间隔 todo 引用自settings文件
    reminders: [],               // 保存用户选择的提醒周期
    isReminderActive: true,      // 用来控制提醒是否激活 ??todo 放到上方单个里面吧
  },

  // sticky部分 start
  // 左侧列表弹出
  showLeftPanel() {
    this.setData({ showLeftPanel: true });
  },
  prevTag () {
    console.log('去上一个tag');
  },
  nextTag () {
    console.log('去下一个tag');
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
  // 选中某个问题后的逻辑
  goToSubcategoryQuestions (a: any) {
    this.setData({ currentTag: a });
    this.setData({
      'user.chosenTag': a
    });
    this.setData({ show: false });
  },
  // 左侧列表 end

  // 选中的tag下的questions start
  onChangeChoices(e: any) {
    const questionId = e.currentTarget.dataset.id; // 获取 questionId
    const value = e.detail; // 获取选中的值

     // 获取当前 questionId 的现有数据
    const currentData = this.data.user.specifiedPrompt[questionId] || {};
    // 合并新数据
    this.setData({
        [`user.specifiedPrompt.${questionId}`]: {
            ...currentData, // 保留现有字段
            choice: value // 更新或新增字段
            // answer: "dddd",
            // reason: "djdjkdd"
        }
    });

    console.log(this.data.user);
  },
  // 点击每个问题右侧开关切换prompt的显示
  showPrompt(e: any) {
    const questionId = e.currentTarget.dataset.id; // 获取点击的问题 ID
    const currentData = {}; // 获取当前数据
    const newShowPrompt = !currentData.showPrompt; // 切换显示状态
  
    // 更新指定问题的 showPrompt 状态
    this.setData({
      [`user.specifiedPrompt.${questionId}.showPrompt`]: newShowPrompt,
    });
  },
  produceAnswer () {
    console.log('这里把用户对问题的定制，问题的题目等传到后端');
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

    wx.showModal({
      title: '提醒结束',
      content: '你已完成本周期的复习，是否需要重新开始？',
      showCancel: true,
      confirmText: '重新开始',
      cancelText: '不再复习',
      success: (res) => {
        if (res.confirm) {
          // 用户选择重新开始
          this.setData({
            reminders: [],
            isReminderActive: true,
          });
        } else {
          // 用户选择不再复习
          // 可以在此处执行清理操作，如移除存储中的提醒设置等
        }
      },
    });
  },

  // 重新开始复习
  restartReminder() {
    this.setData({
      isReminderActive: true,
      reminders: [],  // 清空提醒周期并重新开始
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
  // 选中的tag下的questions end

  generateTagList () {
    const today = new Date().toISOString().split('T')[0]; // 获取今天日期
    const tagList: any[] = []; // 最终结果

    // 筛选符合条件的 tagId
    const filteredTagIds = tagProcess
      .filter(
        (tag) =>
          // tag.reviewDate !== '' && // 确保 reviewDate 不为空
          tag.reviewDate <= today && // 日期小于等于今天
          [1, 2, 3, 4].includes(tag.stage) // stage 是 1/2/3/4
      )
      .map((tag) => tag.tagId);
    
    console.log('today to review Ids=======');
    console.log(filteredTagIds);
    this.setData({
      filteredTagIdsToday: filteredTagIds,
    });  
    // 查找符合条件的 tagId 对应的数据
    staticQuestions.forEach((category: any) => {
      category.subCategories.forEach((subCategory: any) => {
        if (filteredTagIds.includes(subCategory.tagId)) {
          const tagInfo = tagProcess.find((tag) => tag.tagId === subCategory.tagId);
          tagList.push({
            tagId: subCategory.tagId,
            tagName: subCategory.tagName,
            stage: tagInfo ? tagInfo.stage : 0, // 确保包含 stage 信息
            questions: subCategory.questions,
          });
        }
      });
    });

    // 查找不在 tagProcess 中的 tagId，并追加到 tagList
    staticQuestions.forEach((category: any) => {
      category.subCategories.forEach((subCategory: any) => {
        const isInTagProcess = tagProcess.some((tag) => tag.tagId === subCategory.tagId);
        if (!isInTagProcess) {
          tagList.push({
            tagId: subCategory.tagId,
            tagName: subCategory.tagName,
            stage: 0, // 没有对应的 stage，默认为 0
            questions: subCategory.questions,
          });
        }
      });
    });

    return tagList;
  },
  updatedTagList (tagList: any) {
    
    return tagList;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const result = staticQuestions.map((category: Category) => {
      return {
        categoryNameInChinese: category.categoryNameInChinese,
        subCategories: category.subCategories.map((subCategory: SubCategory) => {
          const tagInfo = tagProcess.find(tag => tag.tagId === subCategory.tagId);
          const stage = tagInfo ? tagInfo.stage : 0;
    
          return {
            tagName: subCategory.tagName,
            tagId: subCategory.tagId,
            stage // 混合进阶段信息,
            // progressStyle: `--progress: ${stage * 20}%;`
          };
        }),
      };
    });
    
    this.setData({
      categories: result,
    });    
    console.log(result);

    // 调用函数生成 tagList
    const result2 = this.generateTagList();
    this.setData({
      tagList: result2,
    });    
    console.log('Initial tagList (result2):', result2);
    const filteredTagIdsToday = this.data.filteredTagIdsToday;
    console.log('Filtered Tag IDs:', filteredTagIdsToday);
    console.log('Question Process:', questionProcess);

    // 1. 构建 questionProcess 的 Map
    const questionProcessMap = new Map(
      questionProcess.map((process) => [process.qId, process])
    );

    // 2. 遍历 tagList，处理 filteredTagIdsToday 内的 tags
    const updatedTagList = result2.map((tag: any) => {
      if (filteredTagIdsToday.includes(tag.tagId)) {
        // 如果当前 tagId 在 filteredTagIdsToday 中，更新其 questions
        const updatedQuestions = tag.questions.map((question: any) => {
          const matchingProcess = questionProcessMap.get(question.qId);
          return matchingProcess
            ? { ...question, ...matchingProcess } // 合并 questionProcess 数据
            : question; // 保持原始 question
        });
        return {
          ...tag,
          questions: updatedQuestions, // 更新 questions
        };
      }
      // 不在 filteredTagIdsToday 中的 tags 保持不变
      return tag;
    });

    console.log('Updated tagList:', updatedTagList);

    this.setData({
      tagList: updatedTagList, // 更新完整的 tagList
    });
    this.setData({
      chosenTag: updatedTagList[0],
    });
    let a = {tagName: "Sweet things", questions: [{questionId: "q13", questionText: "Did you enjoy sweet things when you were a child?", type: 0, choices: ['yes', 'no']},
    {questionId: "q14", questionText: "Have you ever made a cake yourself?", type: 0, choices: ['yes', 'no']},
    {questionId: "q15", questionText: "How often do you eat something sweet after a meal?", type: 1}]};
    this.goToSubcategoryQuestions(a);
    this.generateReminders();

    // todo 每天默认练习10题加上复习的 引用自settings
    // todo 每天练习的完成就要弹出提示，同时再练的话左右切换题目要消失
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