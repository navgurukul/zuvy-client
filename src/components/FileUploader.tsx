import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  allowedTypes?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, allowedTypes = 'image/*' }) => {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleFileChange = (event:any) => {
    const files = event.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };
  
  const handleDragEnter = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };
  
  const processFiles = (files:any) => {
    Array.from(files).forEach((file:any) => {
      // Check if the file is of allowed type
      if (file.type.match(allowedTypes.replace('*', '.*'))) {
        onUpload(file);
      } else {
        console.error(`File type ${file.type} not allowed.`);
      }
    });
    
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div 
      className={`file-uploader ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? '#2196f3' : '#ccc'}`,
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: '10px',
        transition: 'all 0.3s',
        backgroundColor: isDragging ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <p>
        Click or drag files here to upload
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
      />
    </div>
  );
};