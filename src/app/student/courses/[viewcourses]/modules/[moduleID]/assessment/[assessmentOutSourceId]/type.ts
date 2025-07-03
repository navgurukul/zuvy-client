// CodingSubmission

import OpenEndedQuestions from "./OpenEndedQuestions"
import { showProctoringAlert } from "./ProctoringAlerts"
import QuestionCard from "./QuestionCard"
import TimerDisplay from "./TimerDisplay"

export interface Language {
  id:   number
  name: string
}
export interface Status {
  id:          number
  description: string
}
export interface Submission {
  id:           number
  finished_at:  string          
  language:     Language
  status:       Status
  status_id:    number
  source_code:  string          
}
export interface SubmissionsResponse {
  respond: Submission[]
}




// IDE.tsx file

export interface EyeTrackingProctorProps {
  assessmentSubmitId: string | number;
  updateViolationCount: () => void;
}

export interface EyeTrackingResult {
  direction: string;
  error?: string;
}




// IDE.tsx file

// export interface Input {
//     parameterName: string
//     parameterType: string
//     parameterValue: [] | {}
// }

// export interface TestCase {
//     inputs: Input[] | Record<string, unknown>
//     expectedOutput: {
//         parameterType: string
//         parameterValue: [] | {}
//     }
// }

// export interface questionDetails{
//     title: string
//     description: string
//     constraints?: string
//     examples: { input: number[]; output: number }
// }

// export interface IDEProps{
//     params: { editor: string }
//     onBack?: () => void
//     remainingTime?: any
//     assessmentSubmitId?: number
//     selectedCodingOutsourseId?: number
//     getAssessmentData?: any
//     runCodeLanguageId?: number
//     runSourceCode?: string
// }





export interface IDERouteParams {
  editor:    string;  
  moduleID:  string;
  viewcourses: string;
  chapterId:  string;
}

/* ──────────────  test‑case structure  ─────────────── */
export type PrimitiveType = 'int' | 'float' | 'str' | 'jsonType';

export interface Input {
  parameterName:  string;
  parameterValue: unknown;
  parameterType:  PrimitiveType;
}

export interface ExpectedOutput {
  parameterValue: unknown;
  parameterType:  PrimitiveType;
}

export interface TestCase {
  inputs:          Input[] | Record<string, unknown>;
  expectedOutput:  ExpectedOutput;
}

export interface QuestionDetails{
  title:        string;
  description:  string;
  constraints:  string;
   examples: {
    input:  unknown[]
    output: unknown
  }
  testCases:  TestCase[];
  templates:  Record<string, { template: string }>;
}
export interface CodeRunResult {
  status:          'Accepted' | 'Wrong Answer' | 'Compilation Error';
  stdOut?:         string;
  stdout?:         string;
  stdErr?:         string;
  stderr?:         string;
  compileOutput?:  string;
  expectedOutput?: string;
  stdIn?:          string;
}

export interface IDEProps {
  params:               IDERouteParams;
  remainingTime:        number;
  assessmentSubmitId:   number;
  selectedCodingOutsourseId:  number;
  runCodeLanguageId?:         number;
  runSourceCode?:             string;
  onBack:                     () => void;
  getAssessmentData:          () => void;
}




// OpenEndedQuestions 
export interface SubmissionData {
  answer: string
}

export interface OEQ {
  question: string
}

export interface OpenEndedQuestionItem{
  id: number
  OpenEndedQuestion: OEQ
  submissionsData: SubmissionData[]
}

export interface OpenEndedQuestionSubmissionDto{
  questionId: number
  answer: string
}

export interface OpenEndedQuestionsProps{
  onBack: () => void
  remainingTime: number
  questions: OpenEndedQuestionItem[]
  assessmentSubmitId: number
  getSeperateOpenEndedQuestions: () => void
  getAssessmentData: () => void
}

// ProctoringAlert file 

export interface OpenEndedQuestionsProps {
  onBack: () => void
  remainingTime: number
  questions: OpenEndedQuestionItem[]
  assessmentSubmitId: number
  getSeperateOpenEndedQuestions: () => void
  getAssessmentData: () => void
}

// src/types/alert.ts
export interface AlertProps {
  title: string;
  description: string;
  violationCount?: string;
}

export interface AlertContextType {
  showAlert: (props: AlertProps) => void;
  hideAlert: () => void;
}
declare global {
  interface Window {
    alertSystem?: AlertContextType;
  }
}
export interface AlertProviderProps {
  children: React.ReactNode
  requestFullScreen: (element: Element) => void
  setIsFullScreen: (isFullScreen: boolean) => void
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
    // assessmentOutsourseId?: number
    assessmentSubmitId?: number
    codingOutsourseId?: number
    codingQuestions?: boolean
    onSolveChallenge: (id: number) => void
    isQuizSubmitted?: boolean
    isMobile?: boolean
}
export type Tag = {
    id: number
    tagName: string
}

export interface AllTagsResponse {
  allTags: Tag[];
}
export interface CodingSubmissionResponse {
  data: {
    action: 'run' | 'submit' | 'compile'   
  }
}


// QuizQuestion.tsx
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface MCQSubmissionData {
  chosenOption: number            
  status?: 'passed' | 'failed'    
}

export interface MCQQuestion {
  id: number
  outsourseQuizzesId: number     
  variantId: number
  difficulty: Difficulty
  question: string
  mark:number
  options: Record<string, string>  
  submissionsData: MCQSubmissionData[]
}
export interface QuizApiResponse {
  data: {
    mcqs: MCQQuestion[]
  }
}
export interface QuizSubmissionDto {
  questionId: number
  variantId: number
  attemptCount: number
  chosenOption: number
}

export interface QuizQuestionsProps {
  onBack: () => void
  weightage?: number
  remainingTime: number
  questions: QuizApiResponse
  assessmentSubmitId: number
  getSeperateQuizQuestions: () => void
  getAssessmentData: () => void
}

export interface QuizSubmissionItem{
  questionId: number
  variantId: number
  attemptCount: number
  chosenOption: number
}


// TimerDisplay

export interface TimerDisplayProps {
    remainingTime: number
}