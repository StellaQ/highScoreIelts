export function getShareAppMessage(userId: string) {
  const title = '高分雅思 - 提升你的雅思口语成绩';
  const path = `/pages/index/index?inviterId=${userId}`; // 包含 inviterId 的分享路径
  const imageUrl = '../../assets/pics/share5.jpg'; // 自定义分享图片

  return {
    title: title,
    path: path,
    imageUrl: imageUrl,
    success: function (res: any) {
      console.log('分享成功', res);
    },
    fail: function (res: any) {
      console.log('分享失败', res);
    }
  };
}