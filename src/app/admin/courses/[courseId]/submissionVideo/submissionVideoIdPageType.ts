
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



// Page.tsx
export interface Course {
    name: string
    learnersCount: number
    date: string
    coverImage: string 
    id: number
    students_in_bootcamp: number
}
export interface CourseData {
    name: string
    description?: string
    collaborator?: string
}



export interface ModuleVideoChapter {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  totalStudents:number
  totalSubmittedStudents:number
}

export interface SubmittedStudent {
  id: string;
  name: string;
  email?: string;
  submittedAt?: string;
}

export interface VideoDataResponse {
  moduleVideochapter: ModuleVideoChapter;
  submittedStudents: SubmittedStudent[];
}





// Page.tsx
export interface Course {
    name: string
    learnersCount: number
    date: string
    coverImage: string 
    id: number
    students_in_bootcamp: number
}
export interface CourseData {
    name: string
    description?: string
    collaborator?: string
}

export interface CoursesResponse {
  data: Course[];
  totalBootcamps: number;
  totalPages: number;
}