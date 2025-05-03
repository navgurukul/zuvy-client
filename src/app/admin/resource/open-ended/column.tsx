'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Edit, Eye, Pencil, Trash2 } from 'lucide-react'
import { OpenEndedQuestion } from '@/utils/data/schema'
import {
    getdeleteOpenEndedQuestion,
    getopenEndedQuestionstate,
    getEditOpenEndedDialogs,
    getSelectedOpenEndedOptions,
    getOpenEndedDifficulty,
    getOffset,
    getPosition,
} from '@/store/store'
import {
    deleteOpenEndedQuestion,
    filteredOpenEndedQuestions,
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
import PreviewOpenEnded from '../_components/PreviewOpenEnded'

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
        enableHiding: true,
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
        enableHiding: true,
    },
    {
        accessorKey: 'usage',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-center"
                column={column}
                title="Usage"
            />
        ),
        cell: ({ row }: { row: any }) => {
            const usage = row.original.usage

            return <div className="mr-7 font-semibold">{usage}</div>
        },
        enableSorting: false,
        enableHiding: true,
    },
    {
        id: 'actions1',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-[17px]  flex justify-end ml-4"
                column={column}
                title="Preview"
            />
        ),
        cell: ({ row }) => {
            const question = row.original

            console.log('question', question)

            return (
                <div className="mr-5 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button>
                                <Eye className="cursor-pointer" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="w-full">
                            <PreviewOpenEnded question={question} />
                        </DialogContent>
                    </Dialog>
                </div>
            )
        },
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-center"
                column={column}
                title=""
            />
        ),
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
            const { openEndedQuestions, setOpenEndedQuestions } =
                getopenEndedQuestionstate()
            const { selectedOptions, setSelectedOptions } =
                getSelectedOpenEndedOptions()
            const { difficulty, setDifficulty } = getOpenEndedDifficulty()
            const { offset, setOffset } = getOffset()
            const { position, setPosition } = getPosition()

            return (
                <>
                    <div className="flex justify-end">
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
                                        openEndedQuestions={openEndedQuestions}
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

                                    filteredOpenEndedQuestions,
                                    setOpenEndedQuestions,
                                    selectedOptions,
                                    difficulty,
                                    offset,
                                    position
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
        enableHiding: true,
    },
]
