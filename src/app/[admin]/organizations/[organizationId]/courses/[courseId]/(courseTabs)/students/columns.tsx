'use client'

import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../../../../../_components/datatable/data-table-column-header'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Create a separate component for the student name cell that can use hooks
const StudentNameCell = ({ row }: { row: any }) => {
    const { userId } = row.original
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId; 
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
        router.push(`/${userRole}/organizations/${orgId}/courses/${params.courseId}/${userId}`)
    }
    const studentName = String(row.getValue('name') ?? '')
    const studentEmail = String(row.original.email ?? '')
    
    return (
        <>
            {isStudent === userId ? (
                <div className="space-y-1">
                    <Input
                        id="name"
                        name="name"
                        value={studentData.name}
                        onChange={handleSingleStudent}
                    />
                    <Input
                        id="email"
                        name="email"
                        value={studentData.email}
                        onChange={handleSingleStudent}
                    />
                </div>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className="w-[220px] cursor-pointer text-left"
                                onClick={handleStudentClick}
                            >
                                <div className="truncate font-medium text-gray-800 hover:text-blue-600 hover:underline dark:text-muted-foreground">
                                    {studentName}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {studentEmail}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div>{studentName}</div>
                            <div className="text-xs">{studentEmail}</div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </>
    )
}

export const columns: ColumnDef<Task>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            return (
                <div className="flex items-center justify-center">
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
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[1px]"
                />
            </div>
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
        accessorKey: 'batchName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Batch" className="w-full text-left" />
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
                <div className="flex text-gray-800 w-full justify-start items-center">
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
        id: 'careerStatus',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Career status" />
        ),
        cell: ({ row }) => {
            const careerStatus = row.original.careerStatus
            const status = typeof careerStatus === 'string' && careerStatus.trim()
                ? careerStatus.trim()
                : 'Not set'

            return status === 'Not set' ? (
                <span className="text-sm text-muted-foreground">Not set</span>
            ) : (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    status === 'Looking for Job'
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : status === 'Working'
                          ? 'border-secondary bg-secondary text-secondary-foreground'
                          : 'border-border bg-muted text-foreground'
                }`}>
                    {status}
                </span>
            )
        },
        enableSorting: false,
    },
    {
        id: 'graduating',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Graduating" />
        ),
        cell: ({ row }) => {
            const { graduationDate, graduationMonth, graduationYear } = row.original
            const monthName = graduationMonth && graduationMonth >= 1 && graduationMonth <= 12
                ? new Date(2000, graduationMonth - 1, 1).toLocaleString('en-US', { month: 'short' })
                : null
            const graduation = graduationDate?.trim()
                || (monthName && graduationYear ? `${monthName} ${graduationYear}` : null)

            return <span className="text-sm">{graduation || '—'}</span>
        },
        enableSorting: false,
    },
    {
        id: 'topSkills',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Top skills" />
        ),
        cell: ({ row }) => {
            const skills = row.original.skills
            const skillList = Array.isArray(skills)
                ? skills
                    .filter((skill): skill is string => typeof skill === 'string' && skill.trim().length > 0)
                    .map((skill) => skill.trim())
                : []
            const visibleSkills = skillList.slice(0, 3)
            const remainingCount = skillList.length - visibleSkills.length

            if (skillList.length === 0) return <span className="text-sm text-muted-foreground">—</span>

            return (
                <div className="flex max-w-[160px] flex-wrap gap-1">
                    {visibleSkills.map((skill, index) => (
                        <span key={`${skill}-${index}`} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground">
                            {skill}
                        </span>
                    ))}
                    {remainingCount > 0 && (
                        <span className="rounded-full border bg-muted px-2 py-0.5 text-xs text-foreground">
                            +{remainingCount}
                        </span>
                    )}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'enrolledDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Enrolled Date" className="w-full text-center"/>
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
                <div className="flex w-full justify-center items-center text-gray-800 dark:text-muted-foreground">
                    <span className="text-sm">{formattedDate}</span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'progress',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Progress" className="w-full text-center" />
        ),
        cell: ({ row }) => {
            const progress = Math.max(0, Math.min(100, row.original.progress))
            return (
                <div className="flex w-full justify-center items-center">
                    {/* <div className="h-2 w-full rounded-full progress-bg">
                        <div
                            className="h-2 rounded-full progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div> */}
                    <div className="text-sm text-gray-800 dark:text-muted-foreground">{progress}%</div>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'attendance',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Attendance" className="w-full text-center" />
        ),
        cell: ({ row }) => {
            const attendance =
                row.original.attendance === null
                    ? 0
                    : Math.round(row.original.attendance)

            const circleColorClass = getAttendanceColorClass(attendance)

            return (
                <div className="relative size-9 w-full flex justify-center items-center">
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
