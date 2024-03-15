"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  StudentData,
  deleteStudentHandler,
  fetchStudentData,
} from "../students";
import { onBatchChange } from "../students";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import Image from "next/image";
import DeleteConfirmationModal from "../deleteModal";
import { Combobox } from "@/components/ui/combobox";
import { select } from "@nextui-org/react";
import { getDeleteStudentStore, getStoreStudentData } from "@/store/store";

interface Props {
  studentsData: StudentData[];
  bootcampData: bootcampData;
}

type bootcampData = {
  value: string;
  label: string;
};

export const studentColumns = (
  bootcampData: bootcampData
): ColumnDef<StudentData>[] => [
  {
    header: "Students Name",
    accessorKey: "name",
    cell: ({ row }) => {
      const student = row.original;
      const profilePitcure = student.profilePicture;
      const ImageContainer = () => {
        return profilePitcure ? (
          <Image
            src={profilePitcure}
            alt='profilePic'
            height={10}
            width={30}
            className='rounded-[100%] ml-2'
          />
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

      return (
        <div className='flex items-center'>
          {ImageContainer()}
          <span className='ml-2'>{student.name}</span>
        </div>
      );
    },
  },
  {
    header: "Email",
    accessorKey: "email",
  },

  {
    header: "Batch Asigned To",
    id: "batch",
    cell: ({ row }) => {
      const student = row.original;
      const title = student.batchName;

      return (
        <div className='flex text-start gap-6 my-6 max-w-[200px]'>
          <Combobox
            data={bootcampData}
            title={"Select Batch"}
            onChange={(selectedValue) => {
              onBatchChange(selectedValue, row.original, student);
            }}
            initialValue={row.original?.batchId?.toString() || ""}
          />
        </div>
      );
    },
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
                className='stroke-current text-secondary dark:text-red-400'
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
    header: "Attendence",
    accessorKey: "attendence",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      const { userId, bootcampId } = student;
      // const { onDeleteHandler } = GetdataHandler(bootcampId);
      const { setDeleteModalOpen, isDeleteModalOpen } = getDeleteStudentStore();
      const { setStoreStudentData } = getStoreStudentData();

      return (
        <>
          <Trash2
            onClick={() => setDeleteModalOpen(true)}
            className='text-red-600 cursor-pointer'
            size={20}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={() => {
              deleteStudentHandler(
                userId,
                bootcampId,
                setDeleteModalOpen,
                setStoreStudentData
              );
            }}
            modalText='This action cannot be undone. This will permanently delete the
              student from this bootcamp'
            buttonText='Delete Student'
            input={false}
            modalText2=''
            batchName=''
          />
        </>
      );
    },
  },
];
