'use client'

import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { ChevronLeft, Dot } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubmissionData {
    id: number
    userId: number
    answer: string
    questionId: number
    submitAt: string
    assessmentSubmissionId: number
}

interface OpenEndedQuestion {
    id: number
    question: string
    difficulty: string
}

interface OpenEndedResult {
    id: number
    openEndedQuestionId: number
    assessmentOutsourseId: number
    bootcampId: number
    moduleId: number
    chapterId: number
    createdAt: string
    submissionsData: SubmissionData[]
    OpenEndedQuestion: OpenEndedQuestion
}

const OpenEndedResults = ({
    params,
}: {
    params: { assessmentOutSourceId: string }
}) => {
    const [openEndedResults, setOpenEndedResults] = useState<OpenEndedResult[]>(
        []
    )
    const router = useRouter()

    async function getOpenEndedResults() {
        try {
            const response = await api.get(
                `Content/assessmentDetailsOfOpenEnded/${params.assessmentOutSourceId}`
            )
            setOpenEndedResults(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getOpenEndedResults()
    }, [params.assessmentOutSourceId])

    if (!openEndedResults.length) {
        return <div>No Open-Ended Questions For This Assessment</div>
    }

    const getEvaluation = (answer: string, question: OpenEndedQuestion) => {
        // Logic to determine if the answer is correct, incorrect, or partially correct
        // This is a placeholder; replace with actual logic
        const correctAnswer = 'correct answer'
        if (answer?.trim().toLowerCase() === correctAnswer) {
            return { text: 'Right', color: 'text-green-500' }
        } else if (answer?.trim().toLowerCase() === 'partially correct') {
            return { text: 'Partially Correct', color: 'text-yellow-500' }
        } else {
            return { text: 'Wrong', color: 'text-red-500' }
        }
    }

    return (
        <div className="px-4">
            <div className="flex items-center justify-between gap-2 mb-6">
                <div
                    onClick={() => router.back()}
                    className="flex items-center cursor-pointer"
                >
                    <ChevronLeft strokeWidth={2} size={18} />
                    <h1 className="font-extrabold">Open-Ended Results</h1>
                </div>
            </div>
            <div className="flex flex-col items-center">
                {openEndedResults.map((result) => (
                    <div
                        key={result.id}
                        className="mb-6 w-full max-w-md text-left"
                    >
                        <div className="mb-2 font-bold text-xl">
                            {result.OpenEndedQuestion.question}
                        </div>
                        <div className="p-2">
                            Answer: {result?.submissionsData[0]?.answer || 'No Answer Submitted'} 
                        </div>
                     
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OpenEndedResults
