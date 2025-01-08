'use client'
import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Task } from '@/utils/data/schema'
import { getSubmissionDate } from '@/utils/admin'

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
