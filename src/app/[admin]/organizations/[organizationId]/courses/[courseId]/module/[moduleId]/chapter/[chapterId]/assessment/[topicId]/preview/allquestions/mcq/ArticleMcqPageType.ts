export type PageQuizVariant = {
  options(options: any): unknown;
  question: string;
};

export type PageQuizQuestion = {
  id: string;
  question:string
  quizVariants: PageQuizVariant[];
};

export type AssessmentPreviewContent = {
  Quizzes: PageQuizQuestion[];
};


export type MCQParams = {
  courseId: string
  moduleId: string
  chapterId: string
}