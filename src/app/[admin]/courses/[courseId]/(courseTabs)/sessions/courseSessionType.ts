// EditSession
export interface EditSessionProps {
    meetingId: string
    initialData: {
        sessionTitle: string
        description: string
        startTime: string
        endTime: string
    }
    getClasses: () => void
    open: boolean 
    onClose: () => void 
    setIsDialogOpen: any
}


export type ClassType = 'active' | 'upcoming' | 'complete'

export interface State {
    classType: ClassType
    position: string
    allClasses: any[]
    bootcampData: { value: string; label: string }[]
    batchId: number
    upcomingClasses: any[]
    pages: number
    offset: number
    currentPage: number
    totalStudents: number
    ongoingClasses: any[]
    completedClasses: any[]
    selectedDate: Date | null
    lastPage: number
    limit: number
}
export interface ParamsType {
  params: {
    courseId: string;
  };
}


export interface CourseClassItem {
  id: number;
  name: string;
  isActive: boolean;
  deadline: string; 
  startTime:string
  status:string
  title:string
}
