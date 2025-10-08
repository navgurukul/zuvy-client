import React from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import QuestionDescriptionModal from './QuestionDescriptionModal'
import PreviewMCQ from '@/app/[admin]/resource/_components/PreviewMcq'
import { renderQuestionPreview } from '@/utils/quizHelpers'
import { MCQQuestion } from '@/app/[admin]/courses/[courseId]/module/_components/quiz/ModuleQuizType'
import {
    CodingQuestionsProps,
    Tag,
} from '@/app/[admin]/courses/[courseId]/module/_components/quiz/ModuleQuizType'

const QuizQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
    tags,
    setIsNewQuestionAdded,
    type,
}: CodingQuestionsProps) => {
    const handleQuestionSelection = (
        question: MCQQuestion,
        selectedQuestions: MCQQuestion[],
        setSelectedQuestions: React.Dispatch<
            React.SetStateAction<MCQQuestion[]>
        >,
        setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        if (!selectedQuestions.some((q) => q.id === question.id)) {
            setSelectedQuestions([...selectedQuestions, question])
        }
        setIsNewQuestionAdded(true)
    }

    return (
        <ScrollArea className="h-[25.5rem] w-full pr-3">
            {/* <ScrollBar orientation="vertical" className="h-dvh" /> */}
            {questions.map((question: MCQQuestion) => {
                const tag = tags?.find(
                    (tag: Tag) => tag?.id === question?.tagId
                )
                const questionText =
                    question?.quizVariants?.[0]?.question || question.question

                return (
                    <div
                        key={question.id}
                        className={`py-4 px-8 pr-5 rounded-lg border border-gray-200 bg-white mt-4`}
                    >
                        <div className="flex justify-between text-start items-center">
                            <div className="w-full">
                                <div className="flex items-center  justify-between gap-2">
                                    <h2 className="font-bold text-[1rem] text-gray-600">
                                        <div
                                            className="text-[#4A4A4A] mt-1 overflow-hidden text-ellipsis font-semibold"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {renderQuestionPreview(
                                                questionText,
                                                { textLength: 40 }
                                            )}
                                        </div>
                                    </h2>
                                    <div className="flex items-center gap-x-2">
                                        <div className="space-x-2">
                                            {tag && (
                                                <span className="text-sm text-[#518672] bg-[#DCE7E3] p-1 rounded-[100px] px-[8px]">
                                                    {tag?.tagName}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    `text-[12px] rounded-[100px] px-1.5 py-1 `,
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
                                        </div>
                                        <div className="flex">
                                            {selectedQuestions.some(
                                                (q: MCQQuestion) =>
                                                    q.id === question.id
                                            ) ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-circle-check"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                    />
                                                    <path d="m9 12 2 2 4-4" />
                                                </svg>
                                            ) : (
                                                <PlusCircle
                                                    onClick={() => {
                                                        handleQuestionSelection(
                                                            question,
                                                            selectedQuestions,
                                                            setSelectedQuestions,
                                                            setIsNewQuestionAdded
                                                        )
                                                    }}
                                                    className="text-primary cursor-pointer"
                                                    size={20}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <p className="font-bold text-sm mt-2 text-primary cursor-pointer">
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
                                </Dialog>
                            </div>
                        </div>
                    </div>
                )
            })}
        </ScrollArea>
    )
}

export default QuizQuestions
