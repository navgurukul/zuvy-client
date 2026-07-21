'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import usePathname from 'next/navigation'
import { getUser } from '@/store/store'
import { ProfileImage } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/ProfileImage'

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
      id: 'name',
      header: ({ column, onSort }: any) => (
        <DataTableColumnHeader
          column={column}
          title="Student Name"
          onSort={onSort}
          sortField="name"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.name}
            </span>
        </div>
      ),
      enableHiding: false,
    },

    {
      accessorKey: 'emailId',
      id: 'email',
      header: ({ column, onSort }: any) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
          onSort={onSort}
          sortField="email"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.emailId}
          </span>
        </div>
      ),
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
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Submission Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <div className="flex space-x-2">
                    <div className="max-w-[500px] truncate flex items-center gap-x-2 font-medium">
                        {status}
                    </div>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const { bootcampId, chapterId, id } = row.original

            const pathname = window.location.pathname
            const organizationId = pathname.split('/')[3]
            const { user } = getUser()
            const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
            const orgId = Number(organizationId) || user?.orgId; 

            return (
                <div className="flex space-x-2">
                    <Link
                        href={`/${userRole}/organizations/${orgId}/courses/${bootcampId}/submissionAssignments/${chapterId}/individualStatus/${id}`}
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
