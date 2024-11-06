import React from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import QuestionDescriptionModal from './QuestionDescriptionModal'

interface OpenEndedQuestion {
    id: number
    question: string
    difficulty: string
    tagId: number
    marks: number
    usage: number
}

const OpenEndedQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
    tags,
}: {
    questions: OpenEndedQuestion[]
    setSelectedQuestions: React.Dispatch<
        React.SetStateAction<OpenEndedQuestion[]>
    >
    selectedQuestions: OpenEndedQuestion[]
    tags: any
}) => {
    return (
        <ScrollArea className="h-dvh pr-4">
            <ScrollBar orientation="vertical" />
            {questions.map((question: OpenEndedQuestion) => {
                const tag = tags?.find(
                    (tag: any) => tag?.id === question?.tagId
                )
                return (
                    <div
                        key={question.id}
                        className={`p-5 rounded-sm border-b border-gray-200 mb-4`}
                    >
                        <div className="flex justify-between text-start items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold">
                                        {ellipsis(question?.question, 35)}
                                    </h2>
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
                                            ), // Text color
                                            difficultyBgColor(
                                                question?.difficulty
                                            ) // Background color
                                        )}
                                    >
                                        {question.difficulty}
                                    </span>
                                </div>
                                <div className="w-full">
                                    <p className="text-[#4A4A4A] mt-1 font-[14px">
                                        {ellipsis(question?.question, 60)}
                                    </p>
                                </div>

                                {/* <Dialog>
                            <DialogTrigger asChild> */}
                                <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer">
                                    View Full Description
                                </p>
                                {/* </DialogTrigger>
                            <DialogOverlay />
                            <QuestionDescriptionModal
                                question={question}
                                type="coding"
                                tagName={tag?.tagName}
                            />
                        </Dialog> */}
                            </div>
                            <div className="flex">
                                {selectedQuestions.some(
                                    (q: OpenEndedQuestion) =>
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
                                                    (q: OpenEndedQuestion) =>
                                                        q.id === question.id
                                                )
                                            ) {
                                                setSelectedQuestions([
                                                    ...selectedQuestions,
                                                    question,
                                                ])
                                            }
                                        }}
                                        className="text-secondary cursor-pointer"
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
