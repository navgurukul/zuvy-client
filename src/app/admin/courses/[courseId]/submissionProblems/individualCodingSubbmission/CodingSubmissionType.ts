export interface PageParams {
  params: {
    CodingSubmission: unknown;
    StudentProblemData: boolean
    id: string;
    courseId: string
    assessment_Id: string
    assignmentData:string
    individualStatus:string
    StudentForm:string
  }
}



export interface CodingQuestionDetails {
    description:string;
    constraints:string;
    difficulty: string;
    id: number
    title: string
}
export interface CodingSubmission {
  TestCasesSubmission: any;
  questionDetail: CodingQuestionDetails;
  id: string;
  studentName: string;
  status: string;
  score: number;
  sourceCode:string
  submissionDate: string;
}


export interface ApiResponse{
  data: CodingSubmission;
}
