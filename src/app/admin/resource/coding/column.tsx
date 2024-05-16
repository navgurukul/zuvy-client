'use client'
import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { Task } from '@/utils/data/schema'
import { CodingQuestion } from '@/utils/data/schema'
import { Edit, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { DELETE_CODING_QUESTION_CONFIRMATION } from '@/utils/constant'
import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import { getDeleteCodingQuestion } from '@/store/store'

export const columns: ColumnDef<CodingQuestion>[] = [
    {
        accessorKey: 'problemName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Problem Name" />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div className="flex items-center">{codingQuestion.title}</div>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'difficulty',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Difficulty" />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div className="flex items-center">
                    {codingQuestion.difficulty}
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'usage',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Usage" />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div className="flex items-center">
                    {codingQuestion.id + ' times'}
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'actions',
        // cell: ({ row }) => <DataTableRowActions row={row} />,
        cell: ({ row }) => {
            const codingQuestion = row.original
            const { isDeleteModalOpen, setDeleteModalOpen } =
                getDeleteCodingQuestion()

            function handleDelete() {
                api({
                    method: 'delete',
                    url: 'Content/deleteCodingQuestion',
                    data: {
                        questionIds: [codingQuestion.id],
                    },
                }).then((res) => {
                    toast({
                        title: 'Success',
                        description: res.data.message,
                        className: 'text-start capitalize',
                    })
                })
            }

            const handleDeleteModal = () => {
                setDeleteModalOpen(true)
            }

            return (
                <>
                    <div className="flex">
                        <Pencil className="cursor-pointer mr-5" size={20} />
                        <Trash2
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteModal()
                            }}
                            className="text-destructive cursor-pointer"
                            size={20}
                        />
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            onConfirm={() => {
                                handleDelete()
                                setDeleteModalOpen(false)
                            }}
                            modalText={DELETE_CODING_QUESTION_CONFIRMATION}
                            buttonText="Delete Coding Question"
                            input={false}
                        />
                    </div>
                </>
            )
        },
    },
]
