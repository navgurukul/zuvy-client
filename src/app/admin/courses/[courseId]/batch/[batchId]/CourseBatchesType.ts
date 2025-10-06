export interface StudentPage{
    email: string
    name: string
}

export type StudentDataState = StudentPage[]




export interface Batch {
  status: string ;
  message: string;
  id: string;
  name: string;
  totalPages:number
  totalStudentsCount:number
  modifiedStudentInfo:any
}

export interface BatchOption {
  value: string;
  label: string;
}

export interface SelecteItem {
  userId: string | number; 
}


export interface InstructorInfo {
  name: string;
  instructorEmail: string;
  capEnrollment: string;
}
