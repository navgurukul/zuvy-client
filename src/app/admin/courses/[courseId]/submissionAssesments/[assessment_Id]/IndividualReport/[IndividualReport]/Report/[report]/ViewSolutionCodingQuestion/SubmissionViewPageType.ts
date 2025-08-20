// page.tsx
export type CodingSubmissionData = {
    data: {
        questionDetail: {
            title: string;
            description:string;
            difficulty?:string
            constraints?: string;
        };
    };
};


export type BootcampData = {
    name: string;
};


export type ProctoringData = {
    user: {
        name: string;
    };
};


// TestCase
export type Parameter = {
  parameterType: string;
  parameterValue: any;
};
export type TestCase = {
    inputs: Parameter;
    output: string;
    stderr:string
    status: string;
    memory?: number; 
    time?: number;
    stdout:string
  testCases: {
    inputs: any;
    expectedOutput: {
      parameterType: string;
      parameterValue: any;
    };
  };
};


export type QuestionDetail = {
    title: string;
    description: string;
    difficulty?: string;
    constraints?: string;
};

export type CodingSubmissionResponse = {
    data: {
        sourceCode: string;
        TestCasesSubmission: TestCase[];
        questionDetail: QuestionDetail;
    };
};
