import React from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'

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
    tags,
    type
}: {
    setSelectedQuestions: any
    selectedQuestions: any
    tags: any
    type:string
}) => {
    return (
        <>
            <div className="w-full">
                {selectedQuestions.map((question: MCQQuestion) => {
                    // Find the tag name corresponding to the question's tagId
                    const tag = tags?.find((tag: any) => tag.id === question.tagId)

                    return (
                        <React.Fragment key={question.id}>
                            <div className="p-5 rounded-sm border-b border-gray-200 mb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-lg truncate">
                                                {ellipsis(question.question, 30)}
                                            </h2>
                                            {tag && (
                                                <span className="text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] px-[8px]">
                                                    {tag?.tagName}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    `text-[12px] rounded-[100px] px-[8px]`,
                                                    difficultyColor(question.difficulty), // Text color
                                                    difficultyBgColor(question.difficulty) // Background color
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

                                        <X
                                            onClick={() =>
                                                setSelectedQuestions(
                                                    selectedQuestions.filter(
                                                        (q: any) => q.id !== question.id
                                                    )
                                                )
                                            }
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
