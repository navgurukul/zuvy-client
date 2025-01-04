'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertOctagon, Timer } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const Assessment = ({
    assessmentShortInfo,
    assessmentOutSourceId,
    submissionId,
    chapterContent
}: {
    assessmentShortInfo: any
    assessmentOutSourceId: any
    submissionId: any
    chapterContent: any
}) => {
    const router = useRouter()
    const testDuration = assessmentShortInfo.timeLimit
    const { viewcourses, moduleID } = useParams()

    const [assessmentEndTime, setAssessmentEndTime] = useState<number | null>(null)
    const [isTimeOver, setIsTimeOver] = useState(false)

    useEffect(() => {
        // Calculate end time based on start time and duration
        const startedAt = assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.startedAt
        if (startedAt) {
            const startTime = new Date(startedAt).getTime()
            const endTime = startTime + testDuration * 1000


            // Check if the time is over
            const interval = setInterval(() => {
                const currentTime = Date.now()
                if (currentTime > endTime) {
                    setIsTimeOver(true)
                } else {
                    setIsTimeOver(false)
                }
            }, 1000)

            return () => clearInterval(interval)
        }
        ;
    }, [assessmentShortInfo, testDuration])

    const handleStartAssessment = () => {
        try {
            const assessmentUrl = `/student/courses/${viewcourses}/modules/${moduleID}/assessment/${assessmentOutSourceId}`

            const startTime = Date.now()
            const endTime = startTime + testDuration * 1000
            localStorage.setItem('endTime', endTime.toString())

            let newWindow: any

            if (typeof window !== 'undefined') {
                newWindow = window?.open(assessmentUrl, '_blank')
            }

            if (newWindow) {
                newWindow.focus()
            } else {
                alert(
                    'Failed to open the new window. Please allow pop-ups for this site.'
                )
            }
            // Reload the browser after 3 seconds
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.error('Failed to start assessment:', error)
        }
    }

    const handleViewResults = () => {
        try {
            const resultsUrl = `/student/courses/${viewcourses}/modules/${moduleID}/assessment/viewresults/${submissionId}`
            router.push(resultsUrl)
        } catch (error) {
            console.error('Failed to view results:', error)
        }
    }

    const hasQuestions =
        assessmentShortInfo?.totalCodingQuestions > 0 ||
        assessmentShortInfo?.totalQuizzes > 0 ||
        assessmentShortInfo?.totalOpenEndedQuestions > 0

    const isAssessmentStarted =
        assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.startedAt

    const isDisabled = !hasQuestions

    const isDeadlineCrossed = new Date(assessmentShortInfo?.deadline) < new Date()


    return (
        <React.Fragment>
            <div className="flex flex-col items-center justify-center px-4 py-8">
                <div className="flex flex-col gap-4 text-left w-full max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {assessmentShortInfo?.ModuleAssessment?.title}
                    </h1>
                    {hasQuestions ? (
                        <div className="flex gap-6">
                            {assessmentShortInfo?.totalCodingQuestions > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {
                                            assessmentShortInfo?.totalCodingQuestions
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Coding Challenges
                                    </p>
                                </div>
                            )}
                            {assessmentShortInfo?.totalQuizzes > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {assessmentShortInfo?.totalQuizzes}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        MCQs
                                    </p>
                                </div>
                            )}
                            {assessmentShortInfo?.totalOpenEndedQuestions >
                                0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-secondary">
                                            {
                                                assessmentShortInfo?.totalOpenEndedQuestions
                                            }
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Open-Ended
                                        </p>
                                    </div>
                                )}
                        </div>
                    ) : null}

                    {!isAssessmentStarted && (
                        <div className="my-2 w-full max-w-2xl mx-auto">
                            {isDisabled && (
                                <p className="mb-2 font-medium">
                                    No Questions Available. Assessment will
                                    appear soon!
                                </p>
                            )}

                            <div>
                                <div className="flex items-center gap-2">
                                    <AlertOctagon
                                        size={16}
                                        className="text-destructive"
                                    />
                                    <p>
                                        Do not change tabs or assessment will
                                        get submitted automatically.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertOctagon
                                        size={16}
                                        className="text-destructive"
                                    />
                                    <p>
                                        Do not close the browser during the
                                        assessment or it will get submitted
                                        automatically.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertOctagon
                                        size={16}
                                        className="text-destructive"
                                    />
                                    <p>
                                        MCQs & Open-ended Questions can be
                                        submitted only once.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {hasQuestions && (
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Timer size={18} className="text-gray-500" />
                            Test Time:{' '}
                            <span className="font-semibold">
                                {Math.floor(
                                    assessmentShortInfo.timeLimit / 3600
                                )}{' '}
                                hours{' '}
                                {Math.floor(
                                    (assessmentShortInfo.timeLimit % 3600) / 60
                                )}{' '}
                                minutes
                            </span>
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center">
                {isAssessmentStarted ? (
                    <>
                        <Button onClick={handleViewResults} disabled={chapterContent.status === 'Pending'}>
                            View Results
                        </Button>
                        {isTimeOver && chapterContent.status === 'Pending' && (
                            <p className="text-red-500 mt-4">
                                You have not submitted the assessment properly.
                            </p>
                        )}
                    </>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Button
                                        onClick={handleStartAssessment}
                                        disabled={isDisabled || isDeadlineCrossed}
                                    >
                                        Start Assessment
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {isDisabled && (
                                <TooltipContent>
                                    No Questions Available. Assessment will
                                    appear soon!
                                </TooltipContent>
                            )}
                            {isDeadlineCrossed && (
                                <TooltipContent>
                                    You have missed the deadline to start the assessment
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                )}

                {isDeadlineCrossed && (
                    <h3 className="text-red-500 text-md mt-4">
                        Deadline Crossed
                    </h3>
                )}

            </div>
        </React.Fragment>
    )
}

export default Assessment
