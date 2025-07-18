// CourseCard
export interface CourseCardProps {
  param: string;
  name: string;
  description: string;
  id: number;
  isLock: boolean;
  progress: number;
  timeAlloted: number;
  articlesCount: number;
  assignmentCount: number;
  codingProblemsCount: number;
  quizCount: number;
  typeId: number;
  projectId: number;
}


export interface TrackingDataItem {
  id: number;
}
export interface TrackingDataResponse {
  trackingData: TrackingDataItem[];
}



// navbar-NavbarNotifications
export interface Notification {
    id: number;
    message: string;
    time: string;
    read: boolean;
}

