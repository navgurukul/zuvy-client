'use client'

import React, { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { ellipsis } from '@/lib/utils'
import {
    getAllQuizData,
    getCodingQuestionTags,
    getmcqdifficulty,
    getOffset,
    getSelectedMCQOptions,
    quiz,
} from '@/store/store'
import { Edit, Eye, Pencil, Trash2 } from 'lucide-react'
import { difficultyColor } from '@/lib/utils'

import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import { getDeleteQuizQuestion, getEditQuizQuestion } from '@/store/store'
import {
    handleQuizConfirm,
    handleQuizDelete,
    handleDeleteQuizModal,
    // getAllQuizQuestion,
    // handlerQuizQuestions,
    filteredQuizQuestions,
} from '@/utils/admin'
import {
    DELETE_QUIZ_QUESTION_CONFIRMATION,
    OFFSET,
    POSITION,
} from '@/utils/constant'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import CheckboxAndDeleteHandler from '../_components/CheckBoxAndDeleteCombo'
import { Checkbox } from '@/components/ui/checkbox'
import PreviewMCQ from '../_components/PreviewMcq'
import { useSearchParams } from 'next/navigation'

export const columns: ColumnDef<quiz>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            return (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            )
        },

        cell: ({ table, row }) => {
            return (
                <CheckboxAndDeleteHandler
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value)
                    }}
                    aria-label="Select row"
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
    },

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
            const question = row.original?.quizVariants[0]?.question
            const truncatedQuestion = ellipsis(question, 70)
            return (
                <div
                    className="text-left text-md p-1 w-[900px] font-[16px] hover:bg-slate-200 rounded-lg transition ease-in-out delay-150 overflow-hidden text-ellipsis"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    <span
                        dangerouslySetInnerHTML={{ __html: truncatedQuestion }}
                    />
                    {/* {question} */}
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
                className="text-[17px]"
                column={column}
                title="Usage"
            />
        ),
        cell: ({ row }) => {
            const usage = row.original.usage
            return (
                <p className={` text-left ml-5 text-[15px] font-semibold `}>
                    {usage}
                </p>
            )
        },
        enableSorting: false,
        enableHiding: true,
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
        cell: ({ row, table }) => {
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
        enableHiding: true,
    },

    {
        id: 'actions1',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-[17px]"
                column={column}
                title="Preview"
            />
        ),
        cell: ({ row }) => {
            const quizQuestionId = row.original.id
            const selectedRows = row.getIsSelected()
            const { tags, setTags } = getCodingQuestionTags()

            return (
                <div className="mr-5">
                    <Dialog>
                        <DialogTrigger>
                            {!selectedRows && (
                                <Eye className="cursor-pointer" />
                            )}
                        </DialogTrigger>
                        <DialogContent className="w-full">
                            <PreviewMCQ
                                quizQuestionId={quizQuestionId}
                                assesmentSide={true}
                                tags={tags}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            )
        },
        enableHiding: true,
    },

    {
        id: 'actions2',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-[17px]"
                column={column}
                title=""
            />
        ),
        cell: ({ row }) => {
            const quizQuestionid = row.original.id
            const { setIsEditModalOpen, setIsQuizQuestionId } =
                getEditQuizQuestion()
            const editQuizHandler = (id: number) => {
                setIsEditModalOpen(true)
                setIsQuizQuestionId(id)
            }
            const selectedRows = row.getIsSelected()

            return (
                <div className="flex">
                    <div>
                        {!selectedRows && (
                            <Pencil
                                onClick={() => editQuizHandler(quizQuestionid)}
                                className="cursor-pointer mr-5"
                                size={20}
                            />
                        )}
                    </div>
                </div>
            )
        },
        enableHiding: true,
    },
    {
        id: 'actions3',

        cell: ({ row }) => {
            const searchParams = useSearchParams()
            const quizQuestion = row.original
            const {
                isDeleteModalOpen,
                setDeleteModalOpen,
                deleteQuizQuestionId,
                setDeleteQuizQuestionId,
            } = getDeleteQuizQuestion()
            const { setStoreQuizData } = getAllQuizData()
            const { selectedOptions, setSelectedOptions } =
                getSelectedMCQOptions()
            const {
                mcqDifficulty: difficulty,
                setMcqDifficulty: setDifficulty,
            } = getmcqdifficulty()
            const { offset, setOffset } = getOffset()
            const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
            const selectedRows = row.getIsSelected()

            return (
                <div className="ml-[-30px]">
                    {!selectedRows && (
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
                    )}
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={() => {
                            handleQuizConfirm(
                                handleQuizDelete,
                                setDeleteModalOpen,
                                deleteQuizQuestionId,
                                // getAllQuizQuestion,
                                filteredQuizQuestions,
                                setStoreQuizData,
                                selectedOptions,
                                difficulty,
                                offset,
                                position
                            )
                        }}
                        modalText={DELETE_QUIZ_QUESTION_CONFIRMATION}
                        buttonText="Delete Quiz Question"
                        input={false}
                    />
                </div>
            )
        },
        enableHiding: true,
    },
]
