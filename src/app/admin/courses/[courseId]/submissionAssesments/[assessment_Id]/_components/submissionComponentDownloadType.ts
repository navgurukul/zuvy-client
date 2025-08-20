export type PracticeCode = {
    questionDetail: {
        title: string;
    };
    status: string;
};


export type ReportData = {
    user?: {
        name?: string;
        email?: string;
    };
    submitedAt: string;
    startedAt: string;
    percentage?: number;
    copyPaste?: number;
    tabChange?: number;
    fullScreenExit?: number;
    PracticeCode: PracticeCode[];
    codingScore?: number;
    mcqScore?: number;
    attemptedMCQQuestions?: number;
    submitedOutsourseAssessment: {
        totalCodingQuestions: number;
        weightageCodingQuestions?: number;
        totalMcqQuestions: number;
        weightageMcqQuestions?: number;
    };
};

export type DownloadReportProps = {
    userInfo: {
        userId:string;
        id: string;
        title: string;
    };
    submitedAt: string; 
};
