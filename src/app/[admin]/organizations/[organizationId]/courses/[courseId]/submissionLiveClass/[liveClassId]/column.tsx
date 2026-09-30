'use client'
import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { ProfileImage } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/ProfileImage'

const mockBatches = ['Batch A', 'Batch B', 'Batch C']

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Picture" />
        ),
        cell: ({ row }) => (
            <div className="flex items-center">
                <ProfileImage src={row.original.profilePicture} />
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
            const name = row.original.user?.name || 'N/A'

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {name}
                    </span>
                </div>
            )
        },
        // enableSorting: false,
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
            const email = row.original.user?.email || 'N/A'

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
        id: 'batchName',
        header: () => <div className="text-left w-full">Batch</div>,
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
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status || 'Not Viewed'
            const isViewed = status.toLowerCase() === 'viewed'

            return (
                <div className="flex space-x-2">
                    <Badge
                        className={
                            isViewed
                                ? "text-success bg-green-100 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40"
                                : "text-destructive bg-red-100 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
                        }
                    >
                        {status}
                    </Badge>
                </div>
            )
        },
    },
]