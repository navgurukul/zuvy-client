import InstructorCard from "./instructorCard";
import RadioCheckbox from "./radioCheckbox";

// CurricullumCard
export interface Chapter {
  id: number;
  name: string;
  status: string;
}

export interface GetChaptersResponse {
  trackingData: Chapter[];
}



export interface CourseModule {
  id: number;
  order: number;
  name: string;
  description: string;
  typeId: number;
  projectId: number;
  timeAlloted: number;
  articlesCount: number;
  assignmentCount: number;
  quizCount: number;
  codingProblemsCount: number;
}
export type Props = {
  course: CourseModule;
};



// InstructorCard
export type InstructorCardProps = {
    batchName: string
    topicTitle: string
    startTime: string
    endTime: string
    typeClass: string
    classLink: string
    status: string
}


// RadioCheckbox
export interface RadioCheckboxProps {
    fetchSessions: (data: any) => void
    offset: number
    position: any
    setTotalSessions: any
    setPages: any
    setLastPage: any
    debouncedSearch?: string
}

export interface Option {
    label: string
    value: string
}
export type Batch = {
  batchId: number;
  batchName: string;
};

export interface UpcomingClassResponse {
  responses: any[]; 
  totalUpcomingClasses: number;
  totalUpcomingPages: number;
}

export interface CompletedClassResponse {
  classDetails: any[]; 
  totalCompletedClass: number;
  totalPages: number;
}
