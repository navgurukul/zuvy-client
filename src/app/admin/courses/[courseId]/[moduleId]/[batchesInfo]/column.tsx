"use client";
import { ColumnDef } from "@tanstack/react-table";
import { StudentData } from "../../_components/students";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useStudentData } from "@/store/store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import Image from "next/image";

const GetdataHandler = (id: number) => {
  const { studentsInfo, setStudentsInfo } = useStudentData();
  //   console.log(studentsInfo);
  const [bootcampData, setBootcampData] = useState<any[]>([]);
  function onDeleteHandler(id: string) {
    console.log("Hello from delete");
    const updatedData = studentsInfo.filter(
      (students) => students.batchId !== id
    );
    setStudentsInfo(updatedData);
  }

  useEffect(() => {
    api
      .get(`/bootcamp/batches/${id}`)
      .then((response) => {
        const transformedData = response.data.map(
          (item: { id: any; name: any }) => ({
            value: item.id.toString(),
            label: item.name,
          })
        );

        setBootcampData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [id]);

  return {
    bootcampData,
    setStudentsInfo,
    onDeleteHandler,
  };
};

type Status = {
  value: string;
  label: string;
};

export const columns: ColumnDef<StudentData>[] = [
  {
    header: "Profile Picture",
    accessorKey: "profilePicture",
    cell: ({ row }) => {
      const student = row.original;
      const profilePitcure = student.profilePicture;
      const ImageContainer = () => {
        return profilePitcure ? (
          <Image src={profilePitcure} alt='profilePic' height={50} width={50} />
        ) : (
          <Image
            src={"https://avatar.iran.liara.run/public/boy?username=Ash"}
            alt='profilePic'
            height={35}
            width={35}
            className='rounded-[50%] ml-2'
          />
        );
      };

      return ImageContainer();
    },
  },
  {
    header: "Students Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },

  {
    header: "Progress",
    accessorKey: "progress",
    cell: ({ row }) => {
      const student = row.original;
      //   console.log(student.progress);
      return (
        <div className='relative size-9'>
          <svg
            className='size-full'
            width='24'
            height='24'
            viewBox='0 0 36 36'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='18'
              cy='18'
              r='16'
              fill='none'
              className='stroke-current text-gray-200 dark:text-gray-700'
              strokeWidth='2'
            ></circle>
            <g className='origin-center -rotate-90 transform'>
              <circle
                cx='18'
                cy='18'
                r='16'
                fill='none'
                className='stroke-current text-primary dark:text-red-400'
                strokeWidth='2'
                strokeDasharray='100'
                strokeDashoffset={`${100 - student.progress}`}
              ></circle>
            </g>
          </svg>

          <div className='absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2'>
            <span className='text-center text-md font-bold text-gray-800 dark:text-white'>
              {student.progress}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      const { userId, bootcampId } = student;
      const { onDeleteHandler } = GetdataHandler(bootcampId);
      const deleteStudentHandler = async () => {
        try {
          await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
            onDeleteHandler(row.id);
            toast({
              title: res.data.status,
              description: res.data.message,
              className: "text-start capitalize",
            });
          });
        } catch (error) {
          toast({
            title: "Failed",
            variant: "destructive",
          });
        }
      };
      return (
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 className='text-red-600' size={20} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                student from this batch
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteStudentHandler}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
