import React from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { ellipsis } from '@/lib/utils'

const SelectedProblems = ({
    selectedQuestions,
    setSelectedQuestions,
}: {
    selectedQuestions: any
    setSelectedQuestions: any
}) => {
    return (
        <div className="ml-5 pl-5 border-l-2 text-start">
            <h2 className="font-semibold mb-5">Selected Coding Problems</h2>
            <div>
                {selectedQuestions.map((selectedQuestion: any, index: any) => (
                    <div
                        key={index}
                        className="flex justify-between items-start mb-7"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">
                                    {selectedQuestion.title}
                                </h3>
                                <span className="font-semibold text-secondary">
                                    {selectedQuestion.difficulty}
                                </span>
                            </div>
                            <p className=" text-gray-600 mt-1">
                                {ellipsis(selectedQuestion.description, 50)}
                            </p>
                            <Link
                                href={''}
                                className="text-sm font-semibold mt-1 text-secondary"
                            >
                                View Full Description
                            </Link>
                        </div>
                        <XCircle
                            className="text-destructive ml-5 cursor-pointer"
                            size={20}
                            onClick={() => {
                                setSelectedQuestions([])
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SelectedProblems
