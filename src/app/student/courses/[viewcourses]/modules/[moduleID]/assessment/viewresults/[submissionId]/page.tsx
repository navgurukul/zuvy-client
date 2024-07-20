'use client'

import { toast } from '@/components/ui/use-toast'
import { cn, difficultyColor } from '@/lib/utils'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ViewAssessmentResults = ({ params }: { params: any }) => {
    // states and variables:
    const [viewResultsData, setViewResultsData] = useState<any>()
    const [assessmentOutsourseId, setAssessmentOutsourseId] = useState<any>()
    const [showErrorMessage, setShowErrorMessage] = useState<any>()
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const router = useRouter()
    const openEndedScore = viewResultsData?.openEndedSubmission?.openScore || 0
    const totalOpenEndedScore =
        viewResultsData?.openEndedSubmission?.totalOpenEndedScore || 0
    const quizScore = viewResultsData?.quizSubmission?.quizScore || 0
    const totalQuizScore = viewResultsData?.quizSubmission?.totalQuizScore || 0
    const [timeTaken, setTimeTaken] = useState<any>()

    // functions:
    async function getResults() {
        try {
            const res = await api.get(
                `tracking/assessment/submissionId=${params.submissionId}`
            );
    
            // Parse the timestamps into Date objects
            const startedAt = new Date(res?.data?.startedAt);
            const submitedAt = new Date(res?.data?.submitedAt);
    
            // Convert Date objects to timestamps
            const startedAtTime = startedAt.getTime();
            const submitedAtTime = submitedAt.getTime();
    
            // Calculate the time difference in milliseconds
            const timeTakenMs = submitedAtTime - startedAtTime;
    
            // Convert the time difference to seconds
            const timeTakenSeconds = timeTakenMs / 1000;
    
            // Convert the time difference to a more readable format
            const timeTaken = {
                seconds: Math.floor(timeTakenSeconds % 60),
                minutes: Math.floor((timeTakenSeconds / 60) % 60),
                hours: Math.floor((timeTakenSeconds / 3600) % 24)
            };
    
            // Create the output string based on the hours
            let output;
            if (timeTaken.hours > 0) {
                output = `Time taken: ${timeTaken.hours} hours, ${timeTaken.minutes} minutes, and ${timeTaken.seconds} seconds.`;
            } else {
                output = `Time taken: ${timeTaken.minutes} minutes and ${timeTaken.seconds} seconds.`;
            }
    
            // Set the time taken and other state
            setTimeTaken(output);
            setViewResultsData(res.data);
            setAssessmentOutsourseId(res.data.assessmentOutsourseId);
        } catch (e: any) {
            setShowErrorMessage(e?.response?.data?.message);
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

    function viewCodingSubmission(codingOutSourceId: any) {
        if (codingOutSourceId) {

            router.push(
                `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/codingresults/${codingOutSourceId}`
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
        return <div><div onClick={() => router.back()} className='cursor-pointer flex justify-start'><ChevronLeft width={24} /> Back</div>{showErrorMessage}</div>
    }

    return (
        <React.Fragment>
            <div onClick={() => router.back()} className='cursor-pointer flex justify-start'><ChevronLeft width={24} />Back</div>
            <div className="headings mx-auto my-5 max-w-2xl">
                <div>{timeTaken}</div>
                <h1 className="text-start text-xl">Coding Challenges</h1>
            </div>

            {viewResultsData?.totalCodingQuestions > 0 ? (
                viewResultsData.codingSubmission.map((codingQuestion: any) => {
                    const lastSubmission = codingQuestion.submissions
                        .filter((submission: any) => submission.action === "submit")
                        .pop()

                    return (
                        <div key={codingQuestion.id} className={`container mx-auto rounded-xl shadow-lg overflow-hidden max-w-2xl min-h-52 mt-4 py-5`}>
                            <div className="flex justify-between">
                                <div className="font-bold text-xl my-2">
                                    {codingQuestion.title}
                                </div>
                                <div className={cn(
                                    `font-semibold text-secondary my-2`,
                                    difficultyColor(codingQuestion.difficulty)
                                )}>
                                    {codingQuestion.difficulty}
                                </div>
                            </div>
                            <div className="text-xl mt-2 text-start">
                                Description: {codingQuestion.description}
                            </div>
                            <div className={`text-xl mt-2 text-start `}>
                                Status: <span className={`ml-2 ${lastSubmission?.status === 'Accepted' ? 'text-green-400' : 'text-destructive'}`}>{lastSubmission?.status}</span>
                            </div>
                            <div onClick={() => viewCodingSubmission(lastSubmission?.codingOutsourseId)} className="cursor-pointer mt-4 flex justify-end text-secondary font-bold">
                                View Submission <ChevronRight />
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="container mx-auto rounded-xl shadow-lg overflow-hidden max-w-2xl min-h-24 mt-4 py-5 text-center">
                    No Coding Questions
                </div>
            )}


            <div className="headings mx-auto my-10 max-w-2xl">
                <h1 className="text-start text-xl">MCQs</h1>
            </div>
            <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                <div className="flex justify-between">
                    <div className="font-bold text-xl mb-2">Quiz Questions</div>
                    <div className="p-2 text-base rounded-full bg-[#FFC374]">
                        {viewResultsData.totalQuizzes} questions
                    </div>
                </div>
                <div className="text-xl mt-2 text-start">
                    Attempted {quizScore}/{totalQuizScore}
                </div>
                <div
                    onClick={viewQuizSubmission}
                    className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                >
                    View Submission <ChevronRight />
                </div>
            </div>
            <div className="headings mx-auto my-10 max-w-2xl">
                <h1 className="text-start text-xl">Open-Ended Questions</h1>
            </div>
            <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                <div className="flex justify-between">
                    <div className="font-bold text-xl mb-2">
                        Open-Ended Questions
                    </div>
                    <div className="p-2 text-base rounded-full bg-[#FFC374]">
                        {viewResultsData.totalOpenEndedQuestions} questions
                    </div>
                </div>
                <div className="text-xl mt-2 text-start">
                    Attempted {openEndedScore}/{totalOpenEndedScore}
                </div>
                <div
                    onClick={viewOpenEndedSubmission}
                    className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                >
                    View Submission <ChevronRight />
                </div>
            </div>
        </React.Fragment>
    )
}

export default ViewAssessmentResults
