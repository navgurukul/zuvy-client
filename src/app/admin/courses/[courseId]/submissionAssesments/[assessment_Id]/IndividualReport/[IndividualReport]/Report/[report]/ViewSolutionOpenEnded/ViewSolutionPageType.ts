export type PageSubmissionData = {
    id: number
    title:string
    userId: number
    answer: string
    questionId: number
    submitAt: string
    assessmentSubmissionId: number
}

export type PageOpenEndedQuestion = {
    id: number
    question: string
    difficulty: string
}

export type PageAssessmentData = {
    id: number
    openEndedQuestionId: number
    assessmentOutsourseId: number
    bootcampId: number
    moduleId: number
    chapterId: number
    createdAt: string
    submissionsData: PageSubmissionData[]
    OpenEndedQuestion: PageOpenEndedQuestion
}

export type paramsType = {
    courseId: string
    assessment_Id: string
    IndividualReport: string
    report: string
    CodingSolution: number
}

export type BootcampData = {
    name: string;
};

