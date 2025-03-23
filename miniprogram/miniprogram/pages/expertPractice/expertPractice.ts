import { Category, TagList } from '../../utils/types'; // 导入定义的类型 
import Toast from '@vant/weapp/toast/toast'; 
import { getLeftList, getFilteredTagIdsToday, getTagList} from '../../utils/onloadDataExpert.js'; 

import { getShareAppMessage } from '../../utils/shareUtil';

const staticQuestions = require('../../assets/data/staticQuestions.js');
const API = require('../../utils/api.js');

const app = getApp();

interface IAppOption {
  globalData: {
    userInfo?: UserInfo;
    _pollingTimer: any;
    inviterId?: string;
    hasUsedInviteCode?: boolean;
    [key: string]: any;
  };
  getShareConfig: (options?: { 
    title?: string; 
    path?: string; 
    query?: string;
    imageUrl?: string;
  }) => {
    title: string;
    path: string;
    query: string;
    imageUrl: string;
  };
}

Page({
  data: {
    activeNames: ['个人信息','日常生活','兴趣爱好', '习惯与常规', '居住环境', '未来计划', '文化与社会', '技术与媒体'], // 左侧列表默认全部展开
    categories: [] as Category[], //
    showLeftPanel: false, // 左侧列表弹出/消失

    tagList: [] as TagList[],
    currentIndex: 0, // 当前标签索引
    isPrevDisabled: true, // 上一页按钮是否禁用
    isNextDisabled: false, // 下一页按钮是否禁用

    chosenTag: {},
    userInfo: {
      userId: '',
      isVip: false // 决定review的时候能不能点开定制开关
    },

    memoryGapDays: [1,3,7,15,'done']
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
  
    if (chosenTag.stage !== 0 && !this.data.userInfo.isVip) {
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
  },  
  onChangeChoices(event: { detail: any; currentTarget: { dataset: { id: any; }; }; }) {
    const inputStr = event.detail;  // 获取选中的值
    const qId = event.currentTarget.dataset.id;  // 获取对应的 qId
  
    // 获取 chosenTag
    let { chosenTag } = this.data;
  
    // 遍历 chosenTag 中的 questions
    for (let i = 0; i < chosenTag.questions.length; i++) {
      const question = chosenTag.questions[i];  // 获取当前问题对象
  
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
  useNumber() {
    // 移除此方法的内容，保留空方法以避免引用错误
  },  
  produceAnswer(event: { currentTarget: { dataset: { id: any; }; }; }) {
    const isVip = this.data.userInfo.isVip;
    
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
    const userId = this.data.userInfo.userId;
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
  checkIfCanSubmitTagProcess() {
    const { chosenTag } = this.data;
    if (!chosenTag || !chosenTag.questions) {
      return false; // 选中的 tag 或 questions 为空时，直接返回 false
    }
    // 检查所有 questions 的 AIanswer 是否都不为空
    return chosenTag.questions.every(q => q.AIanswer && q.AIanswer.trim() !== '');
  },
  updateTagStateInCategories (tagIdToUpdate, newStage) {
    const category = this.data.categories.find(category =>
      category.subCategories.some(tag => tag.tagId === tagIdToUpdate)
    );
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
