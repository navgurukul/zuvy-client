
export type TemplatesMap = Record<string, { template: string }>;


export interface Input{
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

export interface TestCase {
    inputs: Input[] | Record<string, unknown>
    expectedOutput: Input
    status?: 'Accepted' | 'Wrong Answer' | string;
    stdOut?: string
    compileOutput?: string
    stdErr?: string
    stdIn?: string
}

export type CodeRunResult = TestCase;


export interface QuestionDetails {
    title: string
    description: string
    constraints?: string
    examples: { input: number[]; output: number }[] 
    testCases?: TestCase[]
    templates?: TemplatesMap
}

export interface IDEProps {
    params: { editor: string }
    remainingTime?: number
    assessmentSubmitId?: number
    onBack?: () => void
    selectedCodingOutsourseId?:  string | number
}