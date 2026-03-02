export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ';

export interface Topic {
  id: string;
  name: string;
  availableQuestions?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface Domain {
  id: string;
  name: string;
  topics: Topic[];
}

export interface TopicSelection {
  topicId: string;
  difficulty: Difficulty;
  questionCount: number;
}

export interface AssessmentCriteria {
  id: string;
  domainId: string;
  topics: TopicSelection[];
  questionType: QuestionType;
}

export interface AssessmentConfig {
  name: string;
  description: string;
  criteria: AssessmentCriteria[];
}

export interface PreviousAssessment {
  id: string;
  name: string;
  domains: string[];
  difficulty: Difficulty;
  totalQuestions: number;
  dateTaken: string;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  domain: string;
  topic: string;
  difficulty: Difficulty;
}

export interface GeneratedQuestionSet {
  id: string;
  name: string;
  totalQuestions: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  domainsCovered: string[];
  questions: MCQQuestion[];
  isPublished?: boolean;
  version?: number;
}

export interface SelectedAssessmentWithWeight {
  assessmentId: string;
  weightage: number;
}

export type WizardStep = 
  | 'configuration'
  | 'fetchingPrevious'
  | 'selectPrevious'
  | 'weightage'
  | 'generatingQuestions'
  | 'generatedSets'
  | 'reviewQuestions'
  | 'finalActions';
