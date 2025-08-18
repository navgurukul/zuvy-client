export interface BootcampDetail {
  name: string;
}

export interface ClassRecording {
  id: number;
  bootcampDetail: BootcampDetail;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  hangoutLink: string;
}