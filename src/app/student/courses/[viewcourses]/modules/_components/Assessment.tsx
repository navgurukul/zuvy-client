'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertOctagon, Clock, Timer } from 'lucide-react'
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
}: {
    assessmentShortInfo: any
    assessmentOutSourceId: any
    submissionId: any
}) => {
    const router = useRouter()
    const testDuration = assessmentShortInfo.timeLimit
    const { viewcourses, moduleID } = useParams()

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
                                <div className="">
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
                                <div className="">
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
                                <div className="p-4 bg-white rounded-lg shadow-md w-1/3">
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

                {!isAssessmentStarted && (
                    <div className="mt-6 w-full max-w-2xl mx-auto">
                        {isDisabled && (
                            <h2> No Questions Available. Assessment will appear soon!</h2>
                        )}
                        <h2 className="text-xl font-semibold my-5 text-gray-800">Assessment Rules</h2>
                        <div className="flex flex-col gap-2 text-sm">
                            <ol className="list-decimal list-outside pl-4 text-start">
                                <li className='font-bold'>If you change the tab more than 4 times during assessment, your assessment may get submitted automatically.</li>
                                <li className='font-bold'>If you exit full screen mode more than 4 times during assessment, your assessment may get submitted automatically.</li>
                                <li className='font-bold'>Do not close the browser during the assessment as you will not be able to resume the assessment once you close the tab or browser.</li>
                                <li className='font-bold'>MCQs & Open-ended Questions can be submitted only once.</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center">
                {isAssessmentStarted ? (
                    <Button onClick={handleViewResults}>View Results</Button>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Button
                                        onClick={handleStartAssessment}
                                        disabled={isDisabled}
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
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </React.Fragment>
    )
}

export default Assessment
