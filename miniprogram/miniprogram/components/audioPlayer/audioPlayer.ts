import { textToSpeech } from '../../utils/tts'

Component({
  properties: {
    text: {
      type: String,
      value: ''
    },
    texts: {
      type: Array,
      value: []
    }
  },

  data: {
    isPlaying: false,
    innerAudioContext: null as any,
    currentTextIndex: 0
  },

  methods: {
    async onPlayTap() {
      if (this.data.isPlaying) {
        this.stopPlaying()
      } else {
        if (this.properties.texts && this.properties.texts.length > 0) {
          await this.startPlayingMultiple()
        } else {
          await this.startPlaying()
        }
      }
    },

    async startPlayingMultiple() {
      try {
        this.stopPlaying()
        this.setData({ currentTextIndex: 0 })
        await this.playNextText()
      } catch (error) {
        console.error('播放多段文本错误:', error)
        wx.hideLoading()
        wx.showToast({
          title: '播放失败',
          icon: 'error'
        })
      }
    },

    async playNextText() {
      const { texts, currentTextIndex } = this.data
      if (currentTextIndex >= texts.length) {
        this.setData({ 
          isPlaying: false,
          currentTextIndex: 0
        })
        return
      }

      try {
        console.log('准备播放文本:', texts[currentTextIndex])
        wx.showLoading({ title: '语音生成中...' })
        const audioUrl = await textToSpeech(texts[currentTextIndex])
        console.log('获取到音频URL:', audioUrl)
        
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.src = audioUrl
        
        innerAudioContext.onPlay(() => {
          console.log('开始播放音频')
          this.setData({ isPlaying: true })
        })
        
        innerAudioContext.onError((res) => {
          console.error('播放错误, 详细信息:', res)
          wx.showToast({
            title: '播放失败',
            icon: 'error'
          })
          this.setData({ 
            isPlaying: false,
            innerAudioContext: null
          })
          innerAudioContext.destroy()
        })
        
        innerAudioContext.onEnded(() => {
          console.log('当前段落播放结束')
          innerAudioContext.destroy()
          this.setData({ 
            currentTextIndex: this.data.currentTextIndex + 1,
            innerAudioContext: null
          })
          this.playNextText()
        })
        
        this.setData({ innerAudioContext })
        innerAudioContext.play()
        wx.hideLoading()
      } catch (error) {
        console.error('TTS Error, 详细信息:', error)
        wx.hideLoading()
        wx.showToast({
          title: '语音生成失败',
          icon: 'error'
        })
      }
    },

    async startPlaying() {
      try {
        this.stopPlaying()
        console.log('准备播放文本:', this.properties.text)
        wx.showLoading({ title: '语音生成中...' })
        const audioUrl = await textToSpeech(this.properties.text)
        console.log('获取到音频URL:', audioUrl)
        
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.src = audioUrl
        
        innerAudioContext.onPlay(() => {
          console.log('开始播放音频')
          this.setData({ isPlaying: true })
        })
        
        innerAudioContext.onError((res) => {
          console.error('播放错误, 详细信息:', res)
          wx.showToast({
            title: '播放失败',
            icon: 'error'
          })
          this.setData({ 
            isPlaying: false,
            innerAudioContext: null
          })
          innerAudioContext.destroy()
        })
        
        innerAudioContext.onEnded(() => {
          console.log('播放结束')
          this.setData({ 
            isPlaying: false,
            innerAudioContext: null
          })
          innerAudioContext.destroy()
        })
        
        this.setData({ innerAudioContext })
        innerAudioContext.play()
        wx.hideLoading()
      } catch (error) {
        console.error('TTS Error, 详细信息:', error)
        wx.hideLoading()
        wx.showToast({
          title: '语音生成失败',
          icon: 'error'
        })
      }
    },

    stopPlaying() {
      const { innerAudioContext } = this.data
      if (innerAudioContext) {
        console.log('停止播放')
        try {
          innerAudioContext.stop()
          innerAudioContext.destroy()
        } catch (error) {
          console.error('停止播放出错:', error)
        }
        this.setData({ 
          isPlaying: false,
          innerAudioContext: null,
          currentTextIndex: 0
        })
      }
    }
  },

  lifetimes: {
    detached() {
      console.log('组件销毁，清理资源')
      this.stopPlaying()
    }
  },

  pageLifetimes: {
    hide() {
      console.log('页面隐藏，停止播放')
      this.stopPlaying()
    }
  }
}) 