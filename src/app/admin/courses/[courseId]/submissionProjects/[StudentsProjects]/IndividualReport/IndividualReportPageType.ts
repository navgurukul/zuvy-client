export interface PageParams {
  params: {
    videoId: any;
    individualReport: any;
    StudentsProjects: any;
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



export interface Instruction {
  description: string;
}

export interface IndividualStudentResponse{
  projectSubmissionDetails?: ProjectSubmissionDetails;
}

export type BootcampData = {
    name: string;
    students_in_bootcamp:number
    unassigned_students:number
};


export interface UserDetails {
  name: string;
}

export interface ProjectTrackingData {
  projectLink:string;
  userDetails: UserDetails;
  updatedAt:string
}

export interface ProjectSubmissionDetails {
  title: string;
  instruction:any
  projectTrackingData: ProjectTrackingData[];
}

export interface IndividualStudentData {
  projectSubmissionDetails: ProjectSubmissionDetails;
}



// page.tsx
export interface StudentPage {
    userName: string;
    userEmail: string;
    id: string;
    email: string;
    emailId: string;
    status: string;
    name:string
}


export interface BootcampModule{
  id: string;
  name: string;
}

export interface ProjectSubmissionResponse{
  data: {
    bootcampModules: BootcampModule[];
  };
  totalStudents: number;
}
