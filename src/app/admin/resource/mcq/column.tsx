'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { getAllQuizData, getCodingQuestionTags, quiz } from '@/store/store'
import { Edit, Eye, Pencil, Trash2 } from 'lucide-react'
import { difficultyColor } from '@/lib/utils'

import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import { getDeleteQuizQuestion, getEditQuizQuestion } from '@/store/store'
import {
    handleQuizConfirm,
    handleQuizDelete,
    handleDeleteQuizModal,
    getAllQuizQuestion,
    // handlerQuizQuestions,
} from '@/utils/admin'
import { DELETE_QUIZ_QUESTION_CONFIRMATION } from '@/utils/constant'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import EditQuizQuestion from '../_components/EditQuizQuestion'

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
            const question =
                row.original?.title ||
                row.original?.quizVariants[0].question ||
                ''
            return <p className="text-left text-md font-[14px] ">{question}</p>
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
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-[17px]"
                column={column}
                title="Actions"
            />
        ),
        cell: ({ row }) => {
            const quizQuestion = row.original

            const openDialog = () => {
                const dialog = document.getElementById('editQuizDialog')
                if (dialog) {
                    dialog.setAttribute('data-state', 'open') // Simulate opening the dialog
                }
            }

            const {
                isDeleteModalOpen,
                setDeleteModalOpen,
                deleteQuizQuestionId,
                setDeleteQuizQuestionId,
            } = getDeleteQuizQuestion()
            const { setStoreQuizData } = getAllQuizData()

            return (
                <div className="flex">
                    <div id="editQuizDialog" data-state="closed">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Pencil
                                    className="cursor-pointer mr-5"
                                    size={20}
                                    onClick={openDialog}
                                />
                            </DialogTrigger>

                            <DialogContent
                                className="sm:max-w-[518px] max-h-[90vh] overflow-y-auto overflow-x-hidden"
                                data-state="closed"
                            >
                                <DialogHeader>
                                    <DialogTitle>Edit MCQ</DialogTitle>
                                </DialogHeader>
                                <EditQuizQuestion
                                    setStoreQuizData={setStoreQuizData}
                                    quizId={quizQuestion.id}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Trash2
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteQuizModal(
                                setDeleteModalOpen,
                                setDeleteQuizQuestionId,
                                quizQuestion
                            )
                        }}
                        className="text-destructive cursor-pointer"
                        size={20}
                    />
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={() => {
                            handleQuizConfirm(
                                handleQuizDelete,
                                setDeleteModalOpen,
                                deleteQuizQuestionId,
                                getAllQuizQuestion,
                                setStoreQuizData
                            )
                        }}
                        modalText={DELETE_QUIZ_QUESTION_CONFIRMATION}
                        buttonText="Delete Quiz Question"
                        input={false}
                    />
                </div>
            )
        },
    },
]
