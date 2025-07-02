import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import CodingChallengeResult from './CodingChallengeResult'

interface CodingQuestion {
    id: number
    title: string
    description: string
    difficulty: string
    tagName?: string
    status: string
}

interface CodingChallengeContentProps {
    chapterDetails: {
        id: number
        title: string
        description: string | null
        status: string
    }
    onChapterComplete: () => void
    fetchChapters?: () => void
}

const CodingChallengeContent: React.FC<CodingChallengeContentProps> = ({
    chapterDetails,
    onChapterComplete,
}) => {
    const router = useRouter()
    const params = useParams()
    const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([])
    const [submissionResults, setSubmissionResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCompleted, setIsCompleted] = useState(
        chapterDetails.status === 'Completed'
    )

    console.log('chapterDetails', chapterDetails)

    const fetchCodingQuestions = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get(
                `/tracking/getQuizAndAssignmentWithStatus?chapterId=${chapterDetails.id}`
            )
            const questions = res.data.data?.codingProblem || []
            setCodingQuestions(questions)

            if (chapterDetails.status === 'Completed' && questions.length > 0) {
                const resultsPromises = questions.map((q: CodingQuestion) =>
                    api
                        .get(`/codingPlatform/submissions/questionId=${q.id}`)
                        .catch((err) => {
                            console.error(
                                `Failed to fetch submission for question ${q.id}`,
                                err
                            )
                            return null
                        })
                )
                const resultsResponses = await Promise.all(resultsPromises)
                const successfulResults = resultsResponses
                    .filter((res) => res && res.data.isSuccess)
                    .map((res) => ({
                        questionId: res.data.data.questionId,
                        result: res.data.data,
                    }))
                setSubmissionResults(successfulResults)
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch coding questions.',
                variant: 'destructive',
            })
            setCodingQuestions([])
        } finally {
            setLoading(false)
        }
    }, [chapterDetails.id, chapterDetails.status])

    useEffect(() => {
        fetchCodingQuestions()
    }, [fetchCodingQuestions])

    useEffect(() => {
        setIsCompleted(chapterDetails.status === 'Completed')
    }, [chapterDetails.status])

    const handleSolveChallenge = (question: CodingQuestion) => {
        router.push(
            `/student/course/${params.courseId}/codingChallenge?questionId=${question.id}`
        )
    }

    const CodingQuestionCard = ({ question }: { question: CodingQuestion }) => (
        <div className="max-w-4xl mx-auto px-16 py-10 bg-white">
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-[24px] font-bold text-[#1A1A1A]">
                    {question.title}
                </h1>
                <span className="text-xs text-[#666] px-2 border border-[#D1D5DB] rounded-full">
                    {question.status === 'Completed'
                        ? 'Completed'
                        : 'Not Attempted'}
                </span>
            </div>

            <div className="flex gap-[10rem] mb-4">
                <div className="text-start">
                    <p className="text-sm text-[#666] mb-1">Difficulty</p>
                    <p className="text-[15px] font-medium text-[#1A1A1A]">
                        {question.difficulty}
                    </p>
                </div>
                <div className="text-start">
                    <p className="text-sm text-[#666] mb-1">Topic</p>
                    <p className="text-[15px] font-medium text-[#1A1A1A]">
                        {question.tagName || 'Arrays'}
                    </p>
                </div>
            </div>

            <p className="text-sm text-[#666] mb-6 max-w-xl text-start">
                {question.description}
            </p>

            <div className="flex justify-center">
                <Button
                    className="bg-[#4169E1] hover:bg-[#4169E1]/90 text-white px-4 py-1 rounded-md text-sm font-medium"
                    onClick={() => handleSolveChallenge(question)}
                >
                    Start Practice
                </Button>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 h-full">
                <Loader2 className="w-10 h-10 text-[#4169E1] animate-spin mb-4" />
                <p className="text-[#666666] text-lg">Loading Challenge...</p>
            </div>
        )
    }

    console.log('isCompleted', isCompleted)

    if (isCompleted) {
        return (
            <CodingChallengeResult
                chapterDetails={chapterDetails}
                submissionResults={submissionResults}
            />
        )
    }

    return (
        <div className="min-h-[70vh] bg-white flex justify-center px-4 py-10">
            <div className="w-full max-w-[800px]">
                {codingQuestions.length > 0 ? (
                    <CodingQuestionCard question={codingQuestions[0]} />
                ) : (
                    <div className="text-center py-16">
                        <p className="text-lg font-semibold text-[#666666]">
                            No Coding Challenges Added Yet
                        </p>
                        <p className="text-sm text-[#666666]">
                            Check back later for new problems from your
                            instructor.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CodingChallengeContent
