'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import { Edit, Trash2 } from 'lucide-react'

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'problemName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Problem Name" />
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
        accessorKey: 'difficulty',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Difficulty" />
        ),
        cell: ({ row }) => (
            <div className="w-[150px]">{row.getValue('name')}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'usage',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Usage" />
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
        id: 'actions',
        // cell: ({ row }) => <DataTableRowActions row={row} />,
        cell: ({ row }) => {
            return (
                <>
                    <Edit
                        className="text-destructive cursor-pointer"
                        size={20}
                    />
                    <Trash2
                        className="text-destructive cursor-pointer"
                        size={20}
                    />
                </>
            )
        },
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
