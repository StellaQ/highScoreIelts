import Toast from '@vant/weapp/toast/toast';

const app = getApp();

interface Question {
  text: string;
  answer?: string;
  audioPath?: string;
}

Page({
  data: {
    questions: [] as Question[],
    isRecording: false,
    timer: 0,
    currentQuestionIndex: 0,
    canSubmit: false,
    recorderManager: null as WechatMiniprogram.RecorderManager | null
  },

  onLoad() {
    // 初始化录音管理器
    const recorderManager = wx.getRecorderManager();
    this.setData({ recorderManager });

    // 监听录音结束事件
    recorderManager.onStop((res) => {
      const { tempFilePath } = res;
      const questions = [...this.data.questions];
      questions[this.data.currentQuestionIndex].audioPath = tempFilePath;
      this.setData({ questions });
      this.checkCanSubmit();
    });

    // 获取模拟考试题目
    this.getExamQuestions();
  },

  async getExamQuestions() {
    try {
      // 这里应该从服务器获取题目，暂时使用模拟数据
      const mockQuestions = [
        { text: "Could you tell me about your hometown?" },
        { text: "What do you do for work or study?" },
        { text: "Do you like reading books? Why or why not?" },
        { text: "What kind of food do you like?" },
        { text: "Do you prefer to travel alone or with others?" }
      ];

      this.setData({ questions: mockQuestions });
    } catch (error) {
      console.error('获取题目失败:', error);
      Toast.fail('获取题目失败');
    }
  },

  startRecording() {
    const { recorderManager } = this.data;
    if (!recorderManager) return;

    // 开始录音
    recorderManager.start({
      duration: 60000, // 最长录音时间，单位ms
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3'
    });

    this.setData({ isRecording: true });
    this.startTimer();
  },

  stopRecording() {
    const { recorderManager } = this.data;
    if (!recorderManager) return;

    recorderManager.stop();
    this.setData({ isRecording: false });
    this.stopTimer();
  },

  startTimer() {
    this.setData({ timer: 60 });
    this.timerInterval = setInterval(() => {
      if (this.data.timer > 0) {
        this.setData({ timer: this.data.timer - 1 });
      } else {
        this.stopRecording();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  checkCanSubmit() {
    const canSubmit = this.data.questions.every(q => q.audioPath);
    this.setData({ canSubmit });
  },

  async submitExam() {
    if (!this.data.canSubmit) return;

    try {
      // 这里应该上传录音文件并获取AI评分
      // 暂时使用模拟数据
      const questions = this.data.questions.map(q => ({
        ...q,
        answer: "这是一个模拟的AI评分回答。在实际应用中，这里会显示基于用户录音的详细评分和建议。"
      }));

      this.setData({ questions });
      Toast.success('提交成功');
    } catch (error) {
      console.error('提交失败:', error);
      Toast.fail('提交失败');
    }
  },

  onUnload() {
    this.stopTimer();
  }
}); 