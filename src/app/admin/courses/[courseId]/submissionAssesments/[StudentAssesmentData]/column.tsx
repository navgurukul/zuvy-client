'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { DownloadIcon, FileText } from 'lucide-react'
import { calculateTimeTaken, getSubmissionDate } from '@/utils/admin'
import DownloadReport from './_components/DownloadReport'
import ApproveReattempt from './ApproveReattempt'

export const columns: ColumnDef<Task>[] = [
    // {
    //     accessorKey: 'profilePicture',
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Profile Pitcure" />
    //     ),
    //     cell: ({ row }) => {
    //         const student = row.original
    //         const profilePitcure = student.profilePicture
    //         const ImageContainer = () => {
    //             return profilePitcure ? (
    //                 <Image
    //                     src={profilePitcure}
    //                     alt="profilePic"
    //                     height={10}
    //                     width={30}
    //                     className="rounded-[100%] ml-2"
    //                 />
    //             ) : (
    //                 <Image
    //                     src={
    //                         'https://avatar.iran.liara.run/public/boy?username=Ash'
    //                     }
    //                     alt="profilePic"
    //                     height={35}
    //                     width={35}
    //                     className="rounded-[50%] ml-2"
    //                 />
    //             )
    //         }
    //         return <div className="flex items-center">{ImageContainer()}</div>
    //     },
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students Name" />
        ),
        cell: ({ row }) => {
            const name = row.original.name

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium capitalize">
                        {name}
                    </span>
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            const email = row.original.email

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {email}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'time taken',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Time Taken" />
        ),
        cell: ({ row }) => {
            const startedAt = row.original.startedAt
            const submitedAt = row.original.submitedAt

            let timeTaken;

            if(!submitedAt){
                timeTaken = 'N/A'
            }else{
                timeTaken = calculateTimeTaken(startedAt, submitedAt);
            }

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {timeTaken}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'submission date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Submission Date" />
        ),
        cell: ({ row }) => {
            const submitedAt = row.original.submitedAt
            let submissionDate;

            if(!submitedAt){
                 submissionDate = 'N/A';
            }else{
                 submissionDate = getSubmissionDate(submitedAt);
            }

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {submissionDate}
                    </span>
                </div>
            )
        },
    },

    {
        accessorKey: 'isPassed',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Qualified" />
        ),
        cell: ({ row }) => {
            // const isChecked = row.original.isChecked
            const isQualified = row.original.isPassed
            return (
                <div className="flex space-x-2">
                    <div className="max-w-[500px] truncate flex items-center gap-x-2 font-medium">
                        {isQualified ? (
                            <div className="bg-secondary h-3 w-3 rounded-full" />
                        ) : (
                            <div className="bg-red-600 h-3 w-3 rounded-full " />
                        )}
                        {isQualified ? ' Passed' : 'Failed'}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'Approve Re-attempt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2 w-10" key={row.original.email}>
                   <ApproveReattempt data={row.original}/>
                </div>
            )
        },
    },
    {
        accessorKey: 'percentage',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="% Obtained"
            />
        ),
        cell: ({ row }) => {
            const percentage = row.original.percentage
            return (
                <div className="flex space-x-2">
                    <span className="font-semibold">
                        {Math.floor(percentage)}%
                    </span>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const { bootcampId, newId, userId, id } = row.original
            return (
                <div className="flex space-x-2">
                    <Link
                        href={`/admin/courses/${bootcampId}/submissionAssesments/${newId}/IndividualReport/${userId}/Report/${id}`}
                        className="max-w-[500px] text-secondary font-medium flex items-center"
                    >
                        <FileText size={16} />
                        <p className="text-[15px]"> View Report</p>
                    </Link>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
  
            return (
               <DownloadReport userInfo={row.original} />
            )
        },
    },
]
