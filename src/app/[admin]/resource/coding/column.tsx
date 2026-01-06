'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { CodingQuestion } from '@/utils/data/schema'
import { Edit, Trash2, Eye } from 'lucide-react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { DELETE_CODING_QUESTION_CONFIRMATION } from '@/utils/constant'
import DeleteConfirmationModal from '@/app/[admin]/courses/[courseId]/_components/deleteModal'
import {
    getDeleteCodingQuestion,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
    getCodingQuestionTags,
    getSelectedOptions,
    getDifficulty,
    getOffset,
    getPosition,
} from '@/store/store'
import { cn, difficultyColor } from '@/lib/utils'

import {
    handleConfirm,
    handleDelete,
    handleDeleteModal,
    handleEditCodingQuestion,
    filteredCodingQuestions,
} from '@/utils/admin'
import QuestionDescriptionModal from '../../courses/[courseId]/module/_components/Assessment/QuestionDescriptionModal'

export const columns: ColumnDef<CodingQuestion>[] = [
    {
        accessorKey: 'problemName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Question" />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <span className="text-start w-[400px] flex ">
                    {codingQuestion.title}
                </span>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'tagId',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Topic" />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original
            const { tags } = getCodingQuestionTags()

            // Find the topic name based on tagId
            const topicName =
                tags.find((tag) => tag.id === codingQuestion.tagId)?.tagName ||
                'Unknown Topic'

            return (
                <div className="flex items-center">
                    <span className="text-sm font-medium rounded-md">
                        {topicName}
                    </span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'difficulty',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="flex justify-end"
                column={column}
                title="Difficulty"
            />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div
                    className={cn(
                        `flex items-center rounded-full border justify-center`,
                        difficultyColor(codingQuestion.difficulty)
                    )}
                >
                    <span className="text-center">
                        {codingQuestion.difficulty}
                    </span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'usage',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="flex justify-end"
                column={column}
                title="Usage"
            />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div className="flex items-center justify-center">
                    {codingQuestion?.usage ? codingQuestion?.usage : 0}
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="flex justify-center"
                column={column}
                title="Created"
            />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original
            const createdDate = codingQuestion.createdAt
                ? new Date(codingQuestion.createdAt).toLocaleDateString(
                      'en-GB',
                      {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                      }
                  )
                : 'N/A'

            return (
                <div className="flex items-center justify-center">
                    <span className="text-sm">{createdDate}</span>
                </div>
            )
        },
        enableSorting: true,
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
            const codingQuestion = row.original
            const {tags} = getCodingQuestionTags()

            //Define topicName here as well
            const topicName = tags.find(tag => tag.id === codingQuestion.tagId)?.tagName || 'Unknown Topic'

            return (
                <div className="mr-5 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button>
                                <Eye size={18} className="cursor-pointer" />
                            </button>
                        </DialogTrigger>
                        <QuestionDescriptionModal
                            question={codingQuestion}
                            type="coding"
                            tagName={topicName}
                        />
                    </Dialog>
                </div>
            )
        },
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
                setIsQuestionUsed,
            } = getEditCodingQuestionDialogs()

            const { codingQuestions, setCodingQuestions } =
                getcodingQuestionState()
            const { selectedOptions, setSelectedOptions } = getSelectedOptions()
            const { difficulty, setDifficulty } = getDifficulty()
            const { offset, setOffset } = getOffset()
            const { position, setPosition } = getPosition()

            return (
                <>
                    <div className="flex">
                        <Edit
                            className="cursor-pointer mr-5"
                            size={18}
                            onClick={() => {
                                handleEditCodingQuestion(
                                    codingQuestion,
                                    setIsCodingEditDialogOpen,
                                    setEditCodingQuestionId,
                                    setIsQuestionUsed
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
                            size={18}
                        />
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            onConfirm={() => {
                                handleConfirm(
                                    handleDelete,
                                    setDeleteModalOpen,
                                    deleteCodingQuestionId,
                                    filteredCodingQuestions,
                                    setCodingQuestions,
                                    selectedOptions,
                                    difficulty,
                                    offset,
                                    position
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
