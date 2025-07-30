'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import Link from 'next/link'
import { FileText } from 'lucide-react'

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
        cell: ({ row }) => (
            <div className="w-[150px]">{row.getValue('name')}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'emailId',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label);

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue('emailId')}
                    </span>
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
                        className={`w-2 h-2 rounded-full ${
                            status === 'Accepted'
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
        cell: ({ row }) => {
            const { bootcampId, id, questionId, moduleId } = row.original

            return (
                <div className="flex space-x-2">
                    <Link
                        href={`/admin/courses/${bootcampId}/submissionProblems/individualCodingSubbmission/${id}?questionId=${questionId}&moduleId=${moduleId}`}
                        className="max-w-[500px] text-secondary font-medium flex items-center"
                    >
                        <FileText size={16} />
                        <p className="text-[15px]">Coding Submission</p>
                    </Link>
                </div>
            )
        },
    },
]
