'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { quiz } from '@/store/store'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { difficultyColor } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export const columns: ColumnDef<quiz>[] = [
    {
        accessorKey: 'question',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-[17px]"
                column={column}
                title="Question Name"
            />
        ),
        cell: ({ row }) => {
            const question = row.original?.question
            return (
                <p className="text-left text-[15px] font-semibold ">
                    {question}
                </p>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'difficulty',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-[17px]"
                column={column}
                title="Difficulty"
            />
        ),
        cell: ({ row }) => {
            const difficulty = row.original.difficulty
            return (
                <p
                    className={` text-left ml-3 text-[15px] font-semibold  ${difficultyColor(
                        difficulty
                    )}`}
                >
                    {difficulty}
                </p>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        id: 'actions',
        cell: ({ row }) => {
            const tooltips = [
                { icon: Eye, text: 'View Question' },
                {
                    icon: Edit,
                    text: 'Edit Quiz Question',
                    className: 'cursor-pointer',
                },
                {
                    icon: Trash2,
                    text: 'Delete Quiz Question',
                    className: 'text-destructive cursor-pointer',
                },
            ]
            return (
                <div className="flex gap-x-3">
                    <TooltipProvider>
                        {tooltips.map(
                            ({ icon: Icon, text, className }, index) => (
                                <Tooltip key={index}>
                                    <TooltipTrigger>
                                        <Icon size={20} className={className} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{text}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        )}
                    </TooltipProvider>
                </div>
            )
        },
    },
]
