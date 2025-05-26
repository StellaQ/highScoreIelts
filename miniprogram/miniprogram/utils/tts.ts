import { baiduConfig } from './config'

// 获取百度语音合成 access token
const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${baiduConfig.apiKey}&client_secret=${baiduConfig.secretKey}`,
      method: 'POST',
      success: (res: any) => {
        if (res.data.access_token) {
          resolve(res.data.access_token)
        } else {
          reject(new Error('获取access_token失败'))
        }
      },
      fail: reject
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
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://tsn.baidu.com/text2audio',
        method: 'POST',
        responseType: 'arraybuffer',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          tex: text,
          tok: token,
          cuid: 'highscoreielts',
          ctp: 1,
          lan: 'en',
          spd: 4,
          pit: 5,
          vol: 5,
          per: 3,
          aue: 6
        },
        success: (res: any) => {
          // 检查是否返回了错误信息
          if (res.data.err_no) {
            reject(new Error(res.data.err_msg))
            return
          }

          // 检查返回的内容类型
          const contentType = res.header['Content-Type'] || res.header['content-type']
          if (contentType && contentType.includes('audio/')) {
            // 转换音频数据为base64
            const base64Audio = wx.arrayBufferToBase64(res.data)
            resolve(`data:audio/mp3;base64,${base64Audio}`)
          } else {
            reject(new Error('返回的不是音频数据'))
          }
        },
        fail: (error) => {
          console.error('请求失败:', error)
          reject(error)
        }
      })
    })
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