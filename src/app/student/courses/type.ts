// page.tsx

export interface EnrolledCourse {
    name: string
    coverImage: string
    id: number
    progress: number
    batchId: number
}


export interface ChapterInfo {
  id: number
  title: string
}

export interface ResumeCourse {
    bootcampName?: string
    newChapter?: ChapterInfo
    title?: string
    moduleName?: string
    bootcampId?: number
    moduleId?: number
    typeId?: number
}

export interface LatestUpdatedCourseRes {
  data: ResumeCourse | ResumeCourse[]  
  message: string                       
}


export interface StudentDashboardRes {
  inProgressBootcamps: EnrolledCourse[]
}
