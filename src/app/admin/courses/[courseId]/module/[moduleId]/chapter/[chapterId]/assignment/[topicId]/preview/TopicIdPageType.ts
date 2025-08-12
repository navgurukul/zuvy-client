export type PriviewEditorDoc = {
    type: string
    content: any[]
}
export type Params = {
  courseId: string
  moduleId: string
  chapterId: string
}


export type PriviewQuizTag = {
  id: string;
  name: string;
};


export type TopicCodingQuestion = {
  correctOption: number
  quizVariants: any
  id: number;
  title: string;
  difficulty: string;
  description: string;
  tagId?: string;
};

export type QuestionItem = {
  options: string[];
  typeId: number;
  question: string;
};
