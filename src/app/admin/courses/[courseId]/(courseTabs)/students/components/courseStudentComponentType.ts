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

