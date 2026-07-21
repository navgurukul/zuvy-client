'use client'
import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/utils/data/schema'
import { getSubmissionDate } from '@/utils/admin'
import { ProfileImage } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/ProfileImage'

const mockBatches = ['Batch A', 'Batch B', 'Batch C']
export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Pitcure" />
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
            const name = row.original.name

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
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
                    <span className="max-w-[500px] truncate font-medium">
                        {email}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'batchName',
        header: 'Batch',
        cell: ({ row }) => {
            const batchName = row.original.batchName || 'N/A'
            return (
                <div className="flex items-center justify-start">
                    <Badge variant="outline" className="text-black border-black-200">
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
                    <span className="max-w-[500px] truncate font-medium">
                        {submissionDate}
                    </span>
                </div>
            )
        },
    },
]
