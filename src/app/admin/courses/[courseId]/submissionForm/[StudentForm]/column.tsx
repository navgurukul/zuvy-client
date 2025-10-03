'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { FileText } from 'lucide-react'
const mockBatches = ['Batch A', 'Batch B', 'Batch C']

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Pitcure" />
        ),
        cell: ({ row }) => {
            const student = row.original
            const profilePitcure = student.profilePicture
            const ImageContainer = () => {
                return profilePitcure ? (
                    <Image
                        src={profilePitcure}
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
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students Name" />
        ),
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
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
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
        accessorKey: 'batch',
        header: 'Batch',
        cell: ({ row }) => {
            const index = row.index
            return (
                <div className="flex items-center justify-start">
                <Badge variant="outline" className="text-black border-black-200">
                    {mockBatches[index % mockBatches.length]}
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
            return (
                <div className="flex space-x-2">
                    <Button
                        variant={'ghost'}
                        className="text-lg font-bold"
                        disabled={isSubmitted}
                    >
                        <Link
                            href={`/admin/courses/${bootcampId}/submissionForm/${moduleId}/IndividualReport/${userId}/Report/${chapterId}`}
                            className="max-w-[500px] text-[rgb(81,134,114)] font-medium flex items-center"
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
