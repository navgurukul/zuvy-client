import React from 'react'
import { PlusCircle } from 'lucide-react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import PreviewOpenEnded from '@/app/[admin]/resource/_components/PreviewOpenEnded'
import {
    OpenEndedQuestiones,
    OpenEndedQuestionesProps,
    Tag,
} from '@/app/[admin]/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType'

const OpenEndedQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
    tags,
}: OpenEndedQuestionesProps) => {
    return (
        <ScrollArea className="h-[calc(100vh-200px)] pb-44  pr-4">
            {/* <ScrollBar orientation="vertical" className="h-dvh" /> */}
            {questions.map((question: OpenEndedQuestiones) => {
                const tag = tags?.find(
                    (tag: Tag) => tag?.id === question?.tagId
                )
                return (
                    <div
                        key={question.id}
                        className="py-4 px-8 pr-5 rounded-lg border border-gray-200 bg-white mb-4"
                    >
                        <div className="flex justify-between text-start items-center">
                            <div className="w-full">
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="font-bold text-[15px] text-gray-600">
                                        {ellipsis(question?.question, 35)}
                                    </h2>
                                    <div className="flex gap-2 ml-auto">
                                        {tag && (
                                            <span className="text-sm text-[#518672] bg-[#DCE7E3] rounded-[100px] px-[8px]">
                                                {tag?.tagName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                `text-[12px] rounded-[100px] px-[8px]`,
                                                difficultyColor(
                                                    question?.difficulty
                                                ),
                                                difficultyBgColor(
                                                    question?.difficulty
                                                )
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[#4A4A4A] mt-1 text-[1rem] font-[14px]">
                                    {ellipsis(question?.question, 45)}
                                </p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <p className="font-bold text-sm mt-2 text-primary cursor-pointer">
                                            View Full Description
                                        </p>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <PreviewOpenEnded
                                            question={question}
                                            tag={tag}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="flex">
                                {selectedQuestions.some(
                                    (q: OpenEndedQuestiones) =>
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
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                ) : (
                                    <PlusCircle
                                        onClick={() => {
                                            if (
                                                !selectedQuestions.some(
                                                    (q: OpenEndedQuestiones) =>
                                                        q.id === question.id
                                                )
                                            ) {
                                                setSelectedQuestions([
                                                    ...selectedQuestions,
                                                    question,
                                                ])
                                            }
                                        }}
                                        className="text-primary cursor-pointer"
                                        size={20}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </ScrollArea>
    )
}

export default OpenEndedQuestions
