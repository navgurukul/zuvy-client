export interface TestCase {
  inputs: Record<string, unknown> | Array<{
    parameterName: string;
    parameterValue: unknown;
    parameterType: string;
  }>;
  expectedOutput: {
    parameterValue: unknown;
  };
}

export interface TestCasesSubmission {
  status: string;
  testCases: TestCase;
  stdout?: string;
  stderr?: string;
  memory?: string;
  time?: string;
}

export interface CodingSubmissionData {
  status?: string;
  action?: string;
  message?: string;
  data?: {
    sourceCode: string;
    TestCasesSubmission: TestCasesSubmission[];
  };
}