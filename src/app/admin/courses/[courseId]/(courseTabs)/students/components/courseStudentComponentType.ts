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
