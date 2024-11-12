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
import { getDeleteQuizQuestion, getEditQuizQuestion } from '@/store/store'
import { DELETE_AI_QUESTION_CONFIRMATION } from '@/utils/constant'
import {
    // handleQuizConfirm,
    // handleQuizDelete,
    handleDeleteQuizModal,
    // getAllQuizQuestion,
    // handlerQuizQuestions,
} from '@/utils/admin'

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
    const {
        // isDeleteModalOpen,
        // setDeleteModalOpen,
        deleteQuizQuestionId,
        setDeleteQuizQuestionId,
    } = getDeleteQuizQuestion()

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

    console.log('AIQuestionCard rendered with questionId:', questionId)

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
                        // className="mb-3 bg-gray-400 text-white"
                        className={cn(
                            `mb-3 text-white`,
                            difficultyQuestionBgColor(difficulty)
                        )}
                    >
                        {difficulty}
                    </Badge>
                    <div className="flex  ml-auto items-center">
                        <div id="editQuizDialog" data-state="closed">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Pencil
                                        className="cursor-pointer mr-5"
                                        size={20}
                                        // onClick={openDialog}
                                    />
                                </DialogTrigger>

                                {/* <DialogContent
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
                            </DialogContent> */}
                            </Dialog>
                        </div>

                        <Trash2
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteQuizModal(
                                    setDeleteModalOpen,
                                    setDeleteQuizQuestionId,
                                    questionId
                                )
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
