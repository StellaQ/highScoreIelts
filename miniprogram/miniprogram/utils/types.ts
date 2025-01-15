// types.d.ts
export type TagProcess = {
  tagId: string;
  stage: number;
  reviewDate: string;
};

export type TagList = {
  tagId: string;
  tagName: string;
  stage: number;
  questions: Question[];
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
