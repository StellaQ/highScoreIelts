// types.d.ts
export type TagProcess = {
  tagId: string;
  stage: number;
};

export type Question = {
  questionId: string;
  questionText: string;
};

export type SubCategory = {
  tagName: string;
  tagId: string;
  questions: Question[];
};

export type Category = {
  categoryNameInChinese: string;
  subCategories: SubCategory[];
};
