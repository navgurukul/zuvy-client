'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Code2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { CodingChallengeResultProps } from '@/app/student/_components/chapter-content/componentChapterType'
import { getDifficultyColor } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

// Date formatting function
function formatSubmissionDate(dateString: string) {
    const date = new Date(dateString)
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]

    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12

    return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`
}

// Simplified interfaces for clarity

const CodingChallengeResult: React.FC<CodingChallengeResultProps> = ({
    chapterDetails,
    submissionResults,
}) => {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const chapterId = searchParams.get('chapterId')
    const handleViewSolution = (questionId: number) => {
        router.push(
            `/student/course/${params.courseId}/codingChallengeResult?questionId=${questionId}&moduleId=${params.moduleId}&chapterId=${chapterId}`
        )
    }

    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex flex-row justify-between items-center gap-x-10">
                        <h1 className="text-2xl sm:text-3xl ml-6 font-bold text-left text-foreground mb-1">
                            {chapterDetails.title}
                        </h1>
                        {chapterDetails.description && (
                            <p className="text-muted-foreground text-base mb-1">
                                {chapterDetails.description}
                            </p>
                        )}
                        <Badge
                            variant="outline"
                            className="bg-success text-success-foreground border-success dark:text-gray-700"
                        >
                            Completed
                        </Badge>
                    </div>
                </div>

                {/* List of completed challenges */}
                <div className="space-y-4">
                    {submissionResults && submissionResults.length > 0 ? (
                        submissionResults.map(({ questionId, result }) => (
                            <div key={questionId} className="p-6 mb-6">
                                {/* Header Section */}
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 text-left capitalize pr-4 flex-1 dark:text-white">
                                        {result.questionDetail.title}
                                    </h3>
                                </div>

                                {/* Metadata Section */}
                                <div className="flex flex-col gap-4 mb-4">
                                    <div className="w-full flex items-center gap-2">
                                        <span className="text-left font-sm font-semibold text-muted-foreground">
                                            Difficulty -
                                        </span>
                                        <p
                                            className={`text-sm font-semibold rounded-md p-1 text-left mt-1 ${getDifficultyColor(
                                                result.questionDetail.difficulty
                                            )}`}
                                        >
                                            {result.questionDetail.difficulty}
                                        </p>
                                    </div>
                                    <div className="w-full text-left">
                                        {result.status === 'Accepted' ? (
                                            <div className="bg-success/10 border border-success rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                                    <span className="font-semibold text-success">
                                                        Problem Submitted
                                                    </span>
                                                </div>
                                                <div className="text-sm flex items-center text-success space-x-5">
                                                    <p>
                                                        Test Cases:{' '}
                                                        {result.TestCasesSubmission?.filter(
                                                            (tc) =>
                                                                tc.status ===
                                                                'Accepted'
                                                        ).length || 0}
                                                        /
                                                        {result
                                                            .TestCasesSubmission
                                                            ?.length || 0}{' '}
                                                        passed
                                                    </p>
                                                    <p>
                                                        Submitted on:{' '}
                                                        {formatSubmissionDate(
                                                            result.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                                    <span className="font-semibold text-destructive">
                                                        Wrong Answer
                                                    </span>
                                                </div>
                                                <div className="text-sm flex items-center text-destructive space-x-5">
                                                    <p>
                                                        Test Cases:{' '}
                                                        {result.TestCasesSubmission?.filter(
                                                            (tc) =>
                                                                tc.status ===
                                                                'Accepted'
                                                        ).length || 0}
                                                        /
                                                        {result
                                                            .TestCasesSubmission
                                                            ?.length || 0}{' '}
                                                        passed
                                                    </p>
                                                    <p>
                                                        Submitted on:{' '}
                                                        {formatSubmissionDate(
                                                            result.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <ScrollArea className="mb-6 max-h-[140px] md:max-h-[240px] rounded-md pr-2">
                                    <p className="text-muted-foreground max-h-[140px] md:max-h-[240px] text-left leading-relaxed">
                                        {result.questionDetail.description}
                                    </p>

                                    {/* ScrollBar for vertical scroll */}
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>

                                {/* Action Button */}
                                <div className="flex justify-center">
                                    <Button
                                        className="bg-blue-600 font-semibold hover:bg-blue-700 text-white px-6 py-2 text-sm"
                                        onClick={() =>
                                            handleViewSolution(questionId)
                                        }
                                    >
                                        View Result
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-card-elevated rounded-xl shadow-8dp border border-border p-8 text-center">
                            <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">
                                Submissions Processed
                            </h3>
                            <p className="text-muted-foreground">
                                The results for this chapter are ready, but no
                                specific submission details were found.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CodingChallengeResult
