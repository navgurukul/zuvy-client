"use client";

import { ColumnDef } from "@tanstack/react-table";

import { labels, priorities, statuses } from "@/utils/data/data";
import { Task } from "@/utils/data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { deleteStudentHandler, onBatchChange } from "@/utils/students";
import {
  getBatchData,
  getDeleteStudentStore,
  getStoreStudentData,
} from "@/store/store";
import { Trash2 } from "lucide-react";
import DeleteConfirmationModal from "@/app/admin/courses/[courseId]/_components/deleteModal";
import Image from "next/image";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "profilePicture",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Profile Pitcure' />
    ),
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
      return <div className='flex items-center'>{ImageContainer()}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Students Name' />
    ),
    cell: ({ row }) => <div className='w-[150px]'>{row.getValue("name")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      // const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className='flex space-x-2'>
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue("email")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "batchName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Batch Assigned To' />
    ),
    cell: ({ row }) => {
      const student = row.original;
      const title = student.batchName;
      const { batchData } = getBatchData();
      const transformedData = batchData?.map(
        (item: { id: any; name: any }) => ({
          value: item.id.toString(),
          label: item.name,
        })
      );

      return (
        <div className='flex text-start gap-6 my-6 max-w-[200px]'>
          <Combobox
            data={transformedData}
            title={"Select Batch"}
            onChange={(selectedValue) => {
              onBatchChange(selectedValue, row.original, student);
            }}
            initialValue={row.original?.batchId?.toString() || ""}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Progress' />
    ),
    cell: ({ row }) => {
      const progress = row.original.progress;
      // const priority = priorities.find(
      //   (priority) => priority.value === row.getValue("progress")
      // );

      // if (!priority) {
      //   return null;
      // }

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
                strokeDashoffset={`${100 - progress}`}
              ></circle>
            </g>
          </svg>
          <div className='absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2'>
            <span className='text-center text-md font-bold text-gray-800 dark:text-white'>
              {progress}
            </span>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    // cell: ({ row }) => <DataTableRowActions row={row} />,
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
