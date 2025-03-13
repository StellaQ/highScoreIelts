import { validateFeedback, sanitizeText } from '../../utils/contentValidator';

interface PageData {
  feedbackText: string;
  images: string[];
}

interface PageInstance {
  data: PageData;
}

interface PageMethods {
  onFeedbackInput(event: WechatMiniprogram.Input): void;
  chooseImage(): Promise<void>;
  previewImage(e: WechatMiniprogram.TouchEvent): void;
  deleteImage(e: WechatMiniprogram.TouchEvent): void;
  submitFeedback(): Promise<void>;
}

interface UploadResult {
  url: string;
}

Page<PageData, PageInstance & PageMethods>({
  data: {
    feedbackText: '',
    images: []
  },

  onFeedbackInput(event: WechatMiniprogram.Input) {
    this.setData({
      feedbackText: event.detail.value
    });
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await wx.chooseMedia({
        count: 3 - this.data.images.length,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const tempFilePaths = res.tempFiles.map(file => file.tempFilePath);
      this.setData({
        images: [...this.data.images, ...tempFilePaths]
      });
    } catch (error) {
      console.error('选择图片失败:', error);
    }
  },

  // 预览图片
  previewImage(e: WechatMiniprogram.TouchEvent) {
    const current = e.target.dataset.src;
    wx.previewImage({
      current,
      urls: this.data.images
    });
  },

  // 删除图片
  deleteImage(e: WechatMiniprogram.TouchEvent) {
    const index = e.target.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 提交反馈
  async submitFeedback() {
    const { feedbackText, images } = this.data;

    // 验证内容
    const validation = validateFeedback(feedbackText, images);
    if (!validation.isValid) {
      wx.showToast({
        title: validation.message || '内容验证失败',
        icon: 'none'
      });
      return;
    }

    // 清理文本内容
    const sanitizedText = sanitizeText(feedbackText);

    try {
      // 上传图片
      const uploadedImages: string[] = [];
      if (images.length > 0) {
        for (const tempFilePath of images) {
          const uploadRes = await new Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>((resolve, reject) => {
            wx.uploadFile({
              url: 'http://localhost:3001/api/feedback/upload',
              filePath: tempFilePath,
              name: 'image',
              success: resolve,
              fail: reject
            });
          });
          const result = JSON.parse(uploadRes.data) as UploadResult;
          uploadedImages.push(result.url);
        }
      }

      // 提交反馈
      const res = await new Promise<WechatMiniprogram.RequestSuccessCallbackResult>((resolve, reject) => {
        wx.request({
          url: 'http://localhost:3001/api/feedback/submit',
          method: 'POST',
          data: {
            content: sanitizedText,
            images: uploadedImages
          },
          success: resolve,
          fail: reject
        });
      });

      if (res.statusCode === 200) {
        wx.showToast({
          title: '反馈已提交',
          icon: 'success'
        });

        // 清空表单
        this.setData({
          feedbackText: '',
          images: []
        });

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    }
  },

  onShareAppMessage(res: any) {
    return {
      title: '高分雅思 - 提升你的雅思成绩',
      path: '/pages/index/index', // 分享的路径
      imageUrl: '../../assets/pics/share-image.png', // 自定义分享图片
      success: function (res: any) {
        // 分享成功后的回调
        console.log('分享成功', res);
      },
      fail: function (res: any) {
        // 分享失败后的回调
        console.log('分享失败', res);
      }
    }
  }
}); 