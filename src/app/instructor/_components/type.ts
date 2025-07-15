import RadioCheckbox from "./radioCheckbox"

// Curricullum.tsx
export interface Course {
    id: number
    name: string
    description: string
    order: number
    typeId: number
    timeAlloted: number
    projectId?: number
    articlesCount: number
    assignmentCount: number
    quizCount: number
    codingProblemsCount: number
}
export interface Chapter {
    id: number
    name: string
}

export interface TrackingResponse {
    trackingData: Chapter[]
}


// RadioCheckbox
export interface RadioCheckboxProps {
    fetchSessions: (sessions: any[]) => void
    offset: number
    position: number
    setTotalSessions: (count: number) => void
    setPages: (pages: number) => void
    setLastPage: (page: number) => void
    debouncedSearch?: string
}

export interface Option {
    label: string
    value: string
}


export interface Batch {
    value: string
    label: string
}

interface UpcomingClass {
    id: string
    title: string
    // add more fields based on actual response structure
}

export interface UpcomingClassResponse{
    response: UpcomingClass[]
    classDetails: UpcomingClass[]
    totalCompletedClass: number
    totalPages:number
    totalPage:number
    totalUpcomingPages: number
}
