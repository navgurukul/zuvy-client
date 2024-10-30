import React from 'react'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'

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

const SelectQuizQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
}: {
    setSelectedQuestions: any
    selectedQuestions: any
}) => {
    return (
        <>
            <div className="w-full">
                {selectedQuestions.map((question: MCQQuestion) => (
                    <React.Fragment key={question.id}>
                        <div className="p-5 rounded-sm border border-gray-200 mb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-lg truncate">
                                            {ellipsis(question.question, 30)}
                                        </h2>
                                        <span
                                            className={cn(
                                                'font-semibold text-secondary',
                                                difficultyColor(
                                                    question.difficulty
                                                )
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>
                                    <div className="w-full">
                                        <p className="text-gray-600 mt-1 text-left">
                                            {ellipsis(question.question, 60)}
                                        </p>
                                    </div>
                                    <Link
                                        href=""
                                        className="font-semibold text-sm mt-2 text-secondary text-left block"
                                    >
                                        View Full Description
                                    </Link>
                                </div>
                                <div className="flex items-center">
                                    <span
                                        className="ml-4 bg-[#FEEEC7] text-secondary px-2 py-1 rounded-sm font-semibold"
                                    >
                                        Mcq
                                    </span>
                                    <XCircle
                                        onClick={() =>
                                            setSelectedQuestions(
                                                selectedQuestions.filter(
                                                    (q: any) =>
                                                        q.id !== question.id
                                                )
                                            )
                                        }
                                        className="text-destructive cursor-pointer ml-4"
                                        size={20}
                                    />
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </>
    )
}

export default SelectQuizQuestions
