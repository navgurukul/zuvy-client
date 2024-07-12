'use client'

import { api } from '@/utils/axios.config'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ViewAssessmentResults = ({ params }: { params: any }) => {
    const [viewResultsData, setViewResultsData] = useState<any>()
    const [assessmentOutsourseId, setAssessmentOutsourseId] = useState<any>()
    const router = useRouter()

    async function getResults() {
        try {
            const res = await api.get(
                `tracking/assessment/submissionId=${params.submissionId}`
            )
            setViewResultsData(res.data)
            setAssessmentOutsourseId(res.data.assessmentOutsourseId)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        getResults()
        console.log(params.submissionId)
    }, [params.submissionId])

    if (!viewResultsData) {
        return <div>Loading...</div>
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

    const openEndedScore = viewResultsData.openEndedSubmission?.openScore || 0
    const totalOpenEndedScore =
        viewResultsData.openEndedSubmission?.totalOpenEndedScore || 0
    const quizScore = viewResultsData.quizSubmission?.quizScore || 0
    const totalQuizScore = viewResultsData.quizSubmission?.totalQuizScore || 0

    return (
        <React.Fragment>
            <div className="headings mx-auto my-5 max-w-2xl">
                <h1 className="text-start text-xl">Coding Challenges</h1>
            </div>
            <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                <div className="flex justify-between">
                    <div className="font-bold text-xl mb-2">
                        Coding Questions
                    </div>
                    <div className="p-2 text-base rounded-full bg-[#FFC374]">
                        {viewResultsData.totalCodingQuestions} questions
                    </div>
                </div>
                <div className="text-xl mt-2 text-start">
                    Total Coding Questions{' '}
                    {viewResultsData?.totalCodingQuestions || 0}
                </div>
                <div
                    // onClick={viewQuizSubmission}
                    className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                >
                    View Submission <ChevronRight />
                </div>
            </div>
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
                    Score {quizScore}/{totalQuizScore}
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
                    Score {openEndedScore}/{totalOpenEndedScore}
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
