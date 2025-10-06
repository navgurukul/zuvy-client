import {LucideIcon } from 'lucide-react'
// navbar-notification
export interface Notification {
    id: number;
    message: string;
    time: string;
    read: boolean;
}

export interface SidebarItemProps {
    icon?: LucideIcon
    label: string
    href?: string
    onClick?: () => void
    subtabs?: SidebarItemProps[]
}



// CourseCard
export interface CourseCardProps {
  param: string
  name: string
  description: string
  id: number
  isLock: boolean
  progress: number
  timeAlloted: number
  articlesCount: number
  assignmentCount: number
  codingProblemsCount: number
  quizCount: number
  typeId: number
  projectId: number
}

export interface ChapterTracking {
  id: number; 
}

export interface ChapterTrackingResponse {
  trackingData: ChapterTracking[];
}

