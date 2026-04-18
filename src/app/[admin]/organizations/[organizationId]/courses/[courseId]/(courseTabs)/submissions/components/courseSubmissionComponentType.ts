

// AssesmentSubmissionComponent
export interface AssessmentSubmissions{
    id?: string
    title: string
    totalCodingQuestions: number
    totalMcqQuestions: number
    totalStudents:number
    totalOpenEndedQuestions:number
    totalSubmitedAssessments:number
    qualifiedStudents:number
    [key: string]: any;
}

export interface StudentAssessmentSubmission {
    name: string
    email: string
    isPassed: boolean
    percentage: number
    codingScore?: number
    mcqScore?: number
    tabChange: number
    copyPaste: number
    requiredCodingScore:number
    requiredMCQScore:number
}

export interface ModuleAssessmentData{
    passPercentage: number
}

export interface APIResponses {
    submitedOutsourseAssessments: StudentAssessmentSubmission[]
    ModuleAssessment: ModuleAssessmentData
}


// AssignmentContent.tsx
export type AssignmentTrackingData = {
  id: string;
  title: string;
  status: string; 
  moduleChapterData:string
  name:string
};

export type AssignmentApiResponse = {
  data: {
    trackingData: AssignmentTrackingData[];
    totalStudents: number;
  };
};


export type AssignmentProps = {
    courseId: number
    debouncedSearch: string
}

export interface AssignmentModuleData{
  id: string; 
  title:string,
  submitStudents: number;
}



// PracticeProblems
export type PractieProblemProps = {
    courseId: number
    debouncedSearch: string
}



export interface PracticeSubmissionData{
  id: string;
  title: string;
  status: string; 
}

export interface PracticeProblemApiResponse{
  trackingData: PracticeSubmissionData[]; 
  totalStudents: number;
}


export interface SubmissionPractice{
  id: string;
  studentName: string;
  score: number;
}

export interface SubmissionsResponse {
  trackingData: SubmissionPractice[];
  totalStudents: number;
}



// VideoSubmission
export interface VideoSubmissions{
  title: string;
  id:string
  completedStudents: number;
}

export interface VideoData {
  totalStudents: number;
  totalRows: number;
  message?: string;
  [moduleKey: string]: VideoSubmissions[] | number | string | undefined;
}
