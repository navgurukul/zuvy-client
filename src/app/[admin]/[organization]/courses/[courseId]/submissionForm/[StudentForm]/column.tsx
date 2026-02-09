'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import usePathname from 'next/navigation'

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Picture" />
        ),
        cell: ({ row }) => {
            const student = row.original
            const profilePicture = student.profilePicture
            const ImageContainer = () => {
                return profilePicture ? (
                    <Image
                        src={profilePicture}
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
        header: () => <div className="text-left w-full">Batch</div>,
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
        accessorKey: 'Status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const isSubmitted = row.original.status === 'Submitted'
            return (
                <div className="flex space-x-2">
                    <div className="max-w-[500px] truncate flex items-center gap-x-2 font-medium">
                        {isSubmitted ? (
                            <div className="bg-green-600 h-3 w-3 rounded-full" />
                        ) : (
                            <div className="bg-red-600 h-3 w-3 rounded-full " />
                        )}
                        {isSubmitted ? ' Submitted' : ' Not Submitted'}
                    </div>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const { bootcampId, moduleId, userId, chapterId } = row.original
            const isSubmitted = row.original.status !== 'Submitted'
            const pathname = window.location.pathname
            const orgName = pathname.split('/')[2]
            return (
                <div className="flex space-x-2">
                    <Button
                        variant={'ghost'}
                        className="text-lg font-bold  hover:bg-muted/30"
                        disabled={isSubmitted}
                    >
                        <Link
                            href={`/admin/${orgName}/courses/${bootcampId}/submissionForm/${moduleId}/IndividualReport/${userId}/Report/${chapterId}`}
                            className="max-w-[500px] text-primary font-medium flex items-center"
                        >
                            <FileText size={16} />
                            <p className="text-[15px]"> View Report</p>
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
