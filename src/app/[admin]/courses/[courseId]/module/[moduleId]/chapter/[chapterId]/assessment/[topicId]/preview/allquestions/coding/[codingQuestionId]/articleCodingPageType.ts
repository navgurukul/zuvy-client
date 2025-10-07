export interface QuestionIdquestionDetails {
    title: string
    description: string
    constraints: string
    testCases: QuestionIdTestCase[]
    examples: { input: number[]; output: number }
}

export interface QuestionIdInput{
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

export interface  QuestionIdTestCase {
    inputs: QuestionIdInput[] | Record<string, unknown>
    expectedOutput: {
        parameterType: string
        parameterValue: [] | {}
    }
}

export type QuestionParams = {
  courseId: string
  moduleId: string
  chapterId: string
  codingQuestionId:string
}

