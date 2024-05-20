'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Edit, Eye, Pencil, Trash2 } from 'lucide-react'
import { OpenEndedQuestion } from '@/utils/data/schema'
import {
    getdeleteOpenEndedQuestion,
    getopenEndedQuestionstate,
} from '@/store/store'
import {
    deleteOpenEndedQuestion,
    getAllOpenEndedQuestions,
    handleConfirm,
    handleDeleteModal,
} from '@/utils/admin'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import { DELETE_OPEN_ENDED_QUESTION_CONFIRMATION } from '@/utils/constant'
import { cn, difficultyColor } from '@/lib/utils'

export const columns: ColumnDef<OpenEndedQuestion>[] = [
    {
        accessorKey: 'questionname',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Question Name" />
        ),
        cell: ({ row }: { row: any }) => {
            const openEndedQuestion = row.original

            return (
                <div className="flex items-center">
                    {openEndedQuestion.question}
                </div>
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
        cell: ({ row }: { row: any }) => {
            const openEndedQuestion = row.original

            return (
                <div
                    className={cn(
                        `flex items-center font-semibold text-secondary`,
                        difficultyColor(openEndedQuestion.difficulty)
                    )}
                >
                    {openEndedQuestion.difficulty}
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        id: 'actions',
        accessorKey: 'Actions',
        cell: ({ row }) => {
            const openEndedQuestion = row.original
            const {
                isDeleteModalOpen,
                setDeleteModalOpen,
                deleteOpenEndedQuestionId,
                setdeleteOpenEndedQuestionId,
            } = getdeleteOpenEndedQuestion()

            const { openEndedQuestions, setOpenEndedQuestions } =
                getopenEndedQuestionstate()

            return (
                <>
                    <div className="flex">
                        <Pencil className="cursor-pointer mr-5" size={20} />
                        <Trash2
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteModal(
                                    setDeleteModalOpen,
                                    setdeleteOpenEndedQuestionId,
                                    openEndedQuestion
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
                                    deleteOpenEndedQuestion,
                                    setDeleteModalOpen,
                                    deleteOpenEndedQuestionId,
                                    getAllOpenEndedQuestions,
                                    setOpenEndedQuestions
                                )
                            }}
                            modalText={DELETE_OPEN_ENDED_QUESTION_CONFIRMATION}
                            buttonText="Delete Question"
                            input={false}
                        />
                    </div>
                </>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
]
