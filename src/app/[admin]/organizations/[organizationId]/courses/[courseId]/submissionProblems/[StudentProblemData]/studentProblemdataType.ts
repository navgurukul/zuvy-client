export interface StudentPage {
    userName: string;
    userEmail: string;
    id: string;
    email: string;
    emailId: string;
    status: string;
    name:string
}


export interface BootcampData{
  id: string;
  name: string;
}

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


export interface CodingQuestionDetails {
    id: number
    title: string
}

export interface ModuleChapterData {
    id: number
    codingQuestionDetails: CodingQuestionDetails
    submitStudents: number
}


export interface Module {
    id: number
    typeId: number
    isLock: boolean
    bootcampId: number
    name: string
    description: string
    projectId: number | null
    order: number
    timeAlloted: number
    moduleChapterData: ModuleChapterData[]
}

