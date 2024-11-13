import React from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'

const SelectOpenEndedQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
    tags,
    type,
}: {
    setSelectedQuestions: React.Dispatch<React.SetStateAction<any[]>>
    selectedQuestions: any[]
    tags: any
    type: string
}) => {
    return (
        <div className="w-full">
            {selectedQuestions.map((question: any) => {
                const tag = tags?.find((tag: any) => tag.id === question.tagId)

                return (
                    <div key={question.id} className="p-5 rounded-sm border-b border-gray-200 mb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="font-bold text-lg truncate">
                                        {ellipsis(question.question, 30)}
                                    </h2>
                                    <div className="flex gap-2 ml-auto">
                                        {tag && (
                                            <span className="text-sm text-[#518672] bg-[#DCE7E3] rounded-full px-2">
                                                {tag?.tagName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                `text-[12px] rounded-full px-2`,
                                                difficultyColor(question.difficulty),
                                                difficultyBgColor(question.difficulty)
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-1 text-left">
                                    {ellipsis(question.question, 60)}
                                </p>
                                <Link
                                    href=""
                                    className="font-semibold text-sm mt-2 text-secondary text-left block"
                                >
                                    View Full Description
                                </Link>
                            </div>
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
                )
            })}
        </div>
    )
}

export default SelectOpenEndedQuestions
