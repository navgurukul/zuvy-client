'use client'

import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../../../../../_components/datatable/data-table-column-header'
import { Task } from '@/utils/data/schema'
import { Checkbox } from '@/components/ui/checkbox'
import { useFormContext } from 'react-hook-form'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const useCapEnrollment = () => {
    const form = useFormContext()
    const capEnrollment = form.watch('capEnrollment')
    return Number(capEnrollment) || 0
}

export const columns: ColumnDef<Task>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            const capEnrollment = useCapEnrollment()
            const selectedCount = table.getSelectedRowModel().rows.length
            const disableAll = selectedCount >= capEnrollment

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Checkbox
                                    checked={
                                        table.getIsAllPageRowsSelected() ||
                                        (table.getIsSomePageRowsSelected() &&
                                            'indeterminate')
                                    }
                                    onCheckedChange={(value) => {
                                        if (!disableAll || !value) {
                                            table.toggleAllPageRowsSelected(
                                                !!value
                                            )
                                        }
                                    }}
                                    disabled={disableAll}
                                    aria-label="Select all"
                                    className="translate-y-[2px]"
                                />
                            </div>
                        </TooltipTrigger>
                        {disableAll && (
                            <TooltipContent>
                                <p>
                                    You can’t select more than {capEnrollment}{' '}
                                    students.
                                </p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            )
        },
        cell: ({ row, table }) => {
            const capEnrollment = useCapEnrollment()
            const selectedCount = table.getSelectedRowModel().rows.length
            const disable =
                !row.getIsSelected() && selectedCount >= capEnrollment

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Checkbox
                                    checked={row.getIsSelected()}
                                    onCheckedChange={(value) => {
                                        if (!disable || !value) {
                                            row.toggleSelected(!!value)
                                        }
                                    }}
                                    disabled={disable}
                                    aria-label="Select row"
                                    className="translate-y-[2px]"
                                />
                            </div>
                        </TooltipTrigger>
                        {disable && (
                            <TooltipContent
                                side="top"
                                align="start"
                                sideOffset={8}
                            >
                                <p className="max-w-xs whitespace-normal break-words text-center">
                                    You’ve reached the cap enrollment limit. <br />
                                    Deselect a student to add someone else, or
                                    increase the cap enrollment.
                                </p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Picture" />
        ),
        cell: ({ row }) => {
            const student = row.original
            const profilePicture = student.profilePicture
            const ImageContainer = () =>
                profilePicture ? (
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

            return <div className="flex items-center">{ImageContainer()}</div>
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Student's Name" />
        ),
        cell: ({ row }) => (
            <div className="w-[150px]">{row.getValue('name')}</div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
            <div className="flex space-x-2">
                <span className="max-w-[500px] truncate font-medium">
                    {row.getValue('email')}
                </span>
            </div>
        ),
    },
]
