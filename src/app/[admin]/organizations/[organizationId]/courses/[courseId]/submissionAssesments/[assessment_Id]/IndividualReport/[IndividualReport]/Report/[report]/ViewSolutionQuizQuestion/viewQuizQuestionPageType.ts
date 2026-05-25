// ViewSolutionquizpage.tsx
export type SubmissionData = {
    id: number
    userId: number
    title:string
    questionId: number
    chosenOption?:any
    attemptCount: number
    openEndedQuestionId?:any
}

export type QuizOptions = {
    [key: string]: string
}

export type Quiz = {
    id: number
    question: string
    options: QuizOptions
    difficulty: string
    correctOption: number
    marks: number | null
}

export type QuizDetails = {
    id: number
    quiz_id: number
    assessmentOutsourseId: number
    bootcampId: number
    chapterId: number
    correctOption:number
    chosenOption:number
    question:string
    options:string
    variantId:string
    createdAt: string
    submissionsData: SubmissionData
    Quiz: Quiz
}
export type BootcampData = {
    name: string;
};


// IndividualReport/ReportPage.tsx

export type User = {
    name: string
    email: string
}

export type OpenEndedQuestion = {
    id: number
    question: string
    difficulty: string
    tagId: number
    usage: number
}

export type OpenEndedSubmission = {
    id: number
    answer: string
    questionId: number
    feedback: string | null
    marks: number
    submissionData: SubmissionData
}

export type QuizSubmission = {
    id: number
    chosenOption: number
    questionId: number | null
    attemptCount: number
    submissionData: null
}

export type CodingSubmission = {}

export type StudentAssessment = {
    id: number
    userId: number
    marks: number | null
    startedAt: string
    submitedAt: string
    tabChange: number
    copyPaste: string
    embeddedGoogleSearch: number
    user: User
    openEndedSubmission: OpenEndedSubmission[]
    quizSubmission: QuizSubmission[]
    PracticeCode: any
    totalQuizzes: number
    totalOpenEndedQuestions: number
    totalCodingQuestions: number
}
export type newDataType =
    | {
        openEndedSubmission: OpenEndedSubmission[]
        quizSubmission: QuizSubmission[]
        codingSubmission: CodingSubmission[]
    }
    | any

export interface Example {
    input: string[]
    output: string[]
}

export interface TestCase {
    input: string[]
    output: string[]
}

export interface Submission {
    id: number
    status: string
    action: string
    createdAt: string
    codingOutsourseId: number
}

export interface CodingQuestion {
    questionId: number
    id: number
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    inputBase64: string | null
    examples: Example[]
    testCases: TestCase[]
    expectedOutput: string[]
    solution: string
    createdAt: string | null
    updatedAt: string | null
    usage: number
    submissions: Submission[]
    codingOutsourseId: number
}


export type PageParams = {
  courseId: string
  moduleId: string
  chapterId: string
  assessment_Id:string
  report:string
  IndividualReport:string

}



export interface AssessmentResponse {
  startedAt: string;
  submitedAt: string;
  PracticeCode: any;
  user: {
    name: string;
  };
  submitedOutsourseAssessment: {
    moduleId: number;
    canEyeTrack: boolean;
    canTabChange: boolean;
    canScreenExit: boolean;
    canCopyPaste: boolean;
  };
  codingQuestionCount: number;
  mcqQuestionCount: number;
  openEndedQuestionCount: number;
}
