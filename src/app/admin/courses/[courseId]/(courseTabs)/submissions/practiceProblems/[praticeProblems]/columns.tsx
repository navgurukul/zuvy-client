'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'

import { Trash2 } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'

import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import {
    deleteStudentHandler,
    fetchStudentData,
    onBatchChange,
} from '@/utils/students'
import { Task } from '@/utils/data/schema'
import {
    getBatchData,
    getDeleteStudentStore,
    getStoreStudentData,
} from '@/store/store'
import { getAttendanceColorClass } from '@/utils/students'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
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
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label);

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue('email')}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'noOfAttemps',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="noOfAttemps" />
        ),
    },
    {
        accessorKey: 'Status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),

        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
]
