'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { useParams } from 'next/navigation'
import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { getUser } from '@/store/store'

const ImageCell = ({ row }: { row: any }) => {
    const profilePicture = row.original.profilePicture
    return (
        <div className="flex items-center">
            {profilePicture ? (
                <Image
                    src={profilePicture}
                    alt="profilePic"
                    height={10}
                    width={30}
                    className="rounded-[100%] ml-2"
                />
            ) : (
                <Image
                    src={'https://avatar.iran.liara.run/public/boy?username=Ash'}
                    alt="profilePic"
                    height={35}
                    width={35}
                    className="rounded-[50%] ml-2"
                />
            )}
        </div>
    )
}

const ActionCell = ({ row }: { row: any }) => {
    const { organizationId } = useParams()
    const { bootcampId, userId, questionId, moduleId } = row.original
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin'
    const orgId = isSuperAdmin ? organizationId : user?.orgId

    return (
        <div className="flex space-x-2">
            <Link
                href={`/${userRole}/organizations/${orgId}/courses/${bootcampId}/submissionProblems/individualCodingSubbmission/${userId}?questionId=${questionId}&moduleId=${moduleId}`}
                className="max-w-[500px] text-secondary font-medium flex items-center"
            >
                <FileText size={16} />
                <p className="text-[15px]">Coding Submission</p>
            </Link>
        </div>
    )
}

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Pitcure" />
        ),
        cell: ImageCell,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column, onSort }: any) => (
            <DataTableColumnHeader
                column={column}
                title="Students Name"
                onSort={onSort}
                sortField="name"
            />
        ),
        cell: ({ row }) => (
            <div className="w-[150px] text-left">{row.getValue('name')}</div>
        ),
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
        cell: ({ row }) => (
            <div className="flex space-x-2">
                <span className="max-w-[500px] truncate font-medium">
                    {row.getValue('email')}
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
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-2 h-2 rounded-full ${status === 'Accepted'
                            ? 'bg-green-300'
                            : 'bg-red-500'
                            }`}
                    />
                    <span className="max-w-[500px] truncate font-medium">
                        {status}
                    </span>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ActionCell,
    },
]
