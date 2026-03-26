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


export interface PageParams {
  id: string;
  slug: string;
}

// Form data interface - duration string hai form mein
export interface CourseDetailsFormData {
    name: string
    bootcampTopic?: string
    description: string
    duration: number
    language: string
    startTime: Date
    coverImage?: string
    collaborator?: string
}

// API Response interface for course update
export interface UpdateCourseResponse {
    status: string
    message: string
    updatedBootcamp: Array<{
        id: number
        name: string
        bootcampTopic: string
        description: string
        coverImage: string
        collaborator: string
        startTime: string
        duration: string
        language: string
        unassigned_students: number
    }>
}

// API Response interface for image upload
export interface ImageUploadResponse {
    urls: string[]
}