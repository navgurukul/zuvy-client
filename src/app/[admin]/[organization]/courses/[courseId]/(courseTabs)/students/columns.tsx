'use client'

import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../../../../_components/datatable/data-table-column-header'
import { fetchStudentData } from '@/utils/students'
import { Task } from '@/utils/data/schema'
import { getBatchData, getEditStudent, getStudentData, getUser } from '@/store/store'
import { getAttendanceColorClass } from '@/utils/students'
import { ComboboxStudent } from './components/comboboxStudentDataTable'
import { AlertDialogDemo } from './components/deleteModalNew'
import { Checkbox } from '@/components/ui/checkbox'
import EditModal from './components/editModal'
import { Input } from '@/components/ui/input'
import ActionCell from './actionCell' 

// Create a separate component for the student name cell that can use hooks
const StudentNameCell = ({ row }: { row: any }) => {
    const { userId } = row.original
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const { isStudent, setIsStudent } = getEditStudent()
    const { studentData, setStudentData } = getStudentData()
    const router = useRouter()
    const params = useParams()
    
    const handleSingleStudent = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target
        setStudentData({ ...studentData, [name]: value })
    }
    
    const handleStudentClick = () => {
        router.push(`/${userRole}/courses/${params.courseId}/${userId}`)
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
                <div 
                    className="w-[150px] text-left text-gray-800 cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={handleStudentClick}
                >
                    {row.getValue('name')}
                </div>
            )}
        </>
    )
}

export const columns: ColumnDef<Task>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            return (
                <div className="ml-5">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                'indeterminate')
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                </div>
            )
        },
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
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students Name" />
        ),
        cell: ({ row }) => <StudentNameCell row={row} />,
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
                            <span className="max-w-[500px] truncate font-medium text-gray-800">
                                {row.getValue('email')}
                            </span>
                        </div>
                    )}
                </>
            )
        },
    },
    {
        accessorKey: 'batchName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Batch" />
        ),
        cell: ({ row }) => {
            const { batchName, userId, bootcampId, batchId } = row.original
            const { batchData } = getBatchData()
            const newBatchData = batchData?.map((data) => {
                return {
                    value: data.id,
                    label: data.name,
                }
            })

            return (
                <div className="flex text-gray-800">
                    <ComboboxStudent
                        batchData={newBatchData || []}
                        batchName={batchName}
                        userId={userId}
                        bootcampId={bootcampId}
                        batchId={batchId}
                        fetchStudentData={undefined}
                    />
                </div>
            )
        },
    },
    {
        accessorKey: 'enrolledDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Enrolled Date" />
        ),
        cell: ({ row }) => {
            const enrolledDate = row.original.enrolledDate

            const formatEnrolledDate = (dateString: string | null) => {
                if (!dateString) return 'Not available'

                const date = new Date(dateString)

                if (isNaN(date.getTime())) return 'Invalid date'

                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')

                return `${year}-${month}-${day}`
            }

            const formattedDate = formatEnrolledDate(enrolledDate ?? null)

            return (
                <div className="flex items-center text-gray-800">
                    <span className="text-sm">{formattedDate}</span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'progress',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Progress" />
        ),
        cell: ({ row }) => {
            const progress = Math.max(0, Math.min(100, row.original.progress))
            return (
                <div className="flex flex-grow justify-center min-w-[70px]">
                    {/* <div className="h-2 w-full rounded-full progress-bg">
                        <div
                            className="h-2 rounded-full progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div> */}
                    <div className="text-sm text-gray-800">{progress}%</div>
                </div>
            )
        },
        enableSorting: true,
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
                        <span className="text-center text-md font-bold text-foreground dark:text-white">
                            {attendance}
                        </span>
                    </div>
                </div>
            )
        },
        enableSorting: true,
    },
    // {
    //     accessorKey: 'lastActiveDate',
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Last Active" />
    //     ),
    //     cell: ({ row }) => {
    //         const lastActive = row.original.lastActiveDate

    //         const formatDate = (dateString: string | null) => {
    //             if (!dateString) return 'Never'

    //             const date = new Date(dateString)
    //             const now = new Date()
    //             // const diffTime = Math.abs(now.getTime() - date.getTime())
    //             const diffTime = now.getTime() - date.getTime()
    //             const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    //             if (diffDays === 0) return 'Today'
    //             if (diffDays === 1) return 'Yesterday'
    //             if (diffDays <= 7) return `${diffDays} days ago`
    //             if (diffDays <= 30)
    //                 return `${Math.floor(diffDays / 7)} weeks ago`

    //             return date.toLocaleDateString('en-US', {
    //                 month: 'short',
    //                 day: 'numeric',
    //                 year:
    //                     date.getFullYear() !== now.getFullYear()
    //                         ? 'numeric'
    //                         : undefined,
    //             })
    //         }

    //         const formattedDate = formatDate(lastActive ?? null)
    //         const isRecent =
    //             lastActive &&
    //             new Date(lastActive) >
    //                 new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    //         return (
    //             <div className="flex items-center space-x-2 text-foreground">
    //                 <span
    //                     className={`text-sm ${
    //                         isRecent ? 'text-success' : 'text-gray-600'
    //                     }`}
    //                 >
    //                     {formattedDate}
    //                 </span>
    //             </div>
    //         )
    //     },
    //     enableSorting: true,
    // },

    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const studentStatus = row.original.status || 'active'
            
            const getStatusConfig = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'active':
                        return {
                            label: 'Active',
                            className: 'bg-primary text-primary-foreground border-primary',
                        }
                    case 'dropout':
                        return {
                            label: 'Dropout',
                            className: 'bg-destructive text-destructive-foreground border-destructive',
                        }
                    case 'graduate':
                        return {
                            label: 'Graduate',
                            className: 'bg-secondary text-secondary-foreground border-secondary',
                        }
                    default:
                        return {
                            label: 'Unknown',
                            className:
                                'bg-muted text-muted-foreground border-muted',
                        }
                }
            }

            const statusConfig = getStatusConfig(studentStatus)

            return (
                <div className="flex items-center justify-start">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className}`}
                    >
                        {statusConfig.label}
                    </span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            const studentStatus = row.getValue(id) as string
            return value.includes(studentStatus?.toLowerCase() || 'active')
        },
        enableSorting: true,
    },

    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
            const student = row.original
            return (
                <ActionCell
                    student={{
                        userId: String(student.userId),
                        bootcampId: String(student.bootcampId),
                        name: student.name,
                        email: student.email,
                        status: student.status,
                        batchId: String(student.batchId),
                    }}
                />
            )
        },
    },
]
