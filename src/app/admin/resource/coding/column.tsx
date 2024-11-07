'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { CodingQuestion } from '@/utils/data/schema'
import { Edit, Info, Pencil, Star, Trash2, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { DELETE_CODING_QUESTION_CONFIRMATION } from '@/utils/constant'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import {
    getDeleteCodingQuestion,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
    getSelectedOptions,
    getDifficulty,
} from '@/store/store'
import { cn, difficultyColor } from '@/lib/utils'

import {
    handleConfirm,
    handleDelete,
    handleDeleteModal,
    getAllCodingQuestions,
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
                <Dialog>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <span>{codingQuestion.title}</span>
                <DialogTrigger asChild>
                        <ExternalLink className="text-[#518672] hover:text-green-800 w-4 h-4" />
                </DialogTrigger>
                        </div>
    
                <DialogOverlay>
                    <DialogContent>
                        <QuestionDescriptionModal
                            question={codingQuestion}
                            type="coding"
                            />
                    </DialogContent>
                </DialogOverlay>
            </Dialog>
            
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
                const { selectedOptions, setSelectedOptions } = getSelectedOptions()
                const {difficulty, setDifficulty} = getDifficulty()
                console.log("selectedoption.column", selectedOptions)
                console.log("difficulty.collumn", difficulty )

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
                                    filteredCodingQuestions,
                                    setCodingQuestions,
                                    selectedOptions,
                                    difficulty,

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
