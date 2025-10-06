// ApproveReattempt
export interface ReattemptData {
  reattemptRequested?: boolean;
  reattemptApproved?: boolean;
  id?:number
}


export interface PageParams {
  params: {
    id: string;
    courseId: string
    assessment_Id: string
  }
}

export interface Suggestion {
    id: string;
    name: string;
    email: string;
}

export type SubmissionData = {
    id: number
    userId: number
    title:string
    questionId: number
    chosenOption?:any
    attemptCount: number
    totalStudents:number
    totalSubmitedStudent?:number
    openEndedQuestionId?:any
    totalQualifiedStudents:number
}
export type BootcampData = {
    name: string;
};



export interface StudentRaw {
  id?: string;
  studentId?: string;
  name?: string;
  studentName?: string;
  email?: string;
  studentEmail?: string;
  student?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

