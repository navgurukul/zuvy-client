export interface FileUploaderProps {
  onUpload: (file: File) => void;
  allowedTypes?: string;
}