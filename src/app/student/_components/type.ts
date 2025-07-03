
export interface EnrolledCourse {
  id: number
  name: string
}

export interface AttendanceData {
  attendedClasses: number
  attendance: number
  totalClasses: number
  bootcampId: number 
}

export interface ResumeCourse {
  bootcampName?: string;
  moduleName?: string;
  bootcampId?: number;
  newChapter?: Chapter;
  moduleId?: number;
  typeId?: number;
}
export interface Chapter {
  id: number;
  title: string;
}



export interface Assignment {
  id: number;
  title: string;
  dueDate: string;  
  status: string;
}

export interface ClassData {
  id: number;
  title: string;
  status: string;
  startTime: string;
  dueDate: string;
}

export interface UserInfo {
    id: number
    name: string
    email: string
    averageScore: number
}
export interface Student {
    attendance: number
    userInfo: UserInfo
}