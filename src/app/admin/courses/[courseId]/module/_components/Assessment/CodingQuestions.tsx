import React from 'react'
import { PlusCircle } from 'lucide-react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import QuestionDescriptionModal from './QuestionDescriptionModal'

interface TestCase {
    id: number
    inputs: {
        parameterName: string
        parameterType: string
        parameterValue: any
    }[]
    expectedOutput: {
        parameterType: string
        parameterValue: any
    }
}

interface CodingQuestion {
    id: number
    title: string
    description: string
    difficulty: string
    tagId: number
    constraints: string
    testCases: TestCase[]
    expectedOutput: number[]
    createdAt: string
}

const CodingQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
    tags,
}: {
    questions: CodingQuestion[]
    setSelectedQuestions: React.Dispatch<React.SetStateAction<CodingQuestion[]>>
    selectedQuestions: CodingQuestion[]
    tags: any
}) => {
    return (
        <ScrollArea className="h-3/5  w-full pr-5 pb-32 ">
            {/* <ScrollBar orientation="vertical" className="h-3/4" /> */}
            <div className="h-screen">
                {questions.map((question: CodingQuestion) => {
                    const tag = tags?.find(
                        (tag: any) => tag?.id === question?.tagId
                    )
                    return (
                        <div
                            key={question.id}
                            className="p-5 rounded-sm border-b border-gray-200 mb-4"
                        >
                            <div className="flex justify-between text-start items-center w-full">
                                <div className="w-full">
                                    <div className="flex items-center justify-between w-full">
                                        <h2 className="font-bold">
                                            {ellipsis(question.title, 30)}
                                        </h2>
                                        <div className="flex gap-2 ml-auto">
                                            {tag && (
                                                <span className="text-sm text-[#518672] bg-[#DCE7E3] rounded-full px-2">
                                                    {tag?.tagName}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    `text-sm rounded-full px-2`,
                                                    difficultyColor(
                                                        question.difficulty
                                                    ),
                                                    difficultyBgColor(
                                                        question.difficulty
                                                    )
                                                )}
                                            >
                                                {question.difficulty}
                                            </span>
                                            <div className="flex">
                                                {selectedQuestions.some(
                                                    (q: CodingQuestion) =>
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
                                                            if (
                                                                !selectedQuestions.some(
                                                                    (
                                                                        q: CodingQuestion
                                                                    ) =>
                                                                        q.id ===
                                                                        question.id
                                                                )
                                                            ) {
                                                                setSelectedQuestions(
                                                                    [
                                                                        ...selectedQuestions,
                                                                        question,
                                                                    ]
                                                                )
                                                            }
                                                        }}
                                                        className="text-secondary cursor-pointer"
                                                        size={20}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[#4A4A4A] mt-1 font-[14px]">
                                        {ellipsis(question.description, 45)}
                                    </p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer">
                                                View Full Description
                                            </p>
                                        </DialogTrigger>
                                        <DialogOverlay />
                                        <QuestionDescriptionModal
                                            question={question}
                                            type="coding"
                                            tagName={tag?.tagName}
                                        />
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}

export default CodingQuestions
