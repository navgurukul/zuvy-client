'use client'

import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../../../_components/datatable/data-table-column-header'

import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import { fetchStudentData } from '@/utils/students'
import { Task } from '@/utils/data/schema'
import {
    getBatchData,
    getDeleteStudentStore,
    getStoreStudentData,
} from '@/store/store'
import { getAttendanceColorClass } from '@/utils/students'

import { ComboboxStudent } from './components/comboboxStudentDataTable'

import { AlertDialogDemo } from './components/deleteModalNew'
export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Pitcure" />
        ),
        cell: ({ row }) => {
            const student = row.original
            const profilePitcure = student.profilePicture
            const ImageContainer = () => {
                return profilePitcure ? (
                    <Image
                        src={profilePitcure}
                        alt="profilePic"
                        height={10}
                        width={30}
                        className="rounded-[100%] ml-2"
                    />
                ) : (
                    <Image
                        src={
                            'https://avatar.iran.liara.run/public/boy?username=Ash'
                        }
                        alt="profilePic"
                        height={35}
                        width={35}
                        className="rounded-[50%] ml-2"
                    />
                )
            }
            return <div className="flex items-center">{ImageContainer()}</div>
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students Name" />
        ),
        cell: ({ row }) => (
            <div className="w-[150px]">{row.getValue('name')}</div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label);

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue('email')}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'batchName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Batch Assigned To" />
        ),
        cell: ({ row }) => {
            const { batchName, userId, bootcampId , batchId} = row.original
            const { batchData } = getBatchData()
            const newBatchData = batchData?.map((data) => {
                return {
                    value: data.id,
                    label: data.name,
                }
            })
            console.log(row.original)
            return (
                <div className="flex">
                    <ComboboxStudent
                        batchData={newBatchData}
                        batchName={batchName}
                        userId={userId}
                        bootcampId={bootcampId}
                        batchId={batchId}
                    />
                </div>
            )
        },
    },
    {
        accessorKey: 'progress',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Progress" />
        ),
        cell: ({ row }) => {
            const progress = row.original.progress
            const circleColorClass = getAttendanceColorClass(progress)

            return (
                <div className="relative size-9">
                    <svg
                        className="size-full"
                        width="24"
                        height="24"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-current text-gray-200 dark:text-gray-700"
                            strokeWidth="2"
                        ></circle>
                        <g className="origin-center -rotate-90 transform">
                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className={`stroke-current ${circleColorClass}`}
                                strokeWidth="2"
                                strokeDasharray="100"
                                strokeDashoffset={`${100 - progress}`}
                            ></circle>
                        </g>
                    </svg>
                    <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                        <span className="text-center text-md font-bold text-gray-800 dark:text-white">
                            {progress}
                        </span>
                    </div>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'attendance',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Attendance" />
        ),
        cell: ({ row }) => {
            const attendance =
                row.original.attendance === null
                    ? 0
                    : Math.round(row.original.attendance)

            const circleColorClass = getAttendanceColorClass(attendance)

            return (
                <div className="relative size-9">
                    <svg
                        className="size-full"
                        width="24"
                        height="24"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-current text-gray-200 dark:text-gray-700"
                            strokeWidth="2"
                        ></circle>
                        <g className="origin-center -rotate-90 transform">
                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className={`stroke-current ${circleColorClass}`}
                                strokeWidth="2"
                                strokeDasharray="100"
                                strokeDashoffset={`${100 - attendance}`}
                            ></circle>
                        </g>
                    </svg>
                    <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                        <span className="text-center text-md font-bold text-gray-800 dark:text-white">
                            {attendance}
                        </span>
                    </div>
                </div>
            )
        },
    },
    {
        id: 'actions',
        // cell: ({ row }) => <DataTableRowActions row={row} />,
        cell: ({ row }) => {
            const student = row.original
            const { userId, bootcampId } = student

            return (
                <>
                    <div>
                        <AlertDialogDemo
                            userId={userId}
                            bootcampId={bootcampId}
                            title="Are you absolutely sure?"
                            description="This action cannot be undone. This will permanently the student from the bootcamp"
                        />
                    </div>
                </>
            )
        },
    },
]
