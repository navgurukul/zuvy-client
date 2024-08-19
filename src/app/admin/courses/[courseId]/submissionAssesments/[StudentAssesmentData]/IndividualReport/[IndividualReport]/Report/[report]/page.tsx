'use client'
import React, { useCallback, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// import IndividualStudentAssesment from '../../../../_components/individualStudentAssesment'
import { api } from '@/utils/axios.config'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { object } from 'zod'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import OverviewComponent from '@/app/admin/courses/[courseId]/_components/OverviewComponent'
import IndividualStudentAssesment from '@/app/admin/courses/[courseId]/_components/individualStudentAssesment'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { getProctoringDataStore } from '@/store/store'

type User = {
    name: string
    email: string
}

type OpenEndedQuestion = {
    id: number
    question: string
    difficulty: string
    tagId: number
    usage: number
}

type SubmissionData = {
    id: number
    openEndedQuestionId?: number
    assessmentOutsourseId?: number
    bootcampId?: number
    moduleId?: number
    chapterId?: number
    createdAt?: string
    OpenEndedQuestion?: OpenEndedQuestion
}

type OpenEndedSubmission = {
    id: number
    answer: string
    questionId: number
    feedback: string | null
    marks: number
    submissionData: SubmissionData
}

type QuizSubmission = {
    id: number
    chosenOption: number
    questionId: number | null
    attemptCount: number
    submissionData: null
}

type CodingSubmission = {}

type StudentAssessment = {
    id: number
    userId: number
    marks: number | null
    startedAt: string
    submitedAt: string
    tabChange: number
    copyPaste: string
    embeddedGoogleSearch: number
    user: User
    openEndedSubmission: OpenEndedSubmission[]
    quizSubmission: QuizSubmission[]
    PracticeCode: any
    totalQuizzes: number
    totalOpenEndedQuestions: number
    totalCodingQuestions: number
}
type newDataType =
    | {
          openEndedSubmission: OpenEndedSubmission[]
          quizSubmission: QuizSubmission[]
          codingSubmission: CodingSubmission[]
      }
    | any

interface Example {
    input: string[]
    output: string[]
}

interface TestCase {
    input: string[]
    output: string[]
}

interface Submission {
    id: number
    status: string
    action: string
    createdAt: string
    codingOutsourseId: number
}

interface CodingQuestion {
    questionId: number
    id: number
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    inputBase64: string | null
    examples: Example[]
    testCases: TestCase[]
    expectedOutput: string[]
    solution: string
    createdAt: string | null
    updatedAt: string | null
    usage: number
    submissions: Submission[]
}

const Page = ({ params }: { params: any }) => {
    const [individualAssesmentData, setIndividualAssesmentData] =
        useState<StudentAssessment>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [assesmentData, setAssesmentData] = useState<any>()
    const [codingdata, setCodingData] = useState<CodingQuestion[]>([])
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
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
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.StudentAssesmentData}`,
            isLast: false,
        },
        {
            crumb: individualAssesmentData && individualAssesmentData.user.name,

            href: '',
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
    const getIndividualStudentAssesmentDataHandler = useCallback(async () => {
        await api
            .get(
                `/admin/assessment/submission/user_id${params.IndividualReport}?submission_id=${params.report}`
            )
            .then((res) => {
                setIndividualAssesmentData(res.data)
            })
    }, [params.IndividualReport, params.report])

    const getIndividualCodingDataHandler = useCallback(async () => {
        try {
            await api
                .get(
                    `/tracking/assessment/submissionId=${params.report}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    setCodingData(res.data.codingSubmission)
                })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error in fetching the data',
            })
        } finally {
            setLoading(false)
        }
    }, [params])

    const getStudentAssesmentDataHandler = useCallback(async () => {
        await api
            .get(
                `/admin/assessment/students/assessment_id${params.StudentAssesmentData}`
            )
            .then((res) => {
                setAssesmentData(res.data.ModuleAssessment)
            })
    }, [params.StudentAssesmentData])

    useEffect(() => {
        getBootcampHandler()
        getIndividualStudentAssesmentDataHandler()
        getStudentAssesmentDataHandler()
        getIndividualCodingDataHandler()
        fetchProctoringData(params.report, params.IndividualReport)
    }, [
        getIndividualStudentAssesmentDataHandler,
        getBootcampHandler,
        getStudentAssesmentDataHandler,
        getIndividualCodingDataHandler,
        params,
        fetchProctoringData,
    ])

    const newDatafuntion = (data: StudentAssessment | undefined) => {
        if (data) {
            return {
                openEndedSubmission: data.openEndedSubmission,
                quizSubmission: data.quizSubmission,
                codingSubmission: data.PracticeCode,
            }
        }
        return null
    }

    const newData: newDataType = newDatafuntion(individualAssesmentData)

    const quizScore = proctoringData?.quizSubmission?.quizScore || 0
    const totalQuizScore = proctoringData?.quizSubmission?.totalQuizScore || 0
    const needCodingScore = proctoringData?.PracticeCode?.needCodingScore || 0
    const totalCodingScore = proctoringData?.PracticeCode?.totalCodingScore || 0
    const openTotalAttemted =
        proctoringData?.openEndedSubmission?.openTotalAttemted || 0
    return (
        <>
            {individualAssesmentData ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col relative items-start">
                    <div className="flex items-center">
                        {individualAssesmentData ? (
                            <Avatar className="w-5 h-5">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        ) : (
                            <Skeleton className="h-6 w-6 rounded-full" />
                        )}
                        <h1 className="text-start flex ml-6 font-bold text-xl ">
                            {individualAssesmentData ? (
                                individualAssesmentData.user.name
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                    </div>
                                </div>
                            )}

                            {individualAssesmentData ? (
                                '-Individual Report'
                            ) : (
                                <Skeleton className="h-4 w-[100px]" />
                            )}
                        </h1>
                    </div>
                    <h1 className="flex  mb-10 text-gray-600">
                        {individualAssesmentData ? (
                            <p>
                                Submitted on:{' '}
                                {formatDate(individualAssesmentData.submitedAt)}
                            </p>
                        ) : (
                            <Skeleton className="h-4 w-[400px]" />
                        )}
                    </h1>
                </div>

                <h1 className="text-start font-bold text-xl ">Overview</h1>
                {individualAssesmentData ? (
                    <OverviewComponent
                        totalCodingChallenges={totalCodingScore}
                        correctedCodingChallenges={needCodingScore}
                        correctedMcqs={quizScore}
                        totalCorrectedMcqs={totalQuizScore}
                        openEndedCorrect={1}
                        totalOpenEnded={openTotalAttemted}
                        score={50}
                        totalScore={100}
                        copyPaste={individualAssesmentData.copyPaste}
                        tabchanges={individualAssesmentData.tabChange}
                    />
                ) : (
                    <div className="flex gap-x-20  ">
                        <div>
                            <Skeleton className="h-[175px] w-[700px] rounded-xl" />
                            <div className="space-y-2 "></div>
                        </div>
                        <div>
                            <Skeleton className="h-[175px] w-[700px] rounded-xl" />
                            <div className="space-y-2 "></div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1   gap-20 mt-4 md:mt-8 md:grid-cols-2">
                    {newData ? (
                        <>
                            <div className="w-full">
                                <h1 className="text-left font-semibold ">
                                    {' '}
                                    Coding Submission
                                </h1>
                                {codingdata.length > 0 ? (
                                    codingdata.map((data, index) => (
                                        <IndividualStudentAssesment
                                            key={data.id}
                                            data={data}
                                            params={params}
                                            type={'codingSubmission'}
                                            codingOutsourseId={
                                                data.submissions[0]
                                                    ?.codingOutsourseId
                                            }
                                        />
                                    ))
                                ) : (
                                    <p className="text-left py-20 font-semibold">
                                        This student have not submitted any
                                        coding question .
                                    </p>
                                )}
                            </div>
                            <div className="w-full">
                                <h1 className="text-left font-semibold ">
                                    {' '}
                                    Quiz Submission
                                </h1>
                                <IndividualStudentAssesment
                                    data={[]}
                                    params={params}
                                    type={'quizSubmission'}
                                />
                            </div>
                            <div className="w-full">
                                <h1 className="text-left font-semibold ">
                                    {' '}
                                    Open Ended Questions
                                </h1>
                                <IndividualStudentAssesment
                                    data={[]}
                                    params={params}
                                    type={'openEndedSubmission'}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="absolute w-full flex justify-start items-center">
                            <div className="grid grid-cols-1   gap-20 mt-4 md:mt-8 md:grid-cols-2 ">
                                <div>
                                    <Skeleton className="h-[125px] w-[700px] rounded-xl" />
                                    <div className="space-y-2 ">
                                        <Skeleton className="h-4 w-[700px]" />
                                    </div>
                                </div>
                                <div>
                                    <Skeleton className="h-[125px] w-[700px] rounded-xl" />
                                    <div className="space-y-2 ">
                                        <Skeleton className="h-4 w-[700px]" />
                                    </div>
                                </div>
                                <div>
                                    <Skeleton className="h-[125px] w-[700px] rounded-xl" />
                                    <div className="space-y-2 ">
                                        <Skeleton className="h-4 w-[700px]" />
                                    </div>
                                </div>
                                <div>
                                    <Skeleton className="h-[125px] w-[700px] rounded-xl" />
                                    <div className="space-y-2 ">
                                        <Skeleton className="h-4 w-[700px]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
