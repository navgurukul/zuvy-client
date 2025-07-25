

// CourseDashboardPage.tsx
export interface TruncatedDescriptionProps {
  text: string;
  maxLength?: number;
  className?: string;
}


// ModuleContentPage.tsx

export interface BaseItem {
  id: string;
  title: string;       
  name: string;         
  description: string;  
  status: string;       
  startDate?: Date;
  endDate?: Date;
  duration?: string;
  totalMarks?: number;
}


export interface TopicItem extends BaseItem{
  type: string;
  scheduledDateTime?: Date;
}

export interface Topic extends BaseItem{
  items: TopicItem[];
}

export interface Module extends BaseItem{
  topics: Topic[];
}


export interface Course extends BaseItem{
  modules: Module[];
}



// StudentDashboard.tsx
export interface UpcomingEvent extends BaseItem{
  startTime: string;
  endTime: string;
  // status: string;
  bootcampId: number;
  bootcampName: string;
  batchId: number;
  eventDate: string;
  type: string;
  moduleId?: number;
  chapterId?: number;
  hangoutLink?: string;
}

export interface Bootcamp extends BaseItem {
  coverImage: string;
  duration: string;
  language: string;
  bootcampTopic: string;
  batchId: number;
  batchName: string;
  progress: number;
  instructorDetails: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
  // status: string;
  upcomingEvents: UpcomingEvent[];
}

// type.ts

export interface TrackingDataType {
  id: number;
  status: string;
  // baaki fields yahan define karo
}

export interface ModuleDetailsType {
  name: string;
  description: string;
  // aur fields
}

export interface UseAllChaptersReturn {
  trackingData: TrackingDataType[];
  moduleDetails: ModuleDetailsType;
  loading: boolean;
  error: any;
  refetch: () => void;
}
