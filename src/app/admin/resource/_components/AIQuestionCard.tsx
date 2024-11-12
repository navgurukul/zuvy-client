import React, { useState } from 'react'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, difficultyQuestionBgColor } from '@/lib/utils'
import { Edit, Pencil, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import { getDeleteQuizQuestion } from '@/store/store'
import { DELETE_AI_QUESTION_CONFIRMATION } from '@/utils/constant'
import { handleDeleteQuizModal } from '@/utils/admin'
import EditAIQuestion from './EditAIQuestions'

interface QuestionCardProps {
    questionId: any
    question: string
    options: { [key: string]: string }
    correctOption: number
    difficulty: string
    tagId: any
    tags: any
    handleQuestionConfirm: (questionId: any, setDeleteModalOpen: any) => void
}

export const AIQuestionCard = ({
    questionId,
    question,
    options,
    correctOption,
    difficulty,
    tagId,
    tags,
    handleQuestionConfirm,
}: QuestionCardProps) => {
    const { deleteQuizQuestionId, setDeleteQuizQuestionId } =
        getDeleteQuizQuestion()

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isEditModalOpen, setEditModalOpen] = useState(false)

    return (
        <>
            <Card className="bg-white rounded-lg shadow-md p-5">
                {/* <Card className="bg-white rounded-lg p-5 border-non shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]"> */}
                {/* <CardBody className="px-6 py-4"> */}
                <div className="flex flex-row gap-4">
                    <Badge className="mb-3 text-white">
                        {tags.find((t: any) => t.id === tagId)?.tagName}
                    </Badge>
                    <Badge
                        variant="yellow"
                        className={cn(
                            `mb-3 text-white`,
                            difficultyQuestionBgColor(difficulty)
                        )}
                    >
                        {difficulty}
                    </Badge>
                    <div className="flex  ml-auto items-center">
                        <Dialog
                            open={isEditModalOpen}
                            onOpenChange={setEditModalOpen}
                        >
                            <DialogTrigger asChild>
                                <Pencil
                                    className="cursor-pointer mr-5"
                                    size={20}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditModalOpen(true)
                                    }}
                                />
                            </DialogTrigger>
                            <DialogContent
                                className="sm:max-w-[518px] max-h-[90vh] overflow-y-auto overflow-x-hidden"
                                data-state="closed"
                                aria-describedby="edit-question-dialog-description"
                            >
                                <DialogHeader>
                                    <DialogTitle>Edit Question</DialogTitle>
                                </DialogHeader>
                                <EditAIQuestion
                                    questionId={questionId}
                                    setEditModalOpen={setEditModalOpen}
                                />
                            </DialogContent>
                        </Dialog>

                        <Trash2
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteModalOpen(true)
                            }}
                            className="text-destructive cursor-pointer"
                            size={20}
                        />
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            onConfirm={() => {
                                handleQuestionConfirm(
                                    questionId,
                                    setDeleteModalOpen
                                )
                            }}
                            modalTitle={'Delete Question'}
                            modalText={DELETE_AI_QUESTION_CONFIRMATION}
                            buttonText="Delete Question"
                            input={false}
                        />
                    </div>
                </div>

                <p className="ml-4 text-start text-md font-semibold">
                    {question}
                </p>
                {/* tags.find((t) => t.id === topicId[0].value)?.tagName */}
                <div className="space-y-2 mt-4">
                    <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <span className="font-medium mr-2">A.</span>
                        <span>{options[1]}</span>
                    </div>
                    <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <span className="font-medium mr-2">B.</span>
                        <span>{options[2]}</span>
                    </div>
                    <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <span className="font-medium mr-2">C.</span>
                        <span>{options[3]}</span>
                    </div>
                    <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <span className="font-medium mr-2">D.</span>
                        <span>{options[4]}</span>
                    </div>
                </div>
            </Card>
        </>
    )
}
