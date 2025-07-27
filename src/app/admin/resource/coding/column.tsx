'use client'

import React, { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { CodingQuestion } from '@/utils/data/schema'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { DELETE_CODING_QUESTION_CONFIRMATION, POSITION } from '@/utils/constant'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import {
    getDeleteCodingQuestion,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
    getSelectedOptions,
    getDifficulty,
    getOffset,
} from '@/store/store'
import { cn, difficultyColor } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

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
            <DataTableColumnHeader column={column} title="Problem Name" />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <span className="text-start w-full flex ">
                    {codingQuestion.title}
                </span>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: 'difficulty',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="flex justify-end ml-28"
                column={column}
                title="Difficulty"
            />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div
                    className={cn(
                        `flex items-center justify-end  ml-24 font-semibold text-secondary`,
                        difficultyColor(codingQuestion.difficulty)
                    )}
                >
                    <span className="text-left mr-10 w-4">
                        {codingQuestion.difficulty}
                    </span>
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
                className="flex justify-end"
                column={column}
                title="Usage"
            />
        ),
        cell: ({ row }) => {
            const codingQuestion = row.original

            return (
                <div className="flex items-center justify-end">
                    {codingQuestion?.usage
                        ? codingQuestion?.usage + ' times'
                        : 0 + ' times'}
                </div>
            )
        },
        enableSorting: true,
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
            const codingQuestion = row.original

            return (
                <div className="mr-5 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button>
                                <Eye className="cursor-pointer" />
                            </button>
                        </DialogTrigger>
                        <QuestionDescriptionModal
                            question={codingQuestion}
                            type="coding"
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
            const searchParams = useSearchParams()
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
            const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])

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
