export interface Input {
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}




export interface Example {
  input: Input[];
  output: {
    parameterType: string;
    parameterValue: [] | {};
  };
}

export interface TestCase {
    inputs: Input[] | Record<string, unknown>
    expectedOutput: {
        parameterType: string
        parameterValue: [] | {}
    }
    status:string
}

export interface QuestionDetails {
    title: string;
    description: string;
    constraints?: string;
    examples: Example[];
    testCases: TestCase[];
    templates: Record<string, { template: string }>;
}

export interface CodeEditorProps {
    questionId: string;
    chapterId?: number;
    onChapterComplete?: () => void;
}