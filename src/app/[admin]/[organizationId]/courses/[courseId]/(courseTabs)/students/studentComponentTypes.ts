export type StudentDataPage = {
    id:number
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

export interface Student {
    email: string
    name: string
}

export interface ActionCellProps {
    student: {
        userId: string
        bootcampId: string
        name: string
        email: string
        status?: string
        batchId?: string
    }
}
