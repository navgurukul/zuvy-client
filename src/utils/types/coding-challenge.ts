export interface Input {
    parameterName: string;
    parameterType: string;
    parameterValue: any[];
}

export interface TestCase {
    inputs: Input[] | Record<string, unknown>;
    expectedOutput: {
        parameterType: string;
        parameterValue: any;
    };
}

export interface QuestionDetails {
    title: string;
    description: string;
    constraints?: string;
    examples: any[];
    testCases: TestCase[];
    templates: Record<string, { template: string }>;
}

export interface CodeResult {
    status: string;
    stdIn?: string;
    stdOut?: string;
    stdout?: string;
    stdErr?: string;
    stderr?: string;
    expectedOutput?: string;
    compileOutput?: string;
}

export interface SubmissionData {
    action: 'run' | 'submit';
    programLangId: string;
    sourceCode: string;
}

export interface CodingLanguage {
    lang: string;
    id: number;
}

export interface CodingChallengeState {
    questionDetails: QuestionDetails | null;
    currentCode: string;
    language: string;
    languageId: number;
    loading: boolean;
    isSubmitting: boolean;
    codeResult: CodeResult[];
    codeError: string;
    isAlreadySubmitted: boolean;
    localIsCompleted: boolean;
    showConfirmModal: boolean;
    isSolutionModalOpen: boolean;
    modalType: 'success' | 'error';
}

export type CodingChallengeAction =
    | { type: 'SET_QUESTION_DETAILS'; payload: QuestionDetails }
    | { type: 'SET_CODE'; payload: string }
    | { type: 'SET_LANGUAGE'; payload: { language: string; languageId: number } }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SUBMITTING'; payload: boolean }
    | { type: 'SET_CODE_RESULT'; payload: CodeResult[] }
    | { type: 'SET_CODE_ERROR'; payload: string }
    | { type: 'SET_ALREADY_SUBMITTED'; payload: boolean }
    | { type: 'SET_COMPLETED'; payload: boolean }
    | { type: 'SET_CONFIRM_MODAL'; payload: boolean }
    | { type: 'SET_SOLUTION_MODAL'; payload: boolean }
    | { type: 'SET_MODAL_TYPE'; payload: 'success' | 'error' }
    | { type: 'RESET_ERRORS' };

export interface ApiError {
    message: string;
    data?: CodeResult[];
}

export interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message?: string;
} 