// api for partone
function getTagProcessByUserId(userId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://localhost:3001/api/miniprogramOne/getTagProcessByUserId',  // 请求查询接口
      method: 'GET',
      data: {
        userId: userId,  // 用户 ID
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);  // 返回请求成功的结果
        } else {
          reject(new Error('请求失败'));
        }
      },
      fail: (err) => {
        reject(err);  // 请求失败的错误
      }
    });
  });
}
function getQuestionsFortoday (ArrQIds, userId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://localhost:3001/api/miniprogramOne/getAIAnswers',  // 请求更新接口
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        ArrQIds: ArrQIds,
        userId: userId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);  // 返回成功数据
        } else {
          reject(new Error('getQuestionsFortoday failed'));  // 请求失败
        }
      },
      fail: (err) => {
        reject(err);  // 请求失败
      }
    });
  });
}
function getAIanswer(question, userId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://localhost:3001/api/miniprogramOne/askAI',  // 请求更新接口
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        question: question,
        userId: userId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);  // 返回成功数据
        } else {
          reject(new Error('AI request failed'));  // 请求失败
        }
      },
      fail: (err) => {
        reject(err);  // 请求失败
      }
    });
  });
}
function updateTagProcess(userId, tagId, stage, reviewDate) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://localhost:3001/api/miniprogramOne/updateTagProcess',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        userId,
        tagId,
        stage,
        reviewDate
      },
      success: (res) => {
        // console.log('成功:', res.data);
        resolve(res.data); // **必须调用 resolve，否则 .then() 不会执行**
      },
      fail: (err) => {
        // console.error('失败:', err);
        reject(err); // **必须调用 reject，否则 catch() 不会执行**
      }
    });
  });
}
module.exports = {
  getTagProcessByUserId,
  getAIanswer,
  getQuestionsFortoday,
  updateTagProcess
};
