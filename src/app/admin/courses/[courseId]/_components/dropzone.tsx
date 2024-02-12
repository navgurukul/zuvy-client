"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { X } from "lucide-react";
import Link from "next/link";

type Props = {
  studentData: any;
  className: string;
  setStudentData: any;
};

const Dropzone = ({ className, studentData, setStudentData }: Props) => {
  // misc

  // state and variables
  const [fileName, setFileName] = useState("");

  // func
  const handleDataFormat = useCallback(
    (data: any) => {
      const filteredArray = data?.filter(
        (item: any) => item.email !== null && item.email !== undefined
      );

      setStudentData(filteredArray);
    },
    [setStudentData]
  );

  const removeFile = () => {
    setFileName("");
    setStudentData({});
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        setFileName(file.name);

        reader.onload = () => {
          // Use Papaparse to parse the CSV data
          Papa.parse(reader.result as string, {
            header: true,
            dynamicTyping: true,
            complete: (results: any) => {
              // Handle the parsed data (results.data)
              handleDataFormat(results.data);
            },
            error: (error: any) => {
              console.error("CSV Parsing Error:", error.message);
            },
          });
        };

        reader.readAsText(file);
      });
    },
    [handleDataFormat]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div {...getRootProps({ className: className })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="h-[150px]">
            <p>Drop the files here ...</p>
          </div>
        ) : (
          <div className="p-2 gap-y-4 flex flex-col justify-center items-center w-full h-full ">
            <Upload className="mb-[20px]" />
            <p className=" mx-3 font-semibold">Upload Or Drag File</p>
            <p className="text-gray-400"> .csv files are supported</p>
          </div>
        )}
      </div>

      {fileName ? (
        <div className="flex flex-col items-start mt-5  w-full gap-y-5 border border-gray-300 p-3 rounded-lg ">
          <div className="w-full flex items-center justify-between">
            <h2 className="font-bold ">{fileName}</h2>
            <X
              size={20}
              className="text-gray-400 cursor-pointer"
              onClick={removeFile}
            />
          </div>
          <div className="text-start">
            <h3 className="mb-2 font-semibold">Upload Status</h3>
            <div className="flex items-center justify-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-black">
                {studentData.length} records uploaded
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex pt-2 justify-between items-center">
          <p className="text-gray-400 text-xs">
            Format for student data:
            <Link
              href="https://merakilearn.s3.ap-south-1.amazonaws.com/courseEditor/ea0a71f2-dd61-453e-9e19-6da30da52dc6-vertopal.com_jsonformatter"
              className="mx-2 text-xs font-semibold text-[#2F433A]"
            >
              Sample_Student_Data.csv
            </Link>
          </p>
        </div>
      )}
    </>
  );
};

export default Dropzone;
