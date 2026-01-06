export type BootcampData = {
    name: string;
    students_in_bootcamp:number
    unassigned_students:number
};

export interface PageParams {
  params: {
    id: string;
    courseId: string
    assessment_Id: string
    assignmentData:string
    individualStatus:string
  }
}

export interface Params {
  assignmentData: any;
  courseId: string
}
export interface IndividualStudentData {
  user: {
    studentAssignmentStatus: any;
    name: string;
    email: string;
  };
   studentAssignmentStatus?: {
      projectUrl?: string;
    };
  completedAt:any
  status?:string
}


export interface AssignmentStatus {
  userId: string;
  name: string;
  email: string;
  status: string;
  submittedAt?: string;
  chapterId?: string; 
}

export interface AssignmentDataResponse {
  chapterId: string;
  chapterName: string;
  data: AssignmentStatus[];
}

export interface StudentPage {
    id: string;
    email: string;
    emailId: string;
    status: string;
    name:string
}

