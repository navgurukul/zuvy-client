export type QuizResultsProps = {
  params: {
    submissionId: string;
  };
};


export type QuizResponseResult = {
  quizId: string;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mark: number | string;
  submissionsData?: {
    status?: 'passed' | 'failed';
    selectedAnswer?: string;
  };
};


export type OptionValue = string | number; 

export type SubmissionData = {
  chosenOption: string | number;
};



export type QuestionResult = {
  quizId: string | number;
  question: string;
  options: Record<string, OptionValue>;
  correctOption: string | number;
  correctAnswer: string;
  submissionsData?: SubmissionData;
};
