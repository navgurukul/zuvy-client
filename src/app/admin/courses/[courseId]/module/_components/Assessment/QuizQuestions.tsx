import React from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface MCQQuestion {
    id: number
    question: string
    options: Record<string, string>
    correctOption: number
    marks: number | null
    difficulty: string
    tagId: number
    usage: number
}

const QuizQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
}: {
    questions: MCQQuestion[]
    setSelectedQuestions: React.Dispatch<React.SetStateAction<MCQQuestion[]>>
    selectedQuestions: MCQQuestion[]
}) => {
    return (
        <ScrollArea className="h-dvh pr-4">
            <ScrollBar orientation="vertical" />
            {questions.map((question: MCQQuestion) => (
                <div
                    key={question.id}
                    className={`p-5 rounded-sm border border-gray-200 mb-4 ${
                        selectedQuestions.some(
                            (q: MCQQuestion) => q.id === question.id
                        )
                            ? 'bg-gray-100'
                            : ''
                    }`}
                >
                    <div className="flex justify-between text-start items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg">
                                    {ellipsis(question.question, 30)}
                                </h2>
                                <span
                                    className={cn(
                                        `font-semibold text-secondary`,
                                        difficultyColor(question.difficulty)
                                    )}
                                >
                                    {question.difficulty}
                                </span>
                            </div>
                            <div className="w-full">
                                <p className="text-gray-600 mt-1">
                                    {ellipsis(question.question, 60)}
                                </p>
                            </div>
                            <Link
                                href=""
                                className="font-semibold text-sm mt-2 text-secondary"
                            >
                                View Full Description
                            </Link>
                        </div>
                        <div className="flex">
                            {selectedQuestions.some(
                                (q: MCQQuestion) => q.id === question.id
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
                                                (q: MCQQuestion) =>
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
            ))}
        </ScrollArea>
    )
}

export default QuizQuestions
