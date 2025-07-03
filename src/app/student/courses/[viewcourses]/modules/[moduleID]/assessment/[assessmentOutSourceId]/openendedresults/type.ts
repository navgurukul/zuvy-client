export interface SubmissionData {
    id: number
    userId: number
    answer: string
    questionId: number
    submitAt: string
    assessmentSubmissionId: number
}

export interface OpenEndedQuestion {
    id: number
    question: string
    difficulty: string
}

export interface OpenEndedResult {
    id: number
    openEndedQuestionId: number
    assessmentOutsourseId: number
    bootcampId: number
    moduleId: number
    chapterId: number
    createdAt: string
    submissionsData: SubmissionData[]
    OpenEndedQuestion: OpenEndedQuestion
}