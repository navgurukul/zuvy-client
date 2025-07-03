export interface Bootcamp {
    id: number
    name: string
    coverImage: string
    bootcampTopic: string
    startTime: string
    duration: string
    language: string
    createdAt: string
    updatedAt: string
}

export interface BootcampType {
    id: number
    bootcampId: number
    type: string
}

export interface Course {
    zuvy_bootcamps: Bootcamp
    zuvy_bootcamp_type: BootcampType
    students_in_bootcamp: number
    unassigned_students: number
}