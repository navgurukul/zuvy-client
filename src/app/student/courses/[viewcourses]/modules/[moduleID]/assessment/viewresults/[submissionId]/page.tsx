'use client'

import { toast } from '@/components/ui/use-toast'
import { cn, difficultyColor } from '@/lib/utils'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ViewAssessmentResults = ({ params }: { params: any }) => {
    // States and variables:
    const [viewResultsData, setViewResultsData] = useState<any>()
    const [assessmentOutsourseId, setAssessmentOutsourseId] = useState<any>()
    const [showErrorMessage, setShowErrorMessage] = useState<any>()
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const router = useRouter()

    // State for dynamically setting the questionId
    const [questionId, setQuestionId] = useState<number | null>(null)
    const [timeTaken, setTimeTaken] = useState<string | null>(null)

    // Functions:
    async function getResults() {
        try {
            const res = await api.get(
                `tracking/assessment/submissionId=${params.submissionId}`
            )

            // Parse the timestamps into Date objects
            const startedAt = new Date(res?.data?.startedAt)
            const submitedAt = new Date(res?.data?.submitedAt)

            // Calculate the time difference in milliseconds
            const timeTakenMs = submitedAt.getTime() - startedAt.getTime()

            // Convert the time difference to seconds
            const timeTakenSeconds = timeTakenMs / 1000

            // Convert the time difference to a more readable format
            const timeTaken = {
                seconds: Math.floor(timeTakenSeconds % 60),
                minutes: Math.floor((timeTakenSeconds / 60) % 60),
                hours: Math.floor((timeTakenSeconds / 3600) % 24),
            }

            // Create the output string based on the hours
            let output
            if (timeTaken.hours > 0) {
                output = `Time taken: ${timeTaken.hours} hours, ${timeTaken.minutes} minutes, and ${timeTaken.seconds} seconds.`
            } else {
                output = `Time taken: ${timeTaken.minutes} minutes and ${timeTaken.seconds} seconds.`
            }

            // Set the time taken and other state
            setTimeTaken(output)
            setViewResultsData(res.data)
            setAssessmentOutsourseId(res.data.assessmentOutsourseId)
        } catch (e: any) {
            setShowErrorMessage(e?.response?.data?.message)
        }
    }

    function viewQuizSubmission() {
        router.push(
            `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${assessmentOutsourseId}/quizresults`
        )
    }

    function viewOpenEndedSubmission() {
        router.push(
            `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${assessmentOutsourseId}/openendedresults`
        )
    }

    function viewCodingSubmission(codingOutSourceId: any, questionId: any) {
        if (codingOutSourceId) {
            router.push(
                `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/codingresults/${codingOutSourceId}/show/${params.submissionId}/question/${questionId}`
            )
        } else {
            toast({
                title: 'Error',
                description: 'No Coding Submission Found',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }

    // useEffects:
    useEffect(() => {
        getResults()
    }, [params.submissionId])

    if (!viewResultsData) {
        return (
            <div>
                <div
                    onClick={() => router.back()}
                    className="cursor-pointer flex justify-start"
                >
                    <ChevronLeft width={24} /> Back
                </div>
                {showErrorMessage}
            </div>
        )
    }

    return (
        <React.Fragment>
            <div
                onClick={() => router.back()}
                className="cursor-pointer flex justify-start"
            >
                <ChevronLeft width={24} />
                Back
            </div>
            <div className="headings mx-auto my-5 max-w-2xl">
                <div>{timeTaken}HELLOOO</div>
            </div>

            {/* Render Coding Challenges if they exist */}
            {viewResultsData?.codingQuestionCount > 0 && (
                <>
                    <div className="headings mx-auto my-5 max-w-2xl">
                        {viewResultsData.PracticeCode.length > 0 ? (
                            <h1 className="text-start text-xl">
                                Coding Challenges
                            </h1>
                        ) : (
                            <h1 className="text-center text-xl">
                                No Coding Submissions Found
                            </h1>
                        )}
                    </div>
                    {viewResultsData.PracticeCode.map((codingQuestion: any) => (
                        <div
                            key={codingQuestion.id}
                            className={`container mx-auto rounded-xl shadow-lg overflow-hidden max-w-2xl min-h-52 mt-4 py-5`}
                        >
                            <div className="flex justify-between">
                                <div className="font-bold text-xl my-2">
                                    {codingQuestion.questionDetail.title}
                                </div>
                                <div
                                    className={cn(
                                        `font-semibold text-secondary my-2`,
                                        difficultyColor(
                                            codingQuestion.questionDetail
                                                .difficulty
                                        )
                                    )}
                                >
                                    {codingQuestion.questionDetail.difficulty}
                                </div>
                            </div>
                            <div className="text-xl mt-2 text-start">
                                Description:{' '}
                                {codingQuestion.questionDetail.description}
                            </div>
                            <div className={`text-xl mt-2 text-start `}>
                                Status:{' '}
                                <span
                                    className={`ml-2 ${codingQuestion.status === 'Accepted' ? 'text-green-400' : 'text-destructive'}`}
                                >
                                    {codingQuestion.status}
                                </span>
                            </div>
                            <div
                                onClick={() =>
                                    viewCodingSubmission(
                                        codingQuestion.codingOutsourseId,
                                        codingQuestion.questionId
                                    )
                                }
                                className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                            >
                                View Submission C <ChevronRight />
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* Render Quiz Questions if they exist */}
            {viewResultsData?.mcqQuestionCount > 0 && (
                <>
                    <div className="headings mx-auto my-10 max-w-2xl">
                        <h1 className="text-start text-xl">MCQs</h1>
                    </div>
                    <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                        <div className="flex justify-between">
                            <div className="font-bold text-xl mb-2">
                                Quiz Questions
                            </div>
                            <div className="p-2 text-base rounded-full bg-[#FFC374]">
                                {viewResultsData.mcqQuestionCount} questions
                            </div>
                        </div>
                        <div className="text-xl mt-2 text-start">
                            Attempted {viewResultsData?.attemptedMCQQuestions}/
                            {viewResultsData?.mcqQuestionCount}
                        </div>
                        <div
                            onClick={viewQuizSubmission}
                            className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                        >
                            View Submission B <ChevronRight />
                        </div>
                    </div>
                </>
            )}

            {/* Render Open-Ended Questions if they exist */}
            {viewResultsData?.openEndedQuestionCount > 0 && (
                <>
                    <div className="headings mx-auto my-10 max-w-2xl">
                        <h1 className="text-start text-xl">
                            Open-Ended Questions
                        </h1>
                    </div>
                    <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                        <div className="flex justify-between">
                            <div className="font-bold text-xl mb-2">
                                Open-Ended Questions
                            </div>
                            <div className="p-2 text-base rounded-full bg-[#FFC374]">
                                {viewResultsData.openEndedQuestionCount}{' '}
                                questions
                            </div>
                        </div>
                        <div className="text-xl mt-2 text-start">
                            Attempted{' '}
                            {viewResultsData?.attemptedOpenEndedQuestions}/
                            {viewResultsData?.openEndedQuestionCount}
                        </div>
                        <div
                            onClick={viewOpenEndedSubmission}
                            className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                        >
                            View Submission A <ChevronRight />
                        </div>
                    </div>
                </>
            )}
        </React.Fragment>
    )
}

export default ViewAssessmentResults
