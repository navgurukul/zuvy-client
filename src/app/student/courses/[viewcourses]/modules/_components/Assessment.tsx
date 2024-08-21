'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Clock, Timer } from 'lucide-react'

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

    return (
        <React.Fragment>
            <div className="flex flex-col items-center justify-center px-4 py-8 bg-gray-100 rounded-lg shadow-md">
                <div className="flex flex-col gap-4 text-left w-full max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-800">{assessmentShortInfo?.ModuleAssessment?.title}</h1>
                    <div className="flex gap-6 justify-between text-center">
                        <div className="p-4 bg-white rounded-lg shadow-md w-1/3">
                            <h2 className="text-lg font-semibold text-indigo-600">
                                {assessmentShortInfo?.totalCodingQuestions}
                            </h2>
                            <p className="text-sm text-gray-600">Coding</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md w-1/3">
                            <h2 className="text-lg font-semibold text-indigo-600">
                                {assessmentShortInfo?.totalQuizzes}
                            </h2>
                            <p className="text-sm text-gray-600">MCQs</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md w-1/3">
                            <h2 className="text-lg font-semibold text-indigo-600">
                                {assessmentShortInfo?.totalOpenEndedQuestions}
                            </h2>
                            <p className="text-sm text-gray-600">Open-Ended</p>
                        </div>
                    </div>
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock size={18} className="text-gray-500" />
                        {assessmentShortInfo.deadline
                            ? `Deadline: ${assessmentShortInfo.deadline}`
                            : 'Deadline: No Deadline For This Assessment'}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                        <Timer size={18} className="text-gray-500" />
                        Test Time:{' '}
                        <span className="font-semibold">
                            {Math.floor(assessmentShortInfo.timeLimit / 3600)} hours{' '}
                            {Math.floor((assessmentShortInfo.timeLimit % 3600) / 60)} minutes
                        </span>
                    </p>
                </div>
            </div>
            <div className="mt-6 w-full max-w-2xl mx-auto">
                {!assessmentShortInfo?.submitedOutsourseAssessments?.[0]
                    ?.startedAt && (
                    <>
                        <h2 className="text-xl font-semibold my-5 text-gray-800">Assessment Rules</h2>
                        <div className="flex flex-col gap-2 text-sm text-destructive">
                <ul className="list-disc list-inside pl-4 text-start">
                    <li>If you change the tabs during assessment, your assessment may get submitted automatically.</li>
                    <li>If you exit full screen mode during assessment, your assessment may get submitted automatically.</li>
                    <li>Do not close the browser during the assessment as you wont be able to resume the assessment once you close the tab or browser.</li>
                </ul>
            </div>
                    </>
                )}
            </div>
            <div className="mt-8 flex justify-center">
                {assessmentShortInfo?.submitedOutsourseAssessments?.[0]
                    ?.startedAt ? (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md" onClick={handleViewResults}>
                        View Results
                    </Button>
                ) : (
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md" onClick={handleStartAssessment}>
                        Start Assessment
                    </Button>
                )}
            </div>
        </React.Fragment>
    )
}

export default Assessment
