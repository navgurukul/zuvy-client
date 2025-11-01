import { ColumnDef } from "@tanstack/react-table"

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

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    setSelectedRows?: any
    mcqSide?: boolean
}

// Additional types moved from page.tsx for reuse
export interface EnhancedBatch {
    id: string | number
    name: string
    instructorEmail: string
    capEnrollment: number
    students_enrolled: number
    status: string
    startDate?: string
    endDate?: string
}

export interface PermissionsType {
    createBatch: boolean
    deleteBatch: boolean
    editBatch: boolean
    viewBatch: boolean
}