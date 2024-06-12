import React from 'react'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { PlusCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const SelectCodingQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
}: {
    setSelectedQuestions: React.Dispatch<React.SetStateAction<any[]>>
    selectedQuestions: any[]
}) => {
    return (
        <>
            <div className="w-full">
                {selectedQuestions.map((question: any) => (
                    <React.Fragment key={question.id}>
                        <div
                            className={`p-5 rounded-sm border border-gray-200 mb-4`}
                        >
                            <div className="flex justify-between text-start items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-lg">
                                            {ellipsis(question.title, 30)}
                                        </h2>
                                        <span
                                            className={cn(
                                                `font-semibold text-secondary`,
                                                difficultyColor(
                                                    question.difficulty
                                                )
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
                                    <div className="w-full">
                                        <p className="text-gray-600 mt-1">
                                            {ellipsis(question.description, 60)}
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
                                    <XCircle
                                        onClick={() =>
                                            setSelectedQuestions(
                                                selectedQuestions.filter(
                                                    (q: any) =>
                                                        q.id !== question.id
                                                )
                                            )
                                        }
                                        className="text-destructive cursor-pointer"
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

export default SelectCodingQuestions
