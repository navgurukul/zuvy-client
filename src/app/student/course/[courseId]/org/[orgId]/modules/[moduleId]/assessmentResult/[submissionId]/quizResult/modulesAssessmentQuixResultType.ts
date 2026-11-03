export interface MCQResult {
  quizId: number;
  difficulty: 'easy' | 'medium' | 'hard' | string; 
  mark: number | string;
  correctOption: string | number;
  question: string;
  options: Record<string, string>;
  submissionsData?: {
    status: 'passed' | 'failed' | string;
    chosenOption?: string | number;
  };
}


