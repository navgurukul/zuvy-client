import React from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import PreviewMCQ from '../../../../../resource/_components/PreviewMcq'
import { renderQuestionPreview } from '@/utils/quizHelpers'
import {
    MCQQuestion,
    CodingQuestiones,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType'
const SelectQuizQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
    tags,
    type,
    setIsNewQuestionAdded,
}: {
    setSelectedQuestions: React.Dispatch<React.SetStateAction<any[]>>
    selectedQuestions: any[]
    tags: any[]
    type: string
    setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const handleQuestionRemoval = (
        question: { id: number }, // Assuming 'id' is a number, adjust as needed
        selectedQuestions: { id: number }[], // Adjust type as needed
        setSelectedQuestions: React.Dispatch<
            React.SetStateAction<{ id: number }[]>
        >, // Adjust type as needed
        setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setSelectedQuestions(
            selectedQuestions.filter((q) => q.id !== question.id)
        )
        setIsNewQuestionAdded(true)
    }

    return (
        <>
            <div className="w-full">
                {selectedQuestions.map((question: CodingQuestiones) => {
                    // Find the tag name corresponding to the question's tagId
                    const tag = tags?.find(
                        (tag: any) => tag.id === question.tagId
                    )
                    const questionText =
                        question?.quizVariants?.[0]?.question ||
                        question.question

                    return (
                        <React.Fragment key={question.id}>
                            <div className="py-4 px-8 rounded-lg border border-gray-200 bg-white mb-4">
                                <div className="flex justify-between items-start w-full">
                                    <div className="w-full">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-[15px] text-gray-600">
                                                {renderQuestionPreview(
                                                    questionText,
                                                    { textLength: 40 }
                                                )}
                                            </h2>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <p className="font-bold text-sm mt-2 text-primary cursor-pointer text-left">
                                                    View Full Description
                                                </p>
                                            </DialogTrigger>
                                            <DialogOverlay />
                                            <DialogContent>
                                                <PreviewMCQ
                                                    quizQuestionId={question.id}
                                                    tags={tags}
                                                    assesmentSide={true}
                                                />
                                            </DialogContent>
                                        </Dialog>{' '}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {tag && (
                                            <span className="text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] px-[8px]">
                                                {tag?.tagName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                `text-[12px] rounded-[100px] px-[8px]`,
                                                difficultyColor(
                                                    question.difficulty
                                                ), // Text color
                                                difficultyBgColor(
                                                    question.difficulty
                                                ) // Background color
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                        <X
                                            onClick={() => {
                                                handleQuestionRemoval(
                                                    question,
                                                    selectedQuestions,
                                                    setSelectedQuestions,
                                                    setIsNewQuestionAdded
                                                )
                                            }}
                                            className="text-[#A3A3A3] cursor-pointer ml-4"
                                            size={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>
        </>
    )
}

export default SelectQuizQuestions
