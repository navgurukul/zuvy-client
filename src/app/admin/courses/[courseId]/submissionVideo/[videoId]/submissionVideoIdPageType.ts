export interface PageParams{
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


export type BootcampData = {
    name: string;
    students_in_bootcamp:number
    unassigned_students:number
};

export interface StudentPage {
    userName: string;
    userEmail: string;
    id: string;
    email: string;
    emailId: string;
    status: string;
    name:string
}