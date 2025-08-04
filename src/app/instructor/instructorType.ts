export interface Session {
  id: number;
  bootcampName: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  hangoutLink: string;
}


export interface SessionData {
  ongoing: Session[];
  upcoming: Session[];
}


export interface DataTablePaginationProps {
  fetchStudentData: (data: SessionData) => void
}
