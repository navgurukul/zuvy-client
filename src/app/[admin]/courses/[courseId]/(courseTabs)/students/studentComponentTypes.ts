export type StudentDataPage = {
    email: string
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
}

export interface StudentPage {
    email: string
    name: string
}

export type StudentDataState = StudentPage[]