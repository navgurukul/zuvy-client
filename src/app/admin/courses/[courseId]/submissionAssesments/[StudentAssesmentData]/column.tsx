'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import Link from 'next/link'

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
        accessorKey: 'userName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students Name" />
        ),
        cell: ({ row }) => {
            const name = row.original.userName

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
        accessorKey: 'userEmail',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            const email = row.original.userEmail

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
        accessorKey: 'isChecked',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Checked" />
        ),
        cell: ({ row }) => {
            const isChecked = row.original.isChecked
            return (
                <div className="flex space-x-2">
                    <div className="max-w-[500px] truncate flex items-center gap-x-2 font-medium">
                        {isChecked ? (
                            <div className="bg-secondary h-3 w-3 rounded-full" />
                        ) : (
                            <div className="bg-red-600 h-3 w-3 rounded-full " />
                        )}
                        {isChecked ? 'Checked' : 'Not Checked'}
                    </div>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label);
            console.log(row.original)
            return (
                <div className="flex space-x-2">
                    <Link
                        href={`/admin/courses/${row.original.bootcampId}/submissionProjects/${row.original.projectId}/IndividualReport/${row.original.userId}`}
                        className="max-w-[500px] text-secondary font-medium"
                    >
                        View Report
                    </Link>
                </div>
            )
        },
    },
]
