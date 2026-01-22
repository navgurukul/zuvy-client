'use client'
import Image from 'next/image'

import { Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Checkbox } from '@/components/ui/checkbox'

import { Task } from '@/utils/data/schema'
import { deleteStudentHandler, getAttendanceColorClass } from '@/utils/students'
import {
    getBatchData,
    getDeleteStudentStore,
    getStoreStudentData,
    getEditStudent,
    getStudentData,
} from '@/store/store'
import DeleteConfirmationModal from '@/app/[admin]/[organization]/courses/[courseId]/_components/deleteModal'
import AlertDialogDemo from '../../(courseTabs)/students/components/deleteModalNew'
import EditModal from '../../(courseTabs)/students/components/editModal'
import { Input } from '@/components/ui/input'

export const createColumns = (permissions:any): ColumnDef<Task>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="ml-5">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            </div>
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        cell: ({ row }) => {
            const { userId } = row.original
            const { isStudent, setIsStudent } = getEditStudent()
            const { studentData, setStudentData } = getStudentData()
            const handleSingleStudent = (
                e: React.ChangeEvent<HTMLInputElement>
            ) => {
                const { name, value } = e.target
                setStudentData({ ...studentData, [name]: value })
            }
            return (
                <>
                    {isStudent === userId ? (
                        <Input
                            id="name"
                            name="name"
                            value={studentData.name}
                            onChange={handleSingleStudent}
                        />
                    ) : (
                        <div className="w-[150px]">{row.getValue('name')}</div>
                    )}
                </>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            const { userId } = row.original
            const { isStudent, setIsStudent } = getEditStudent()
            const { studentData, setStudentData } = getStudentData()
            const handleSingleStudent = (
                e: React.ChangeEvent<HTMLInputElement>
            ) => {
                const { name, value } = e.target
                setStudentData({ ...studentData, [name]: value })
            }
            return (
                <>
                    {isStudent === userId ? (
                        <Input
                            id="email"
                            name="email"
                            value={studentData.email}
                            onChange={handleSingleStudent}
                        />
                    ) : (
                        <div className="flex space-x-2">
                            <span className="max-w-[500px] truncate font-medium">
                                {row.getValue('email')}
                            </span>
                        </div>
                    )}
                </>
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
            // const priority = priorities.find(
            //   (priority) => priority.value === row.getValue("progress")
            // );

            // if (!priority) {
            //   return null;
            // }

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
        id: 'actions1',
        // cell: ({ row }) => <DataTableRowActions row={row} />,
        cell: ({ row }) => {
            const student = row.original
            const { userId, bootcampId, name, email } = student

            return (
                <>
                    <div>
                        <EditModal
                            userId={userId}
                            bootcampId={bootcampId}
                            name={name}
                            email={email}
                            isOpen={false}
                            onClose={() => {}}
                        />
                    </div>
                </>
            )
        },
    },
    {
        id: 'actions2',
        // cell: ({ row }) => <DataTableRowActions row={row} />,
        cell: ({ row }) => {
            const student = row.original
            const { userId, bootcampId } = student

            return (
                <>
                    <div>
                        <AlertDialogDemo
                            userId={[userId]}
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
