'use client'
import React, { useCallback, useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/utils/axios.config'
import { difficultyColor } from '@/lib/utils'
import { getProctoringDataStore, getUser } from '@/store/store'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import type { PageSubmissionData } from './ViewSolutionPageType'
import { useParams } from 'next/navigation'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import useStudentAssessments from '@/hooks/useStudentAssessments'
import useOpenEndedSolutionForStudents from '@/hooks/useOpenEndedSolutionForStudents'
import type { OpenEndedSubmissionData } from '@/hooks/hookType'
import { toast } from '@/components/ui/use-toast'

export type paramsType = {
    courseId: string
    assessment_Id: string
    IndividualReport: string
    report: string
    CodingSolution: number
}

const Page = ({ params }: { params: paramsType }) => {
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    const { fetchStudentAssessments } = useStudentAssessments()
    const { data: openEndedQuestionDetails, error: openEndedError } = useOpenEndedSolutionForStudents(params?.report)
    const { courseData: bootcampData } = useCourseExistenceCheck(params.courseId)
    const [assesmentData, setAssesmentData] = useState<PageSubmissionData | null>(null)
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId;

    const crumbs = [
        {
            crumb: 'My Courses',
            href: `/${userRole}/organizations/${orgId}/courses`,
            isLast: false,
        },
        {
            crumb: bootcampData?.name,

            href: `/${userRole}/organizations/${orgId}/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: 'Submission - Assesments',
            href: `/${userRole}/organizations/${orgId}/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assesmentData?.title,
            href: `/${userRole}/organizations/${orgId}/courses/${params.courseId}/submissionAssesments/${params.assessment_Id}`,
            isLast: false,
        },
        {
            crumb: proctoringData?.user?.name,
            href: `/${userRole}/organizations/${orgId}/courses/${params.courseId}/submissionAssesments/${params.assessment_Id}/IndividualReport/${params.IndividualReport}/Report/${params.report}`,
            isLast: false,
        },
        {
            crumb: `Open Ended Report Report`,
            isLast: true,
        },
    ]
    const getStudentAssesmentDataHandler = useCallback(async () => {
        try {
            const { moduleAssessment } = await fetchStudentAssessments({
                assessmentId: params.assessment_Id,
            })
            setAssesmentData(moduleAssessment)
        } catch (error) {
            console.error('Error fetching student assessment data:', error)
        }
    }, [params.assessment_Id, fetchStudentAssessments])

    useEffect(() => {
        fetchProctoringData(params.report, params.IndividualReport)
        getStudentAssesmentDataHandler()
    }, [
        fetchProctoringData,
        params,
        getStudentAssesmentDataHandler,
    ])

    useEffect(() => {
        if (openEndedError) {
            toast.error({
                title: 'Error',
                description: openEndedError,
            })
        }
    }, [openEndedError])

    const getquestionAnswerData = (openEndedQuestionDetails ?? []).map((data: OpenEndedSubmissionData) => {
        const question = data?.OpenEndedQuestion?.question
        const answer = data?.answer
        const difficulty = data?.OpenEndedQuestion?.difficulty

        return {
            question,
            answer,
            difficulty,
        }
    })

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="flex flex-col gap-5">
                <div className="flex items-center gap-x-3">
                    <div className="flex flex-col gap-x-2">
                        <div className="flex gap-x-4 my-4 ">
                            <Avatar>
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <h1 className="text-left font-semibold text-lg">
                                {proctoringData?.user?.name} - Open Ended Questions Report
                            </h1>
                        </div>
                    </div>
                </div>
                <h2 className="text-left font-semibold text-[1.5rem]">
                    Overview
                </h2>

                <div className="my-5 flex flex-col gap-y-3 text-left ">
                    <h1 className="text-left text-[1.2rem] font-semibold">Student Answers</h1>
                    {getquestionAnswerData.map(
                        ({ question, answer, difficulty }: { question: string; answer: string; difficulty: string }, index: number) => (
                            <div key={index}>
                                <div className="flex gap-x-3">
                                    <h3 className="text-left font-semibold capitalize text-[1rem]">
                                        {index + 1}. {question}
                                    </h3>
                                    <h3
                                        className={`text-left font-semibold capitalize text-[1rem] ${difficultyColor(
                                            difficulty
                                        )}`}
                                    >
                                        {difficulty}
                                    </h3>
                                </div>
                                <div className="flex gap-x-3">
                                    <h3 className=" text-[1rem]">Ans:</h3>
                                    <h3 className=" text-[1rem] mb-5">{answer}</h3>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
