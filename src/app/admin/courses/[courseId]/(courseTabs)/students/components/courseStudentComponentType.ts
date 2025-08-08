export interface CourseStudentBatchItem {
  value: string | number       
  label: string;        
  isFull?: boolean;     
}


export interface ComboboxStudentProps {
  batchData: CourseStudentBatchItem[];
  batchName?: string;
  userId?: string | number;
  bootcampId: string | number;
  batchId?: string | number;
  selectedRows?: any[]; 
  fetchStudentData:any; 
}


// DeleteModelNew.tsx
export interface DeleteAlertDialogProps {
    title: string
    description: string
    userId: any
    bootcampId: any
    fetchStudentData?: any
    setSelectedRows?: any
}



// CompoboxStudentDataTable
export interface ComboxAlertDialogProps{
    name: string
    email: string
    userId: number
    bootcampId: any
}



// page.tsx
export type StudentDataPage = {
    email: string
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
}

export interface StudentPage {
    email: string
    name: string
}

export type StudentDataState = StudentPage[]


