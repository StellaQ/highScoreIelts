// 处理左端列表数据 - 进阶练习
export function getLeftList(tagProcess, staticQuestions) {
  return staticQuestions.map((category) => {
    return {
      categoryNameInChinese: category.categoryNameInChinese,
      subCategories: category.subCategories.map((subCategory) => {
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
}
// categoryNameInChinese: "个人信息"
// subCategories: Array(2)
// 0: {tagName: "Hometown", tagId: "t1", stage: 0}
// 1: {tagName: "Where you live", tagId: "t2", stage: 0}

export function getFilteredTagIdsToday (tagProcess) {
  const today = new Date().toISOString().split('T')[0]; // 获取今天日期
  const filteredTagIds = tagProcess
    .filter((tag) => tag.reviewDate <= today && [1, 2, 3, 4].includes(tag.stage))
    .map((tag) => tag.tagId);
  return filteredTagIds;
}

export function getTagList(tagProcess, questionProcess, staticQuestions, filteredTagIdsToday) {

  const tagList = [];

  // 把今天要复习的filteredTagIdsToday从staticQuestions找到并push到tagList
  const filteredTagIdsTodaySet = new Set(filteredTagIdsToday);
  const addedTagIds = new Set();
  staticQuestions.forEach((category) => {
    category.subCategories.forEach((subCategory) => {
      if (filteredTagIdsTodaySet.has(subCategory.tagId) && !addedTagIds.has(subCategory.tagId)) {
        const tagInfo = tagProcess.find((tag) => tag.tagId === subCategory.tagId);
        const updatedQuestions = subCategory.questions.map((question) => ({
          ...question,
          isSwitchChecked: false,
          isButtonDisabled: false,
          isButtonLoading: false,
          isFlipped: false,
          step0: '',
          step1: '',
          step2: '',
          step3: '',
        }));
        tagList.push({
          tagId: subCategory.tagId,
          tagName: subCategory.tagName,
          stage: tagInfo ? tagInfo.stage : 0,
          isTodayReviewed: false,
          questions: updatedQuestions
        });
        addedTagIds.add(subCategory.tagId);
      }
    });
  });
  // console.log('1111111111');
  // console.log(tagList);     //[{tagId: "t3", tagName: "Work and Study", stage: 2, questions: Array(2)}]
  // console.log(addedTagIds);  //Set(1) {"t3"}
  
  // 查找不在tagProcess中的tagId,也就是全新的题目push到tagList
  const tagIdsInProcess = new Set(tagProcess.map((tag) => tag.tagId));
  staticQuestions.forEach((category) => {
    category.subCategories.forEach((subCategory) => {
      if (!tagIdsInProcess.has(subCategory.tagId)) {
        const updatedQuestions = subCategory.questions.map((question) => ({
          ...question,
          isSwitchChecked: true,
          isButtonDisabled: false,
          isButtonLoading: false,
          isFlipped: false,
          step0: '',
          step1: '',
          step2: '',
          step3: '',
          AIanswer: ''
        }));
        tagList.push({
          tagId: subCategory.tagId,
          tagName: subCategory.tagName,
          stage: 0, // 默认 stage 为 0
          isTodayReviewed: false,
          questions: updatedQuestions
        });
      }
    });
  });

  // filteredTagIdsTodaySet里的['t3']在tagList里的['t3']下的questions'q8''q9'去questionProcessMap找对应的AIanswer添加上
  const questionProcessMap = new Map(questionProcess.map((process) => [process.qId, process]));
  return tagList.map((tag) => {
    if (filteredTagIdsTodaySet.has(tag.tagId)) {
      const updatedQuestions = tag.questions.map((question) => {
        const matchingProcess = questionProcessMap.get(question.qId);
        return {
          ...question,
          AIanswer: matchingProcess ? matchingProcess.AIanswer : null,
        };
      });
      return {
        ...tag,
        questions: updatedQuestions,
      };
    }
    return tag;
  });
}
