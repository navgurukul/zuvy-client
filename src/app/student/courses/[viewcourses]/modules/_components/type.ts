export interface EditorDoc {
  type: string
  content?: EditorDoc[]
  text?: string               
}

// export interface RemirrorJSON {
//   type: 'doc'
//   content: any[]         
// }

export interface ChapterContent {
  title: string
  articleContent: (string | EditorDoc)[]
  links: string[]
}
export interface ArticleProps {
  content: ChapterContent
  completeChapter: () => void
  status: 'Completed' | 'Pending' | 'In-Progress'
}



// Assessment file

export interface SubmittedAssessment {
  reattemptApproved: boolean
  reattemptRequested: boolean
  isPassed: boolean
  percentage: number
  marks: number
  startedAt: string
  submitedAt: string
  userId: string
}

export interface ModuleAssessment {
  title: string
}

export interface AssessmentShortInfo {
  assessmentId: string
  timeLimit: number
  passPercentage: number
  weightageMcqQuestions: number
  weightageCodingQuestions: number
  deadline?: string
  ModuleAssessment?: ModuleAssessment
  submitedOutsourseAssessments: SubmittedAssessment[]
  totalCodingQuestions: number
  totalQuizzes: number
  totalOpenEndedQuestions: number
  easyCodingQuestions: number
  mediumCodingQuestions: number
  hardCodingQuestions: number
  easyMcqQuestions: number
  mediumMcqQuestions: number
  hardMcqQuestions: number
  assessmentState?: 'ACTIVE' | 'PUBLISHED' | 'DRAFT' | 'CLOSED' | string  
}

export interface ChapterContent {
  id: number
  status: string
  assessmentId: string
}

export interface AssessmentProps {
  assessmentShortInfo: AssessmentShortInfo|null
//   assessmentOutSourceId: string
//   submissionId: string
  chapterContent: ChapterContent
  setAssessmentShortInfo: (data: AssessmentShortInfo |null ) => void
//   setAssessmentOutSourceId: (id: string) => void
//   setSubmissionId: (id: string) => void
  setAssessmentOutSourceId: (id: number | null) => void;
  setSubmissionId: (id: number | null) => void;

  assessmentOutSourceId: number | null;
  submissionId: number | null;
}




// Assignment file 
export interface TextItem{
  type: string
  text?: string
}

export interface Paragraph {
  type: string
  content?: TextItem[]
}

export interface ArticleDoc{
  type: string
  content?: Paragraph[]
}

export interface Props {
  projectId: number
  moduleId: number
  bootcampId: number
  chapterId:number
  data:string
    completeChapter: () => void
  content: {
    id: number
    title: string
    description:string
    articleContent: ArticleDoc[] | null
  }
  fetchChapters: () => Promise<void> 
}
export interface AssignmentTracking {
  projectUrl: string
  createdAt: string
}

export interface ChapterDetails {
  completionDate: string
}

export interface AssignmentResponse {
  data: {
    data: {
      assignmentTracking: AssignmentTracking[]
      chapterDetails: ChapterDetails
      status: string
    }
}
}




//  Chapter file

export interface Chapter {
    id: number
    title: string
    topicId: number
    chapterTrackingDetails: { id: number }[]
    status: string
}


export interface ModuleState {
  moduleName: string
  trackingData: TrackingData[]
}


export interface ModuleDetails {
  typeId: number
  projectId: number
  name: string  

}

export interface TrackingData {
  id: number
  topicId: number
  chapterId?: number
  status?: string
  assessmentId?: number
  [key: string]: any
}

export interface ChapterResponse{
  trackingData: TrackingData[]
  moduleDetails: ModuleDetails[]
}



// @@@@@@@@@@@CodingChallenge@@@@@@@@@@@@
export interface Tag {
    id: number
    tagName: string
}

export interface CodingQuestion{
  id: number
  title: string
  description: string
  difficulty: string
  tagId: number
  codingOutsourseId: number
}


export interface CodingQuestionResult {
  action: 'submit' | 'run'
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Pending'
  questionDetail: {
    id: number
    title: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    description: string
    action: 'submit' | 'compile' | 'error'
  }
}

export interface ChapterContent {
  id: number
  title: string
}


export interface CodingProblem {
  id: number
  tagId: number
  title: string
  difficulty: string
  description: string
  codingOutsourseId: number
}


export interface QuizAndAssignmentRes {
  data: {
    codingProblem: CodingProblem[]
  }
}






// @@@@@@@@@@@@@@ CodingQuestionCard @@@@@@@@@@@
export interface QuestionCardProps {
    id: number
    title: string
    difficulty: string
    description: string
    status: string
    tagName: any
    tagId?: number
    isSuccess?: boolean
    onSolveChallenge: (id: number) => void
}
export interface questionDetails {
    id: any
    title: string
    description: string
    difficulty: string
    constraints?: string
    testCases?: string
    examples: { input: number[]; output: number }
}




// CodingSubmission

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


// FeedbackForm
export enum QuestionType {
  SingleChoice = 1,
  MultiChoice  = 2,          
  Paragraph    = 3,
  Date         = 4,          
  Time         = 5,
}


export interface FormTrackingData {
  chosenOptions: (number | string)[];
   answer?: string; 
}
export interface QuizTrackingData {
  chosenOption: number;
  status: 'pass' | 'fail';
}
export interface Question {
  id: number;
  question: string;
  options: Record<string, string>;
  typeId: QuestionType;
  isRequired: boolean;
    correctOption: number;
   status: "Completed" | "Pending";
  answer?: string | string[] | Date;
  formTrackingData: FormTrackingData[];
  quizTrackingData?: QuizTrackingData[];
}
export interface FetchFormRes {
  questions?: Question[];
  trackedData?: Question[]; 
   isSuccess: boolean;
  data: {
    status: "Completed" | "Pending";
    quizDetails: Question[];
  };         
}



// Projects.tsx
export interface ProjectTrackingData {
  projectLink: string | null;
  updatedAt: string;
}

export interface ProjectInstruction {
  description: EditorDoc[] | string;   
}

export interface ProjectData {
  id: number;
  title: string;
  deadline: string;
  instruction: ProjectInstruction;
  projectTrackingData: ProjectTrackingData[];
}

export interface ProjectApiSuccess {
  status:string;
  data: {
    status: string;
    projectData: ProjectData[];
  };
}

// Video.tsx
export type ChapterStatus = 'Pending' | 'Completed';

export interface VideoContent {
  description: string;
  links: string[];
  status: ChapterStatus;
}