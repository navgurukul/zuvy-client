"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import api from "@/utils/axios.config";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

type Props = {
  className: string;
  id: string;
};
interface EmailData {
  email: string | null;
  name?: string;
}
const Dropzone = ({ className, id }: Props) => {
  const [emailData, setEmailData] = useState<EmailData[]>();
  const [display, setDisplay] = useState<boolean>(false);
  const [record, setRecord] = useState<Number | undefined>();
  const filteredArray = emailData?.filter(
    (item) => item.email !== null && item.email !== undefined
  );
  const outputArray = {
    students: filteredArray?.map((Item) => ({
      name: Item.name || "Unknown",
      email: Item.email,
    })),
  };
  console.log(outputArray.students?.length);
  const handleDisplay = () => {
    setDisplay(false);
  };
  // const handleClose =() => {}
  const handleStudentOnboarding = async () => {
    if (outputArray) {
      setRecord(outputArray.students?.length);
      const requestBody = outputArray;
      console.log(requestBody);
      try {
        const response = await api
          .post(`/bootcamp/students/${id}`, requestBody, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Response", response.data);
            if (response.data) setDisplay(true);
            setEmailData(null);
            toast({
              title: response.data.status,
              description: response.data.message,
              className: "text-start capitalize",
            });
          });
      } catch (error: any) {
        console.error("Error", error.message);
      }
    }
  };
  // console.log(outputArray);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        // Use Papaparse to parse the CSV data
        Papa.parse(reader.result as string, {
          header: true,
          dynamicTyping: true,
          complete: (results: any) => {
            // Handle the parsed data (results.data)
            console.log("CSV Data:", results.data);
            setEmailData(results.data);
          },
          error: (error: any) => {
            console.error("CSV Parsing Error:", error.message);
          },
        });
      };

      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div {...getRootProps({ className: className })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className='h-[150px]'>
            <p>Drop the files here ...</p>
          </div>
        ) : (
          <div className='p-2 gap-y-4 flex flex-col justify-center items-center w-full h-full '>
            <Upload className='mb-[20px]' />
            <p className=' mx-3 font-semibold'>Upload Or Drag File</p>
            <p className='text-gray-400'> .csv files are supported</p>
          </div>
        )}
      </div>
      <div className='flex pt-2 justify-between items-center'>
        <p className='text-gray-400 text-xs'>
          Format for student data:
          <Link
            href={"/"}
            className='mx-2 text-xs font-semibold text-[#2F433A]'
          >
            Sample_Student_Data.csv
          </Link>
        </p>
      </div>
      {display && (
        <div className='flex flex-col items-start mt-5  w-full gap-y-5 border border-gray-300 p-3 rounded-lg '>
          <div className='w-full flex justify-between'>
            <h2 className='flex-start font-semibold '>Student List.csv</h2>
            <X
              size={20}
              className='text-gray-400 cursor-pointer'
              onClick={handleDisplay}
            />
          </div>
          <div className='w-full flex items-center justify-between '></div>
          <div className='w-full flex gap-y-5 flex-col items-start'>
            <h3 className='flex-start'>Upload Status</h3>
            <li className='text-green-500  '>
              <span className='text-black'>{record} records uploaded</span>
            </li>
          </div>
        </div>
      )}

      <div className='w-full flex flex-row justify-end m-3 p-3 '>
        <Button onClick={handleStudentOnboarding} disabled={!emailData}>
          Add Students
        </Button>
      </div>
    </>
  );
};

export default Dropzone;
