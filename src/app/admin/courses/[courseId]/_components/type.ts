// types.ts or top of the file

export interface Student {
  email: string;
  name: string;
}

export interface AddStudentsModalProps {
  id: number;
  message: boolean;
  batch: boolean;
  batchId: number | string;
  fetchBatchesData?: () => void;
  batchData?: boolean;
}

export interface AddStudentsResponse {
  status: string;
  message: string;
}