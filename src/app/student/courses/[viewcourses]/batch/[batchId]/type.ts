// interface CourseProgress {
//     status: string
//     progress: number
//     bootcampTracking: {
//         name: string
//     }
//     code: number
// }
// interface Instructor {
//     instructorId: number
//     instructorName: string
//     instructorPicture: string
// }







export interface AttendanceData {
  attendedClasses: number
  attendance: number
  totalClasses: number
  bootcampId: number 
}

export interface BootcampTracking {
  name: string
}

export interface CourseProgress {
  status: string
  progress: number
  bootcampTracking: BootcampTracking
  code: number
}

export interface Instructor {
  instructorId: number
  instructorName: string
  instructorPicture: string
}

export interface ClassItem {
  id: string
  title: string
  status: string
}

export interface SubmissionItem {
  id: string
  title: string
  dueDate: string
}
export interface BootcampProgressResponse {
  data: CourseProgress               
  instructorDetail: Instructor[]     
}


export interface FilterClassesBlock {
  ongoing: ClassItem[]
  upcoming: ClassItem[]
}

export interface ClassesListResponse {
  data: {
    filterClasses: FilterClassesBlock
  } | []     
}

export interface SmallClassesResponse {
  data: {
    filterClasses: FilterClassesBlock
  }
}

export interface AttendanceResponse {
  sessions: number
  present: number
}

export interface UpcomingSubmissionResponse {
  data: {
    upcomingAssignments: SubmissionItem[]
    lateAssignments: SubmissionItem[]
  }
}
