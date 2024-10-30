'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { CodingQuestion } from '@/utils/data/schema'
import { Edit, Pencil, Trash2 } from 'lucide-react'

import { DELETE_CODING_QUESTION_CONFIRMATION } from '@/utils/constant'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import {
    getDeleteCodingQuestion,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
} from '@/store/store'
import { cn, difficultyColor } from '@/lib/utils'

import {
    handleConfirm,
    handleDelete,
    handleDeleteModal,
    getAllCodingQuestions,
    handleEditCodingQuestion,
} from '@/utils/admin'

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
                <div
                    className={cn(
                        `flex items-center font-semibold text-secondary`,
                        difficultyColor(codingQuestion.difficulty)
                    )}
                >
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
                    {codingQuestion?.usage ? codingQuestion?.usage + ' times' : 0 + ' times'}
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
            const {
                isDeleteModalOpen,
                setDeleteModalOpen,
                deleteCodingQuestionId,
                setDeleteCodingQuestionId,
            } = getDeleteCodingQuestion()

            const {
                setEditCodingQuestionId,
                isCodingEditDialogOpen,
                setIsCodingEditDialogOpen,
            } = getEditCodingQuestionDialogs()

            const { codingQuestions, setCodingQuestions } =
                getcodingQuestionState()

            return (
                <>
                    <div className="flex">
                                <Pencil
                                    className="cursor-pointer mr-5"
                                    size={20}
                                    onClick={() => {
                                        handleEditCodingQuestion(
                                            codingQuestion,
                                            setIsCodingEditDialogOpen,
                                            setEditCodingQuestionId
                                        )
                                    }}
                                />
                    
                        <Trash2
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteModal(
                                    setDeleteModalOpen,
                                    setDeleteCodingQuestionId,
                                    codingQuestion
                                )
                            }}
                            className="text-destructive cursor-pointer"
                            size={20}
                        />
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            onConfirm={() => {
                                handleConfirm(
                                    handleDelete,
                                    setDeleteModalOpen,
                                    deleteCodingQuestionId,
                                    getAllCodingQuestions,
                                    setCodingQuestions
                                )
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
