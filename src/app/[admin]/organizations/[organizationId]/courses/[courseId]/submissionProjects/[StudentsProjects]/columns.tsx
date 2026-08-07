'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/utils/data/schema'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import usePathname from 'next/navigation'
import { getUser } from '@/store/store'
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
        id: 'actions',
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label);

            const pathname = window.location.pathname
            const organizationId = pathname.split('/')[3]
            const { user } = getUser()
            const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
            const orgId = Number(organizationId) || user?.orgId; 

            return (
                <div className="flex space-x-2">
                    <Link
                        href={`/${userRole}/organizations/${orgId}/courses/${row.original.bootcampId}/submissionProjects/${row.original.projectId}/IndividualReport/${row.original.userId}`}
                        className="max-w-[500px] text-primary font-medium flex items-center"
                    >
                        <FileText size={16} />
                        <p className="text-[15px]"> View Report</p>
                    </Link>
                </div>
            )
        },
    },
]
