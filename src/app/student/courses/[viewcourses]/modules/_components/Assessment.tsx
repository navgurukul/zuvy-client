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
    // const testDuration = 30
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
                window.location.reload();
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
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 text-left">
                    <h1 className="font-bold">{assessmentShortInfo?.ModuleAssessment?.title}</h1>
                    <div className="mainContainer2 flex gap-5 ">
                        <div className="coding ">
                            <h2 className="font-bold">
                                {assessmentShortInfo?.totalCodingQuestions}
                            </h2>
                            <p>Coding </p>
                        </div>
                        <div className="mcq ">
                            <h2 className="font-bold">
                                {assessmentShortInfo?.totalQuizzes}
                            </h2>
                            <p>Mcqs</p>
                        </div>
                        <div className="open-ended ">
                            <h2 className="font-bold">
                                {assessmentShortInfo?.totalOpenEndedQuestions}
                            </h2>
                            <p>Open-Ended</p>
                        </div>
                    </div>
                    {/* <p className="description">
                        {assessmentShortInfo?.ModuleAssessment?.description}
                    </p> */}
                    <p className="deadline flex items-center gap-2">
                        <Clock size={18} />
                        {assessmentShortInfo.deadline
                            ? `Deadline: ${assessmentShortInfo.deadline}`
                            : 'Deadline: No Deadline For This Assessment'}
                    </p>
                    <p className="testTime flex items-center gap-2">
                        <Timer size={18} />
                        Test Time:{' '}
                        {Math.floor(
                            assessmentShortInfo.timeLimit / 3600
                        )} hours{' '}
                        {Math.floor(
                            (assessmentShortInfo.timeLimit % 3600) / 60
                        )}{' '}
                        minutes
                    </p>
                </div>
            </div>
            {assessmentShortInfo?.submitedOutsourseAssessments?.[0]
                ?.startedAt ? (
                <Button className="mt-5" onClick={handleViewResults}>
                    View Results
                </Button>
            ) : (
                <Button className="mt-5" onClick={handleStartAssessment}>
                    Start Assessment
                </Button>
            )}
        </React.Fragment>
    )
}

export default Assessment
