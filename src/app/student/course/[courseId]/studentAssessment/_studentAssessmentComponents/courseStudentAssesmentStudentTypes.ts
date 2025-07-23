// AssesmentProvider.tsx

export type PageParams = {
  assessmentOutSourceId: string;
  moduleID: string;
  viewcourses: string;
  chapterId: string;
};
export interface AssessmentSubmission{
  submitedAt?: string;
  startedAt?: string;
  reattemptApproved?: boolean;
};
export type AssessmentData = {
  tabChange?: boolean;
  screenRecord?: boolean;
  copyPaste?: boolean;
  timeLimit?: number;
  IsQuizzSubmission:boolean
  easyMcqQuestions?: number;
  mediumMcqQuestions?: number;
  hardMcqQuestions?: number;
  bootcampId?: string;
  moduleId?: string;
  chapterId?: string;
  submission?: {
    startedAt?: string;
  };
  codingQuestions?: CodingQuestion[];
  weightageMcqQuestions?: number;
  easyCodingMark?: number;
  mediumCodingMark?: number;
  hardCodingMark?: number;
  totalMcqQuestions?: number;
   ModuleAssessment?: {
    title?: string;
  };

};


export interface CodingQuestion {
  id: number;
  title: string;
  weightage?: number;
  easyCodingMark?: number;
  mediumCodingMark?: number;
  hardCodingMark?: number;
  tagId?: number;
  codingOutsourseId?: number;
}


export interface QuestionCardProps extends CodingQuestion {
  description: string;
  isMobile: boolean;
  isQuizSubmitted?: boolean
  assessmentSubmitId?: string;
  codingQuestions?: boolean;
  onSolveChallenge: (id: any) => void;
}



export interface SubmittedAssessment {
  submitedAt?: string;
  startedAt?: string;
  reattemptApproved?: boolean;
}

export interface AssessmentSubmissionsResponse {
  submitedOutsourseAssessments: SubmittedAssessment[];
}



export interface CodingSubmissionData {
  action: string;
  languageId: number;
  sourceCode: string;
}

export interface CodingSubmissionApiResponse {
  data: CodingSubmissionData;
}




// CodingSubmission.tsx
export interface TestCasesSubmission {
  status: string
  testCases: TestCase
  stdout?: string
  stdIn?: string;
  expectedOutput?: string;
  stderr?: string
  memory?: string
  time?: string
  stdOut?: string;
  stdErr?: string;
  compileOutput?: string;
}


export interface CodingSubmission{
  status?: string
  action?: string
  message?: string
  data?: {
    sourceCode: string
    TestCasesSubmission: TestCasesSubmission[]
  }
}


// IDE.TSX
export interface Input{
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

export interface TestCase {
    inputs: Input[] | Record<string, unknown>
    expectedOutput: {
        parameterType: string
        parameterValue: [] | {}
    }
}

export interface questionDetails {
    title: string
    description: string
    constraints?: string
    examples: { input: number[]; output: number }
}

export interface IDEProps {
    params: { editor: string }
    onBack?: () => void
    remainingTime?: number
    assessmentSubmitId?: number
    selectedCodingOutsourseId?: number
    getAssessmentData?: any
    runCodeLanguageId?: number
    runSourceCode?: string
}




// OpenEndedQuestions

export interface Question {
  id: number;
  OpenEndedQuestion: {
    question: string;
  };
  questionText: string;
  submissionsData?:{
    answer: string;
  }[];
}

export interface OpenEndedQuestionsProps {
  onBack: () => void;
  remainingTime: number;
  questions: Question[];
  assessmentSubmitId: number;
  getSeperateOpenEndedQuestions: () => void;
  getAssessmentData: () => void;
}



// ProctoringAlert
export type AlertProps = {
  title: string;
  description: string;
  violationCount?: string;
};

export type AlertContextType = {
  showAlert: (props: AlertProps) => void;
  hideAlert: () => void;
};





// QuestionCard.tsx
export type Tag = {
    id: number
    tagName: string
}


// QuizQuestions.tsx

export interface QuizQuestion {
  id: number;
  difficulty: string;
  mark: number | string;
  outsourseQuizzesId: number | string;
  variantId: number;
  question: string;
  options: string[]
  submissionsData?: Array<{
    chosenOption: number | string;
  }>;
}

export interface QuizData {
  mcqs: QuizQuestion[];
}

export interface QuizQuestionsProps {
  onBack: () => void;
  weightage?: number;
  remainingTime: number;
  questions: { data: QuizData };  
  assessmentSubmitId: number;
  getSeperateQuizQuestions: () => void;
  getAssessmentData: () => void;
}


// TimerDisplay.tsx
export interface TimerDisplayProps{
  remainingTime: number;
}