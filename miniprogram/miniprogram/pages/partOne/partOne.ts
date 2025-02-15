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
    memoryDays: [1, 3, 7, 15, 'complete'],  // 提醒间隔 todo 引用自settings文件
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
  },
  showGuide() {
    wx.showModal({
      title: '使用提示',
      content: '选择复习的天数，系统会按设定的间隔提醒你复习。点击结束复习即可停止提醒。',
      showCancel: false,
      confirmText: '知道了',
    });
  },

  getLeftList() {
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
  generateTagList () {
    const today = new Date().toISOString().split('T')[0]; // 获取今天日期
    const tagList: any[] = []; // 最终结果

    // 查找出要今天复习的tagId
    const filteredTagIds = tagProcess
      .filter(
        (tag) =>
          // tag.reviewDate !== '' && // 确保 reviewDate 不为空
          tag.reviewDate <= today && // 日期小于等于今天
          [1, 2, 3, 4].includes(tag.stage) // stage 是 1/2/3/4
      )
      .map((tag) => tag.tagId);
    // console.log('today to review Ids=======');
    // Filtered Tag IDs: (2) ["t3", "t5"]
    // console.log(filteredTagIds);
    this.setData({
      filteredTagIdsToday: filteredTagIds,
    });  
    // 把今天要复习的tagId从staticQuestions找到并push到tagList
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
    // 查找不在tagProcess中的tagId,也就是全新的题目，并追加到 tagList
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
  getUpdatedTagList() {
    // 先将 filteredTagIdsToday 转换为 Set 提高性能
    const filteredTagIdsTodaySet = new Set(this.data.filteredTagIdsToday);
    // ["t3", "t5"]
    // console.log('Filtered Tag IDs:', filteredTagIdsToday);

    // 1. 构建 questionProcess 的 Map
    const questionProcessMap = new Map(
      questionProcess.map((process) => [process.qId, process])
    );
    // 0: {"q8" => Object}
    // key: "q8"
    // value: {qId: "q8", AIanswer: "这里是AI返回的答案答案大的快点快点快点", step1: "", step2: "not easy", step3: "small palce"}
    // 1: {"q9" => Object}
    // console.log(questionProcessMap);

    // 2. 遍历 tagList，更新 filteredTagIdsToday 内的 tags
    const result2 = this.data.tagList;
    return result2.map((tag: any) => {
      if (filteredTagIdsTodaySet.has(tag.tagId)) {
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
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 后端api 获取tagProcess & questionProcess再返回
    // step 1 处理左端列表
    const result = this.getLeftList();
    this.setData({
      categories: result,
    });    
    // step 2 处理正文中的 tagList, 得到综合了tagProcess的初步tagList
    const result2 = this.generateTagList();
    this.setData({
      tagList: result2,
    });    
    // step 3 处理正文中的 tagList, 对于复习了的题目，得到综合了questionProcess的tagList
    const result3 = this.getUpdatedTagList(); // 调用抽取的函数
    this.setData({
      tagList: result3,
    });
    this.setData({
      chosenTag: result3[0],
    });
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