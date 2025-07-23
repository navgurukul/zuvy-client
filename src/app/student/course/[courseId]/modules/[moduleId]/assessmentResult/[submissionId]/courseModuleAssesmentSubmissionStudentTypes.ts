export type ViewAssessmentResultsParams = {
  courseId: string;
  moduleId: string;
  submissionId: string;
};

export type AssessmentViewResultsData = {
  assessmentOutsourseId: number;
  isPassed: boolean;
  percentage: number;
  startedAt: string;    
  submitedAt: string;
  percent:number
  openEndedQuestionCount:number
  mcqScore:number
  submitedOutsourseAssessment?: {
    passPercentage: number;
    totalCodingQuestions: number;
    easyCodingMark?: number;
    mediumCodingMark?: number;
    hardCodingMark?: number;
     easyMcqQuestions?: number;     
  mediumMcqQuestions?: number;    
  hardMcqQuestions?: number;     
  weightageMcqQuestions?: number; 
  totalMcqQuestions?: number; 
  };
  PracticeCode: CodingQuestionResult[];
attemptedMCQQuestions?: number;
attemptedOpenEndedQuestions?: number;
};


export type CodingQuestionResult = {
  id:number
  codingOutsourseId:number
  questionId:number
  questionDetail: {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    title:string
  };
  status: 'Accepted' | 'Rejected' | 'Pending'; 
};



