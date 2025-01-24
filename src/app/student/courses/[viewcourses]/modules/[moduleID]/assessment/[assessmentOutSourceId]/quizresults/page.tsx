'use client'

import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { ChevronLeft, Check, X, Circle } from 'lucide-react' // Import Circle icon
import { useRouter } from 'next/navigation'
import { addClassToCodeTags } from '@/utils/admin'

// Define the type for the quiz result

const QuizResults = ({
    params,
}: {
    params: { assessmentOutSourceId: string }
}) => {
    const [quizResults, setQuizResults] = useState<any>()
    const codeBlockClass =
        'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

    const router = useRouter()

    async function getQuizResults() {
        try {
            const response = await api.get(
                `Content/assessmentDetailsOfQuiz/${params.assessmentOutSourceId}`
            )
            setQuizResults(response?.data?.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getQuizResults()
    }, [params.assessmentOutSourceId])

    if (!quizResults?.mcqs.length) {
        return (
            <div>
                <div
                    onClick={() => router.back()}
                    className="cursor-pointer flex justify-start"
                >
                    <ChevronLeft width={24} />
                    Go Back
                </div>
                No Quiz Questions In This Assessment
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-2 mb-6">
                    <div
                        onClick={() => router.back()}
                        className="flex items-center cursor-pointer"
                    >
                        <ChevronLeft strokeWidth={2} size={18} />
                        <h1 className="font-extrabold">Quiz Results</h1>
                    </div>
                </div>
                {quizResults?.mcqs.map((result: any, index: number) => (
                    <div
                        key={result.quizId}
                        className="mb-10 p-6 bg-white rounded-xl w-full max-w-lg mx-auto"
                    >
                        <div className="flex items-start gap-1 text-left">
                            <span className="font-semibold">{index + 1}.</span>
                            <p
                                className="text-gray-800 mb-4 font-bold text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: addClassToCodeTags(
                                        result.question,
                                        codeBlockClass
                                    ),
                                }}
                            />
                        </div>
                        <div className="space-y-4">
                            {Object.entries(result.options).map(
                                ([key, value]) => {
                                    const isCorrect =
                                        key === result.correctOption.toString()
                                    const isChosen =
                                        key ===
                                        result?.submissionsData?.chosenOption?.toString()

                                    // Only highlight the user's selected answer and replace the circle with correct/incorrect icons
                                    const bgColor = isChosen
                                        ? isCorrect
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                        : ''
                                    const textColor = isCorrect
                                        ? 'text-green-400 font-bold'
                                        : isChosen
                                        ? 'text-red-400'
                                        : 'text-gray-700'
                                    const borderColor = isChosen
                                        ? 'border-black'
                                        : 'border-gray-300'

                                    // Icon to display based on whether the option is correct, incorrect, or unselected
                                    const icon = isChosen ? (
                                        isCorrect ? (
                                            <Check className="text-green-500" />
                                        ) : (
                                            <X className="text-red-500" />
                                        )
                                    ) : (
                                        <Circle className="text-gray-400" />
                                    )

                                    return (
                                        <div
                                            key={key}
                                            className={`p-2 mx-4 rounded border ${bgColor} ${borderColor} ${textColor} flex items-center justify-between`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {icon}
                                                <span>{value as any}</span>
                                            </div>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                        <div className="mt-2 text-sm text-green-600 font-bold">
                            {/* if chosen incorrect answer show correct */}
                            {result.correctOption !==
                                result?.submissionsData?.chosenOption &&
                                `Correct Answer: ${
                                    Object.values(result.options)[
                                        result.correctOption - 1
                                    ]
                                }`}
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    )
}

export default QuizResults
