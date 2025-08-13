export type BootcampData = {
    name: string;
    students_in_bootcamp:number
    unassigned_students:number
};

export interface PageParams {
  assignmentData: any;
  params: {
    id: string;
    courseId: string
    assessment_Id: string
    assignmentData:string
    individualStatus:string
    StudentForm:string
  }
  courseId:string
  report:string
  StudentForm:string
  IndividualReport:string
}

export interface TrackedFormData {
  trackingData(trackingData: any): unknown;
  trackedData(trackedData: any): unknown;
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  answers: {
    questionId: string;
    response: string;
  }[];
}


export interface FormItem {
  typeId: number;
  question: string;
  id:string
  options: any
  formTrackingData: {
    answer:string;
    chosenOptions: string[];
  }[];
}

// page.tsx
export interface StudentPage {
    id: string;
    email: string;
    emailId: string;
    status: string;
    name:string
}

export interface APIResponse {
  combinedData: StudentPage[];
  totalStudentsCount: number;
  totalPages: number;
  chapterId: string;
  moduleId: string;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  createdAt: string; 
  title:string
  length:number
}

