
export type Difficulty = 'Easy' | 'Medium' | 'Hard';


export interface RecordingsProps {
  completedClasses: Recording[];
  loading: boolean;
}

export interface Recording {
  id: number;
  title: string;
  videoUrl: string;
  duration: string;         
  createdAt: string;
  updatedAt: string;
}


export interface RecordingsApiResponse {
  classes: Recording[];
  total_items: number;
  total_pages: number;
}

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
    students_in_bootcamp: number
    unassigned_students: number
}

export interface BootcampData {
    status: string
    message: string
    code: number
    bootcamp: Bootcamp
}

export interface EnrolledCourse {
    id: number
    name: string
    coverImage: string
    bootcampTopic: string
    startTime: string
    duration: string
    language: string
    createdAt: string
    updatedAt: string
    progress: number
}