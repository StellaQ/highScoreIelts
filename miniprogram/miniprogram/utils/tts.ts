import { baiduConfig } from './config'

// 获取百度语音合成 access token
const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `grant_type=client_credentials&client_id=${baiduConfig.apiKey}&client_secret=${baiduConfig.secretKey}`,
      success: (res: any) => {
        console.log('Token response:', res.data)
        if (res.data && res.data.access_token) {
          resolve(res.data.access_token)
        } else {
          console.error('Token error response:', res)
          reject(new Error(res.data.error_description || '获取access_token失败'))
        }
      },
      fail: (error) => {
        console.error('Token request failed:', error)
        reject(error)
      }
    })
  })
}

// 文本转语音
export const textToSpeech = async (text: string): Promise<string> => {
  if (!text || text.trim() === '') {
    throw new Error('文本内容不能为空')
  }

  try {
    const token = await getAccessToken()
    console.log('Got token:', token)
    
    // 构建请求参数
    const params = {
      tex: encodeURIComponent(text),
      tok: token,
      cuid: 'highscoreielts',
      ctp: 1,
      lan: 'en',
      spd: 4,
      pit: 5,
      vol: 5,
      per: 4,
      aue: 3
    }

    // 构建查询字符串
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const audioUrl = `https://tsn.baidu.com/text2audio?${queryString}`
    console.log('Audio URL:', audioUrl)
    return audioUrl

  } catch (error) {
    console.error('TTS Error:', error)
    throw error
  }
}

// 播放音频
export const playTTS = async (text: string) => {
  try {
    wx.showLoading({ title: '语音生成中...' })
    const audioUrl = await textToSpeech(text)
    
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = audioUrl
    
    return new Promise((resolve, reject) => {
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
        wx.hideLoading()
      })
      
      innerAudioContext.onError((res) => {
        console.error('播放错误:', res)
        wx.hideLoading()
        wx.showToast({
          title: '播放失败',
          icon: 'error'
        })
        innerAudioContext.destroy()
        reject(res)
      })
      
      innerAudioContext.onEnded(() => {
        console.log('播放结束')
        innerAudioContext.destroy()
        resolve(true)
      })
      
      innerAudioContext.play()
    })
  } catch (error) {
    wx.hideLoading()
    wx.showToast({
      title: '语音生成失败',
      icon: 'error'
    })
    throw error
  }
} 