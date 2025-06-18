'use client'
import React, { useCallback, useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/utils/axios.config'
import { difficultyColor } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { getProctoringDataStore } from '@/store/store'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'

type SubmissionData = {
    id: number
    userId: number
    answer: string
    questionId: number
    submitAt: string
    assessmentSubmissionId: number
}

type OpenEndedQuestion = {
    id: number
    question: string
    difficulty: string
}

type AssessmentData = {
    id: number
    openEndedQuestionId: number
    assessmentOutsourseId: number
    bootcampId: number
    moduleId: number
    chapterId: number
    createdAt: string
    submissionsData: SubmissionData[]
    OpenEndedQuestion: OpenEndedQuestion
}

export type paramsType = {
    courseId: string
    assessment_Id: string
    IndividualReport: string
    report: string
    CodingSolution: number
}

const Page = ({ params }: { params: paramsType }) => {
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    const [openEndedQuestionDetails, setOpenEndedQuestionsDetails] = useState<
        AssessmentData[]
    >([])
    const [individualAssesmentData, setIndividualAssesmentData] =
        useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [assesmentData, setAssesmentData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)

    const crumbs = [
        {
            crumb: 'My Courses',
            href: `/admin/courses`,
            isLast: false,
        },
        {
            crumb: bootcampData?.name,

            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: 'Submission - Assesments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assesmentData?.title,
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.assessment_Id}`,
            isLast: false,
        },
        {
            crumb: proctoringData?.user?.name,
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.assessment_Id}/IndividualReport/${params.IndividualReport}/Report/${params.report}`,
            isLast: false,
        },
        {
            crumb: `Open Ended Report Report`,
            isLast: true,
        },
    ]
    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getStudentAssesmentDataHandler = useCallback(async () => {
        await api
            .get(
                `/admin/assessment/students/assessment_id${params.assessment_Id}`
            )
            .then((res) => {
                setAssesmentData(res.data.ModuleAssessment)
            })
    }, [params.assessment_Id])
    const fetchOpenEndedQuestionsDetails = useCallback(async () => {
        try {
            await api
                .get(
                    `/Content/assessmentDetailsOfOpenEnded/${params.assessment_Id}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    setOpenEndedQuestionsDetails(res.data)
                })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Unable to Fetch Data',
            })
        } finally {
            setLoading(false)
        }
    }, [params.assessment_Id, params.IndividualReport])

    useEffect(() => {
        fetchOpenEndedQuestionsDetails()
        fetchProctoringData(params.report, params.IndividualReport)
        getBootcampHandler()
        getStudentAssesmentDataHandler()
    }, [
        fetchOpenEndedQuestionsDetails,
        fetchProctoringData,
        params,
        getBootcampHandler,
        getStudentAssesmentDataHandler,
    ])

    const getquestionAnswerData = openEndedQuestionDetails.map((data) => {
        const question = data?.OpenEndedQuestion?.question
        const answer = data?.submissionsData[0]?.answer
        const difficulty = data?.OpenEndedQuestion?.difficulty

        return {
            question,
            answer,
            difficulty,
        }
    })
    useEffect(() => {
        if (proctoringData) {
            setLoading(false)
        }
    }, [proctoringData])
    const { tabChange, copyPaste, openEndedSubmission, user } = proctoringData
    const cheatingClass =
        tabChange > 0 && tabChange > 0 ? 'bg-red-600' : 'bg-green-400'

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="flex flex-col gap-5">
                <div className="flex  items-center gap-x-3">
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
                                {user?.name}- Open Ended Questions Report
                            </h1>
                        </div>
                    </div>
                </div>
                <h1 className="text-left font-semibold text-[20px]">
                    Overview
                </h1>
                {/* <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-2/5 ">
                    <div className="flex flex-col w-full justify-between   ">
                        <div
                            className={`flex items-center justify-between p-4 rounded-md ${cheatingClass} `}
                        >
                            <h1 className="text-xl text-start font-semibold text-gray-800  dark:text-white ">
                                Total Score:
                            </h1>
                            <p
                                className={`font-semibold ${
                                    cheatingClass ? 'text-white' : 'text-black'
                                }`}
                            >
                                {openEndedSubmission?.openTotalAttemted}
                            </p>
                        </div>
                        <div className="flex flex-start p-4 gap-x-4">
                            <div>
                                <h1 className="text-start font-bold">
                                    {copyPaste}
                                </h1>
                                <p className="text-gray-500 text-start">
                                    Copy Paste
                                </p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {tabChange}
                                </h1>
                                <p className="text-gray-500">Tab Changes</p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {cheatingClass ? 'Yes' : 'No'}
                                </h1>
                                <p className="text-gray-500">
                                    Cheating Detected
                                </p>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div className="my-5 flex flex-col gap-y-3 text-left ">
                    <h1 className="text-left font-semibold">Student Answers</h1>
                    {getquestionAnswerData.map(
                        ({ question, answer, difficulty }, index) => {
                            return (
                                <div key={answer}>
                                    <div
                                        className="flex gap-x-3
                                "
                                    >
                                        <h1 className="text-left font-semibold capitalize ">
                                            {index + 1}. {question}
                                        </h1>
                                        <h1
                                            className={`text-left font-semibold capitalize ${difficultyColor(
                                                difficulty
                                            )}  `}
                                        >
                                            {difficulty}
                                        </h1>
                                    </div>
                                    <div className="flex gap-x-3">
                                        <h1 className="font-semibold">Ans:</h1>
                                        <h1 className="font-[26px]">
                                            {answer}
                                        </h1>
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
