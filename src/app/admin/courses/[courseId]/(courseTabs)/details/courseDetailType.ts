export interface CourseData {
    id: number
    name: string
    bootcampTopic: string
    description?: string
    coverImage?: string
    collaborator?: string
    duration?: number
    language: string
    startTime?: string
    unassigned_students?: number
}