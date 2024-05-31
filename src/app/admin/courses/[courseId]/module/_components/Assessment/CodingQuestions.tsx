import React from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Example {
    input: number[]
    output: number[]
}

interface CodingQuestion {
    id: number
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    inputBase64: string | null
    examples: Example[]
    testCases: Example[]
    expectedOutput: number[]
    solution: string
    createdAt: string
    updatedAt: string
}

const CodingQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
}: {
    questions: any
    setSelectedQuestions: any
    selectedQuestions: any
}) => {
    return (
        <ScrollArea className="h-dvh pr-4">
            {questions.map((question: CodingQuestion) => (
                <div
                    key={question.id}
                    className={`p-5 rounded-sm border border-gray-200 mb-4 ${
                        selectedQuestions.some((q: any) => q.id === question.id)
                            ? 'bg-gray-100'
                            : ''
                    }`}
                >
                    <div className="flex justify-between text-start items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg">
                                    {question.title}
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
                                    {ellipsis(question.description, 60)}
                                </p>
                            </div>
                            <Link
                                href={''}
                                className="font-semibold text-sm mt-2 text-secondary"
                            >
                                View Full Description
                            </Link>
                        </div>
                        <div className="flex">
                            {selectedQuestions.some(
                                (q: any) => q.id === question.id
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
                                                (q: any) => q.id === question.id
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

export default CodingQuestions
