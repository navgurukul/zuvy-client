'use client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Task } from '@/utils/data/schema'
import { getSubmissionDate } from '@/utils/admin'

// Dev IDs: [1113, 1112, 1111, 1110, 1109, 1108, 1107, 1106]
// Prod IDs (kept for reference): [136, 135, 134, 133, 132, 131, 130, 129]
const CAREER_TOUR_BOOTCAMP_IDS = [1113, 1112, 1111, 1110, 1109, 1108, 1107, 1106]

export const createColumns = (courseId: number | string): ColumnDef<Task>[] => {
    const isCareerTourBootcamp = CAREER_TOUR_BOOTCAMP_IDS.includes(Number(courseId))

    const baseColumns: ColumnDef<Task>[] = [
        {
            accessorKey: 'profilePicture',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Profile Picture" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Avatar className="ml-2 h-[35px] w-[35px]">
                        <AvatarImage
                            src={row.original.profilePicture ?? 'https://github.com/shadcn.png'}
                        />
                    </Avatar>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: ({ column, onSort }: any) => (
                <DataTableColumnHeader
                    column={column}
                    title="Student Name"
                    onSort={onSort}
                    sortField="name"
                />
            ),
            id: 'name',
            cell: ({ row }) => {
                const name = row.original.name

                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium text-foreground">
                            {name}
                        </span>
                    </div>
                )
            },
            enableHiding: false,
        },
        {
            accessorKey: 'email',
            header: ({ column, onSort }: any) => (
                <DataTableColumnHeader
                    column={column}
                    title="Email"
                    onSort={onSort}
                    sortField="email"
                />
            ),
            id: 'email',
            cell: ({ row }) => {
                const email = row.original.email

                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium text-foreground">
                            {email ?? 'NA'}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'batchName',
            header: () => <div className="flex w-full items-center justify-start text-left">Batch</div>,
            cell: ({ row }) => {
                const batchName = row.original.batchName || 'N/A'
                return (
                    <div className="flex items-center justify-start">
                        <Badge variant="outline" className="text-foreground border-foreground">
                            {batchName}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: 'date',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Completed on" />
            ),
            cell: ({ row }) => {
                const completedAt = row.original.completedAt
                const submissionDate = getSubmissionDate(completedAt)
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium text-foreground">
                            {submissionDate}
                        </span>
                    </div>
                )
            },
        },
    ]

    if (!isCareerTourBootcamp) return baseColumns

    // Insert Student ID column after the name column (index 2, after profilePicture and name)
    const studentIdColumn: ColumnDef<Task> = {
        accessorKey: 'studentId',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Student ID" />
        ),
        id: 'studentId',
        cell: ({ row }) => {
            const studentId = (row.original as any).studentId

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium text-foreground">
                        {studentId ?? 'NA'}
                    </span>
                </div>
            )
        },
        enableSorting: false,
    }

    return [
        baseColumns[0], // profilePicture
        baseColumns[1], // name
        studentIdColumn, // Student ID (Career Tour only)
        ...baseColumns.slice(2), // email, batchName, date
    ]
}

// Kept for backwards compatibility; non-Career-Tour default
export const columns = createColumns(0)
