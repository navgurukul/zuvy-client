'use client'

import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
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
        return <div>No Quiz Questions In This Assessment</div>
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
                        className="mb-10 p-6 bg-white rounded-xl shadow-lg w-full max-w-md mx-auto"
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
                                    const bgColor = isChosen
                                        ? isCorrect
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                        : ''
                                    const borderColor = isChosen
                                        ? 'border-black'
                                        : 'border-gray-300'

                                    return (
                                        <>
                                        <div
                                            key={key}
                                            className={`p-2 rounded border ${bgColor} ${borderColor}`}
                                        >
                                            {value}
                                        </div>
                                        </>
                                    )
                                }
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    )
}

export default QuizResults
