'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Edit, Eye, Pencil, Trash2 } from 'lucide-react'
import { OpenEndedQuestion } from '@/utils/data/schema'
import {
    getdeleteOpenEndedQuestion,
    getopenEndedQuestionstate,
    getEditOpenEndedDialogs,
} from '@/store/store'
import {
    deleteOpenEndedQuestion,
    getAllOpenEndedQuestions,
    handleConfirm,
    handleDeleteModal,
    handleEditOpenEndedQuestion,
} from '@/utils/admin'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import { DELETE_OPEN_ENDED_QUESTION_CONFIRMATION } from '@/utils/constant'
import { cn, difficultyColor } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import EditOpenEndedQuestionForm from '../_components/EditOpenEndedQuestionForm'

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

            const {
                isOpenEndDialogOpen,
                setIsOpenEndDialogOpen,
                setEditOpenEndedQuestionId,
            } = getEditOpenEndedDialogs()
            const { setOpenEndedQuestions } = getopenEndedQuestionstate()

            return (
                <>
                    <div className="flex">
                        <Dialog
                            onOpenChange={setIsOpenEndDialogOpen}
                            open={isOpenEndDialogOpen}
                        >
                            <DialogTrigger>
                                <Pencil
                                    className="cursor-pointer mr-5"
                                    size={20}
                                    onClick={() => {
                                        handleEditOpenEndedQuestion(
                                            openEndedQuestion,
                                            setIsOpenEndDialogOpen,
                                            setEditOpenEndedQuestionId
                                        )
                                    }}
                                />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Edit Open-Ended Question
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="w-full">
                                    <EditOpenEndedQuestionForm
                                        setIsOpenEndDialogOpen={
                                            setIsOpenEndDialogOpen
                                        }
                                        getAllOpenEndedQuestions={
                                            getAllOpenEndedQuestions
                                        }
                                        setOpenEndedQuestions={
                                            setOpenEndedQuestions
                                        }
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>

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
