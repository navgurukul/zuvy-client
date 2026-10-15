'use client'
import Image from 'next/image'
import Link from 'next/link'

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
import DeleteConfirmationModal from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/deleteModal'
import AlertDialogDemo from '../../(courseTabs)/students/components/deleteModalNew'
import EditModal from '../../(courseTabs)/students/components/editModal'
import { Input } from '@/components/ui/input'
import { ProfileImage } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/ProfileImage'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Career Tour Course Bootcamp IDs - Student ID column is shown only for these,
// and the Attendance column is hidden for these bootcamps (no live-class attendance tracked)

// Dev IDs (kept for reference): [1113, 1112, 1111, 1110, 1109, 1108, 1107, 1106]
// Prod IDs (kept for reference): [136, 135, 134, 133, 132, 131, 130, 129]
const CAREER_TOUR_BOOTCAMP_IDS = [1113, 1112, 1111, 1110, 1109, 1108, 1107, 1106]

type CreateColumnsOptions = {
    userRole: string
    orgId: number
    courseId: string
    batchId: string
    courseName?: string
    batchName?: string
}

const studentIdColumn: ColumnDef<Task> = {
    accessorKey: 'studentId',
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student ID" className="w-full" />
    ),
    cell: ({ row }) => {
        const studentId = (row.original as any).studentId
        return (
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                {studentId ?? 'NA'}
            </div>
        )
    },
    enableSorting: false,
    enableHiding: true,
}

export const createColumns = (
    permissions: any,
    options: CreateColumnsOptions
): ColumnDef<Task>[] => {
    const isCareerTourBootcamp = CAREER_TOUR_BOOTCAMP_IDS.includes(Number(options.courseId))

    const baseColumns: ColumnDef<Task>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'profilePicture',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Profile Picture"
                    className="w-full text-center"
                />
            ),
            cell: ({ row }) => (
                <div className="flex w-full justify-center items-center">
                    <ProfileImage src={row.original.profilePicture} />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Students Name"
                    className="w-full"
                />
            ),
            cell: ({ row }) => {
                const { userId } = row.original
                const studentName = String(row.getValue('name') ?? '')
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
                            <div className="w-full min-w-0">
                                <Input
                                    id="name"
                                    name="name"
                                    value={studentData.name}
                                    onChange={handleSingleStudent}
                                    className="w-full"
                                />
                            </div>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full min-w-0 text-left dark:text-muted-foreground">
                                            {studentName.length > 20 ? `${studentName.slice(0, 20)}...` : studentName}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>{studentName}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </>
                )
            },
            enableSorting: true,
            enableHiding: true,
        },
        ...(isCareerTourBootcamp ? [studentIdColumn] : []),
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" className="w-full" />
            ),
            cell: ({ row }) => {
                const { userId } = row.original
                const rawEmail = row.original.email?.trim() || ''
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
                            <div className="w-full min-w-0">
                                <Input
                                    id="email"
                                    name="email"
                                    value={studentData.email}
                                    onChange={handleSingleStudent}
                                    className="w-full"
                                />
                            </div>
                        ) : rawEmail ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex w-full min-w-0 space-x-2">
                                            <span className="block max-w-[500px] truncate text-left font-medium dark:text-muted-foreground">
                                                {rawEmail.length > 30 ? `${rawEmail.slice(0, 30)}...` : rawEmail}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>{rawEmail}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <span className="text-sm text-muted-foreground flex">NA</span>
                        )}
                    </>
                )
            },
        },
        {
            accessorKey: 'progress',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Progress"
                    className="w-full text-center"
                />
            ),
            cell: ({ row }) => {
                const progress = row.original.progress
                const circleColorClass = getAttendanceColorClass(progress)

                return (
                    <div className="flex w-full items-center justify-center">
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
                    </div>
                )
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        // Hide attendance column for Career Tour bootcamps — no live-class attendance tracked
        ...(!isCareerTourBootcamp ? [{
            accessorKey: 'attendance',
            header: ({ column }: { column: any }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Attendance"
                    className="w-full text-center"
                />
            ),
            cell: ({ row }: { row: any }) => {
                const attendance =
                    row.original.attendance === null
                        ? 0
                        : Math.round(row.original.attendance)
                const circleColorClass = getAttendanceColorClass(attendance)

                return (
                    <div className="flex w-full justify-center items-center">
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
                    </div>
                )
            },
        } as ColumnDef<Task>] : []),
        {
            id: 'actions1',
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
            header: () => <div className="w-full text-center">Actions</div>,
            cell: ({ row }) => {
                const student = row.original
                const { userId, bootcampId } = student

                return (
                    <div className="flex w-full justify-center items-center">
                        <AlertDialogDemo
                            userId={[userId]}
                            bootcampId={bootcampId}
                            title="Are you absolutely sure?"
                            description="This action cannot be undone. This will permanently the student from the bootcamp"
                        />
                    </div>
                )
            },
        },
        {
            id: 'actions3',
            header: () => <div className="w-full min-w-[120px] text-center">Report</div>,
            cell: ({ row }) => {
                const student = row.original as Record<string, any>
                const { userId } = student

                return (
                    <div className="flex w-full items-center justify-center">
                        <Link
                            href={`/${options.userRole}/organizations/${options.orgId}/courses/${options.courseId}/batch/${options.batchId}/individualreport/${userId}`}
                            className="text-primary hover:underline font-medium"
                        >
                            View Report
                        </Link>
                    </div>
                )
            },
        },
    ]

    return baseColumns
}
