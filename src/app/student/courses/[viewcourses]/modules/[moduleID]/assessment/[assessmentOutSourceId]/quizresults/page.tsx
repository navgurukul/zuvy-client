'use client'

import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { ChevronLeft, Check, X, Circle } from 'lucide-react' // Import Circle icon
import { useRouter } from 'next/navigation'

// Define the type for the quiz result
interface QuizOption {
    [key: string]: string
}

interface Quiz {
    id: number
    question: string
    options: QuizOption
    difficulty: string
    correctOption: number
    marks: number | null
}

interface SubmissionData {
    id: number
    userId: number
    chosenOption: number
    questionId: number
    attemptCount: number
}

interface QuizResult {
    id: number
    quiz_id: number
    assessmentOutsourseId: number
    bootcampId: number
    chapterId: number
    createdAt: string
    submissionsData: SubmissionData[]
    Quiz: Quiz
}

const QuizResults = ({
    params,
}: {
    params: { assessmentOutSourceId: string }
}) => {
    const [quizResults, setQuizResults] = useState<QuizResult[]>([])

    const router = useRouter()

    async function getQuizResults() {
        try {
            const response = await api.get(
                `Content/assessmentDetailsOfQuiz/${params.assessmentOutSourceId}`
            )
            setQuizResults(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getQuizResults()
    }, [params.assessmentOutSourceId])

    if (!quizResults?.length) {
        return (
            <div>
                <div onClick={() => router.back()} className="cursor-pointer flex justify-start">
                    <ChevronLeft width={24} />Go Back
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
                {quizResults.map((result) => (
                    <div
                        key={result.id}
                        className="mb-10 p-6 bg-white rounded-xl w-full max-w-lg mx-auto"
                    >
                        <div className="mb-4 font-bold text-xl">
                            {result.Quiz.question}
                        </div>
                        <div className="space-y-4">
                            {Object.entries(result.Quiz.options).map(
                                ([key, value]) => {
                                    const isCorrect =
                                        key ===
                                        result.Quiz.correctOption.toString()
                                    const isChosen =
                                        key ===
                                        result?.submissionsData[0]?.chosenOption?.toString()

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
                                    const icon = isChosen
                                        ? isCorrect
                                            ? <Check className="text-green-500" />
                                            : <X className="text-red-500" />
                                        : <Circle className="text-gray-400" />

                                    return (
                                        <div
                                            key={key}
                                            className={`p-4 rounded border ${bgColor} ${borderColor} ${textColor} flex items-center justify-between`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {icon}
                                                <span>{value}</span>
                                            </div>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                        <div className="mt-2 text-sm text-green-600 font-bold">
                            {/* if chosen incorrect answer show correct */}
                            {result.Quiz.correctOption !==
                            result?.submissionsData[0]?.chosenOption && (
                                `Correct Answer: ${Object.values(
                                    result.Quiz.options
                                )[result.Quiz.correctOption - 1]}`
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    )
}

export default QuizResults
