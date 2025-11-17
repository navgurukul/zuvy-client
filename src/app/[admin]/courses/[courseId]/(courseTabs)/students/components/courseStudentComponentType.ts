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
    batchId:any
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

// deleteModal.tsx

export interface DeleteModalDialogProps {
    title: string
    description: string
    userId: number[]
    bootcampId: number
    isOpen?: boolean
    onClose?: () => void
    setSelectedRows?: React.Dispatch<React.SetStateAction<any[]>> // Add this line
}

// StudentDetailsView.tsx
export interface StudentDetailsViewProps {
    courseId: string
    studentId: string
    onBack: () => void
}

export interface ClassData {
    id: number
    title: string
    startTime: string
    endTime: string
    s3Link: string | null
    moduleId: number | null
    chapterId: number | null
    attendanceStatus: string
    duration: number
}
