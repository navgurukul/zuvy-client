import OpenEndedQuestions from "./OpenEndedQuestions";

export interface SubmissionData {
  chosenOption: any;
  answer: any;
  id: number;
  startedAt: string;
}

// AssessmentProvider
export interface SubmittedAssessment {
  submitedAt?: string
  startedAt?: string
  reattemptApproved?: boolean
}

export interface AssessmentSubmissionResponse {
  submitedOutsourseAssessments: SubmittedAssessment[]
}
export interface CodingSubmissionDatas {
  action: string
  languageId: number
  sourceCode: string
}

export interface CodingSubmissionResponse {
  data: CodingSubmissionDatas
}

export interface AssessmentResponse{
  submission: {
    id: number
    startedAt: string
  }
  chapterId: number
  canTabChange: boolean
  canScreenExit: boolean
  canCopyPaste: boolean
  canEyeTrack: boolean
}


export interface TestCase {
  inputs: Record<string, unknown> | Array<{
    parameterName: string
    parameterValue: unknown
    parameterType: string
  }>
  expectedOutput: {
    parameterValue: unknown
  }
}

export interface TestCasesSubmission {
  stdIn: any;
  expectedOutput: any;
  stdOut: string | undefined;
  stdErr: string | undefined;
  compileOutput: any;
  status: string
  testCases: TestCase
  stdout?: string
  stderr?: string
  memory?: string
  time?: string
}

export interface CodingSubmissionData {
  status?: string
  action?: string
  message?: string
  data?: {
    sourceCode: string
    TestCasesSubmission: TestCasesSubmission[]
  }
}



export interface Input {
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

export interface TestCases {
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
    remainingTime?: any
    assessmentSubmitId?: number
    selectedCodingOutsourseId?: number
    getAssessmentData?: any
    runCodeLanguageId?: number
    runSourceCode?: string
    getCodingSubmissionsData?: any
}

// OpenEndedQuestions
export interface AssessmentProps{
  onBack: () => void;
  remainingTime: number;
  questions: any[];
  assessmentSubmitId: number;
  getSeperateOpenEndedQuestions: () => void;
  getAssessmentData: () => void;
}



export interface Question{
  submissionsData?: SubmissionData[];
}

// showProctoringAlert
export type AlertProps = {
  title: string;
  description: string;
  violationCount?: string;
};

export type AlertContextType = {
  showAlert: (props: AlertProps) => void;
  hideAlert: () => void;
};

declare global {
  interface Window {
    alertSystem?: AlertContextType;
  }
}


// QuestionCard
export interface QuestionCardProps {
    id: number
    title: string
    weightage?: number
    easyCodingMark?: number
    mediumCodingMark?: number
    hardCodingMark?: number
    description: string
    tagId?: number
    assessmentSubmitId?: number
    codingOutsourseId?: number
    codingQuestions?: boolean
    onSolveChallenge: (id: number) => void
    isQuizSubmitted?: boolean
    isMobile?: boolean
    setIsCodingSubmitted: React.Dispatch<React.SetStateAction<boolean>>;

}

export type Tag = {
    id: number
    tagName: string
}


// TimerDisplay
export interface TimerDisplayProps {
  remainingTime: number;
}

export type QType = "quiz" | "open-ended" | "coding";

export type PageParams = {
  params: {
    assessmentOutSourceId: string;
    moduleID: string;
    viewcourses: string;
    chapterId: string;
  };
};

export type CodingQuestion = {
  codingQuestionId: number;
  codingOutsourseId: number;
  title: string;
  difficulty: string;
};

export type AssessmentData = {
  ModuleAssessment: { title: string };
  submission: { startedAt: string; id: number };
  chapterId: number;
  moduleId: string | number;
  bootcampId: string | number;
  // MCQ
  IsQuizzSubmission: boolean;
  hardMcqQuestions: number;
  easyMcqQuestions: number;
  mediumMcqQuestions: number;
  totalMcqQuestions: number;
  weightageMcqQuestions?: number;
  // Coding
  codingQuestions: CodingQuestion[];
  easyCodingMark?: number;
  mediumCodingMark?: number;
  hardCodingMark?: number;
  // Proctoring config
  canTabChange?: boolean;
  canScreenExit?: boolean;
  canCopyPaste?: boolean;
  canEyeTrack?: boolean;
  // time
  timeLimit?: number; // seconds
};