import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronRight, CheckCircle, Play, Award } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { ellipsis } from '@/lib/utils'

interface QuestionCardProps {
    id: number
    title: string
    weightage?: number
    easyCodingMark?: number
    mediumCodingMark?: number
    hardCodingMark?: number
    description: string
    tagId?: number
    // assessmentOutsourseId?: number
    assessmentSubmitId?: number
    codingOutsourseId?: number
    codingQuestions?: boolean
    onSolveChallenge: (id: number) => void
    isQuizSubmitted?: boolean
    isMobile?: boolean
}

export type Tag = {
    id: number
    tagName: string
}

const QuestionCard = ({
    id,
    title,
    weightage,
    easyCodingMark,
    mediumCodingMark,
    hardCodingMark,
    description,
    tagId,
    assessmentSubmitId,
    codingOutsourseId,
    codingQuestions,
    onSolveChallenge,
    isQuizSubmitted,
    isMobile,
}: QuestionCardProps) => {
    // const [tag, setTag] = useState<Tag>()
    const [action, setAction] = useState<string | null>(null)

    // async function getAllTags() {
    //     const response = await api.get('/content/allTags')
    //     if (response) {
    //         const tag = response?.data?.allTags?.find(
    //             (item: any) => item.id == tagId
    //         )
    //         setTag(tag)
    //     }
    // }

    // useEffect(() => {
    //     getAllTags()
    // }, [])

    function codingQuestionMarks(difficulty: string) {
        if (difficulty === 'Easy') {
            return easyCodingMark
        } else if (difficulty === 'Medium') {
            return mediumCodingMark
        } else if (difficulty === 'Hard') {
            return hardCodingMark
        }
    }

    async function getCodingSubmissionsData(
        codingOutsourseId: any,
        assessmentSubmissionId: any,
        questionId: any
    ) {
        try {
            const res = await api.get(
                `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            const action = res.data.data.action
            setAction(action)
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
            return null
        }
    }

    useEffect(() => {
        if (codingOutsourseId && assessmentSubmitId && id) {
            getCodingSubmissionsData(codingOutsourseId, assessmentSubmitId, id)
        }
    }, [codingOutsourseId, assessmentSubmitId, id])

    return (
        <div className="bg-card border border-border rounded-2xl shadow-8dp hover:shadow-16dp transition-all duration-300 overflow-hidden group text-left">
            <div className="p-6 flex flex-col h-full min-h-[140px]">
                {/* Header Section */}
                <div className="flex-1 mb-4">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-foreground capitalize pr-4 flex-1">
                            {isMobile ? ellipsis(title, 30) : title}
                        </h3>
                    </div>
                    
                    {/* Tags and Marks Section */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                        {title !== 'Open-Ended Questions' && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                                <Award className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">
                                    {`${
                                        codingQuestions
                                            ? Math.trunc(
                                                  Number(
                                                      codingQuestionMarks(description)
                                                  )
                                              )
                                            : weightage
                                    } Marks`}
                                </span>
                            </div>
                        )}
                        <span
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-semibold border',
                                difficultyColor(description)
                            )}
                        >
                            {description}
                        </span>
                    </div>
                </div>
                
                {/* Action Button Section - Always at bottom right */}
                <div className="flex justify-end items-center mt-auto">
                    {action === 'submit' ? (
                        <div className="flex items-center space-x-2 text-success bg-success/10 px-4 py-2 rounded-xl border border-success/20">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Already Submitted</span>
                        </div>
                    ) : (
                        <>
                            {isQuizSubmitted ? (
                                <div className="flex items-center space-x-2 text-success bg-success/10 px-4 py-2 rounded-xl border border-success/20">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">Already Submitted</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onSolveChallenge(id)}
                                    className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-4dp hover:shadow-8dp transform hover:scale-105"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>Solve Challenge</span>
                                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuestionCard
