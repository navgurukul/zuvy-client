// components/OpenEndedQuestions.tsx
import React from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

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
}: {
    questions: any
    setSelectedQuestions: any
    selectedQuestions: any
}) => {
    return (
        <ScrollArea className="h-dvh pr-4">
            {questions.map((question: OpenEndedQuestion) => (
                <div
                    key={question.id}
                    className={`p-5 rounded-sm border border-gray-200 mb-4`}
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
                                href={''}
                                className="font-semibold text-sm mt-2 text-secondary"
                            >
                                View Full Description
                            </Link>
                        </div>
                        <div className="flex">
                            <PlusCircle
                                onClick={() =>
                                    setSelectedQuestions([
                                        ...selectedQuestions,
                                        question,
                                    ])
                                }
                                className="text-secondary cursor-pointer"
                                size={20}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </ScrollArea>
    )
}

export default OpenEndedQuestions
