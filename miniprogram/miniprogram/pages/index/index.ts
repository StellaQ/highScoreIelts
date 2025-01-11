// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
Page({
  data: {
    // 假设这是从服务器获取的打卡数据
    checkinData: [
      { date: '2023-06-01', count: 1 },
      { date: '2023-06-02', count: 2 },
      { date: '2023-06-03', count: 0 },
      { date: '2023-06-04', count: 2 },
      { date: '2023-06-05', count: 1 },
      { date: '2023-06-06', count: 0 },
      { date: '2023-06-07', count: 1 },
      { date: '2023-06-08', count: 2 },
      { date: '2023-06-09', count: 1 },
      { date: '2023-06-10', count: 2 },
      { date: '2023-06-11', count: 1 },
      { date: '2023-06-12', count: 2 },
      { date: '2023-06-13', count: 1 },
      { date: '2023-06-14', count: 2 },
      { date: '2023-06-15', count: 1 },
      { date: '2023-06-16', count: 2 },
      { date: '2023-06-17', count: 1 },
      { date: '2023-06-18', count: 2 },
      { date: '2023-06-19', count: 1 },
      { date: '2023-06-20', count: 2 },
      { date: '2023-06-21', count: 1 },
      { date: '2023-06-22', count: 2 },
      { date: '2023-06-23', count: 2 },
      { date: '2023-06-24', count: 3 },
      { date: '2023-06-25', count: 2 },
      { date: '2023-06-26', count: 2 },
      { date: '2023-06-27', count: 2 },
      { date: '2023-06-28', count: 2 },
      { date: '2023-06-29', count: 2 },
      { date: '2023-06-30', count: 2 }
    ]
  },
  onLoad() {
    this.drawProgressCircle(20, '#progressCircle1', 'part1 20%', 100, 100);
    this.drawProgressCircle(30, '#progressCircle2', 'part2 30%', 100, 100);
    this.drawProgressCircle(40, '#progressCircle3', 'part3 40%', 100, 100);
    this.drawHeatmap();
  },
  onReady: function() {
    
  },
  gotoPage: function (e: any) {
    let part =  e.currentTarget.dataset.part;
    // console.log(part);
    switch (part) {
      case 1:
        // console.log('====');
        wx.navigateTo({ url: '/pages/partOne/partOne'});
        break;
      case 2:
        wx.navigateTo({ url: '/pages/partTwo/partTwo'});
        break;
      case 3:
        wx.navigateTo({ url: '/pages/partThree/partThree'});
        break;
      default:
        break;
    }
  },
  drawHeatmap: function() {
    const query = wx.createSelectorQuery();
    query.select('#heatmapCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;

        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const data = this.data.checkinData;
        const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
        const cellSize = 15;
        const margin = 5;

        // 假设每行显示7天的数据
        const daysInWeek = 7;
        // const weeks = Math.ceil(data.length / daysInWeek);

        data.forEach((item, index) => {
          const week = Math.floor(index / daysInWeek);
          const day = index % daysInWeek;
          const y = week * (cellSize + margin);
          const x = day * (cellSize + margin);
          const color = colors[item.count] || colors[0];

          // console.log('=========='+'x:'+ x + ';y:' + y);
          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellSize, cellSize);
        });
      });
  },
  drawProgressCircle(percent: number, idName: string, percentageTip: string, width: number, height: number) {
    const query = wx.createSelectorQuery();
    // query.select('#progressCircle')
    query.select(idName)
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const context = canvas.getContext('2d');

        // context.clearRect(0, 0, width, height);

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        context.scale(dpr, dpr);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 48;
        // const radius = Math.min(width, height) / 2;
        // const radius = Math.min(canvas.width, canvas.height) / 2;
        // console.log('idName' + idName);
        // console.log(canvas);
        const startAngle = -0.5 * Math.PI; // 起始角度 -90度
        // const startAngle = Math.PI * 1.5;
        const endAngle = startAngle + (percent / 100) * 2 * Math.PI; // 结束角度
        

        // 绘制背景圆环
        context.lineWidth = 4;
        context.strokeStyle = 'red';
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();

        // 绘制进度圆环
        context.lineWidth = 4;
        context.strokeStyle = '#3b5998';
        context.beginPath();
        context.arc(centerX, centerY, radius, startAngle, endAngle);

        context.stroke();

        // 绘制文字
        context.font = '10px sans-serif';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // context.fillText(`${percent}%`, centerX, centerY);
        context.fillText(percentageTip, centerX, centerY);
      });
  }
});




// Component({
//   data: {
//     motto: 'Hello World',
//     userInfo: {
//       avatarUrl: defaultAvatarUrl,
//       nickName: '',
//     },
//     hasUserInfo: false,
//     canIUseGetUserProfile: wx.canIUse('getUserProfile'),
//     canIUseNicknameComp: wx.canIUse('input.type.nickname'),
//   },
//   methods: {
//     // 事件处理函数
//     bindViewTap() {
//       wx.navigateTo({
//         url: '../logs/logs',
//       })
//     },
//     onChooseAvatar(e: any) {
//       const { avatarUrl } = e.detail
//       const { nickName } = this.data.userInfo
//       this.setData({
//         "userInfo.avatarUrl": avatarUrl,
//         hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
//       })
//     },
//     onInputChange(e: any) {
//       const nickName = e.detail.value
//       const { avatarUrl } = this.data.userInfo
//       this.setData({
//         "userInfo.nickName": nickName,
//         hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
//       })
//     },
//     getUserProfile() {
//       // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
//       wx.getUserProfile({
//         desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
//         success: (res) => {
//           console.log(res)
//           this.setData({
//             userInfo: res.userInfo,
//             hasUserInfo: true
//           })
//         }
//       })
//     },
//   },
// })
