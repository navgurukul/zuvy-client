'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { DownloadIcon, FileText } from 'lucide-react'
import { calculateTimeTaken, getSubmissionDate } from '@/utils/admin'
import DownloadReport from '@/app/admin/courses/[courseId]/submissionAssesments/[assessment_Id]/_components/DownloadReport'
import ApproveReattempt from '@/app/admin/courses/[courseId]/submissionAssesments/[assessment_Id]/ApproveReattempt'
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '@/components/ui/tooltip'

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
                // <div className="flex ">
                //     <span className="max-w-[500px] truncate font-medium capitalize">
                //         {name}
                //     </span>
                // </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex">
                                <span
                                    className="truncate max-w-[500px] cursor-pointer font-medium capitalize"
                                    title=""
                                >
                                    {/* Only show first 20 characters */}
                                    {name.length > 20
                                        ? name.substring(0, 15) + '...'
                                        : name}
                                </span>
                            </div>
                        </TooltipTrigger>
                        {name.length > 20 && (
                            <TooltipContent>
                                <p>{name}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
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
                // <div className="flex ">
                //     <span className="max-w-[500px] truncate font-medium">
                //         {email}
                //     </span>
                // </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex ">
                                <span
                                    className="truncate max-w-[500px] cursor-pointer font-medium"
                                    title=""
                                >
                                    {email.length > 25
                                        ? email.substring(0, 18) + '...'
                                        : email}
                                </span>
                            </div>
                        </TooltipTrigger>
                        {email.length > 25 && (
                            <TooltipContent>
                                <p>{email}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
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

            let timeTaken

            if (!submitedAt) {
                timeTaken = 'N/A'
            } else {
                timeTaken = calculateTimeTaken(startedAt, submitedAt)
            }

            return (
                <div className="flex">
                    <span className="max-w-[500px] truncate font-medium">
                        {timeTaken}
                    </span>
                </div>
            )
        },
    },

    {
        accessorKey: 'startedAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Started At" />
        ),
        cell: ({ row }) => {
            const startedAt = row.original.startedAt
            return (
                <div className="flex">
                    <span className="max-w-[500px] truncate font-medium ">
                        {/* {startedAt ? new Date(startedAt).toLocaleString() : 'N/A'} */}
                        {startedAt
                            ? (() => {
                                  const date = new Date(startedAt)
                                  const year = date
                                      .getFullYear()
                                      .toString()
                                      .slice(-2)
                                  const day = date
                                      .getDate()
                                      .toString()
                                      .padStart(2, '0')
                                  const month = (date.getMonth() + 1)
                                      .toString()
                                      .padStart(2, '0')
                                  const hour = date
                                      .getHours()
                                      .toString()
                                      .padStart(2, '0')
                                  const minute = date
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, '0')

                                  return `${day}/${month}/${year}, ${hour}:${minute}`
                              })()
                            : 'N/A'}
                    </span>
                </div>
            )
        },
    },

    {
        accessorKey: 'submitedAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Submitted At" />
        ),
        cell: ({ row }) => {
            const submitedAt = row.original.submitedAt
            return (
                <div className="flex">
                    <span className="max-w-[500px] truncate font-medium ">
                        {/* {submitedAt ? new Date(submitedAt).toLocaleString() : 'N/A'} */}

                        {submitedAt
                            ? (() => {
                                  const date = new Date(submitedAt)
                                  const year = date
                                      .getFullYear()
                                      .toString()
                                      .slice(-2)
                                  const day = date
                                      .getDate()
                                      .toString()
                                      .padStart(2, '0')
                                  const month = (date.getMonth() + 1)
                                      .toString()
                                      .padStart(2, '0')
                                  const hour = date
                                      .getHours()
                                      .toString()
                                      .padStart(2, '0')
                                  const minute = date
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, '0')

                                  return `${day}/${month}/${year}, ${hour}:${minute}`
                              })()
                            : 'N/A'}
                    </span>
                </div>
            )
        },
    },

    // {
    //     accessorKey: 'submission date',
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Submission Date" />
    //     ),
    //     cell: ({ row }) => {
    //         const submitedAt = row.original.submitedAt
    //         let submissionDate;

    //         if(!submitedAt){
    //              submissionDate = 'N/A';
    //         }else{
    //              submissionDate = getSubmissionDate(submitedAt);
    //         }

    //         return (
    //             <div className="flex ">
    //                 <span className="max-w-[500px] truncate font-medium">
    //                     {submissionDate}
    //                 </span>
    //             </div>
    //         )
    //     },
    // },

    {
        accessorKey: 'isPassed',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Qualified" />
        ),
        cell: ({ row }) => {
            // const isChecked = row.original.isChecked
            const isQualified = row.original.isPassed
            return (
                <div className="flex ">
                    <div className="max-w-[500px] truncate flex items-center gap-x-2 ml-1 font-medium">
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
        accessorKey: 'percentage',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Percentage" />
        ),
        cell: ({ row }) => {
            const percentage = row.original.percentage
            return (
                <div className="flex ">
                    <span className="font-semibold ml-4">
                        {percentage ? `${percentage.toFixed(2)}%` : '0.00%'}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'No. of Attempts',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Attempts" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex  w-10" key={row.original.email}>
                    <span className="max-w-[500px] truncate font-medium ml-4">
                        {(row?.original?.reattemptCount ?? 0) + 1}
                    </span>
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
                <div className="flex  w-10" key={row.original.email}>
                    <ApproveReattempt data={row.original} />
                </div>
            )
        },
    },

    {
        id: 'actions',
        cell: ({ row }) => {
            const { bootcampId, assessment_Id, userId, id } = row.original
            const submitedAt = row.original.submitedAt
            return (
                <div className="flex ">
                    <Link
                        href={submitedAt ? `/admin/courses/${bootcampId}/submissionAssesments/${assessment_Id}/IndividualReport/${userId}/Report/${id}` : '#'}
                        className={submitedAt ? `max-w-[500px] text-[rgb(81,134,114)] font-medium flex items-center` : `max-w-[500px] text-[rgb(81,134,114)] font-medium flex items-center opacity-50 cursor-not-allowed`}
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
            const submitedAt = row.original.submitedAt

            return (
                <>
                    <DownloadReport
                        userInfo={row.original}
                        submitedAt={submitedAt}
                    />
                </>
            )
        },
    },
]
