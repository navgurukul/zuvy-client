export type StudentData = {
    email: string
    id:number
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
}



// page.tsx
export interface ParamsType{
  courseId: number;
}

export interface BatchSuggestion {
    id: number
    name: string
    students_enrolled: number
}

export interface Student {
    email: string
    name: string
}

export type StudentDataState = Student[]