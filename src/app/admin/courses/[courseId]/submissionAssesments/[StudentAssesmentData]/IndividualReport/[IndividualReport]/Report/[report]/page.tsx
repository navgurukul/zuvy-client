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
import { Check, CheckCircle, User, X, XCircle } from 'lucide-react'

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
    codingOutsourseId: number
}

const Page = ({ params }: { params: any }) => {
    const [bootcampData, setBootcampData] = useState<any>()
    const [assesmentData, setAssesmentData] = useState<any>()
    const [codingdata, setCodingData] = useState<CodingQuestion[]>([])
    const [username, setUsername] = useState<string>('')
    const [moduleId, setmoduleId] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [totalQuestions, setTotalQuestion] = useState({
        totalCodingQuestion: 0,
        totalMcqQuestion: 0,
        totalOpenEnded: 0,
    })

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
            crumb: `Assesment for Module ${moduleId}`,
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.StudentAssesmentData}`,
            isLast: false,
        },
        {
            crumb: username,

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

    const getIndividualCodingDataHandler = useCallback(async () => {
        try {
            await api
                .get(
                    `/tracking/assessment/submissionId=${params.report}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    setCodingData(res?.data?.PracticeCode)
                    setUsername(res?.data?.user?.name)
                    setmoduleId(
                        res?.data?.submitedOutsourseAssessment?.moduleId
                    )
                    setAssesmentData(res?.data)
                    setTotalQuestion({
                        totalCodingQuestion: res?.data?.codingQuestionCount,
                        totalMcqQuestion: res?.data?.mcqQuestionCount,
                        totalOpenEnded: res?.data?.openEndedQuestionCount,
                    })
                })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error in fetching the data',
            })
        } finally {
            // setLoading(false)
        }
    }, [params])

    useEffect(() => {
        getBootcampHandler()
        getIndividualCodingDataHandler()
    }, [getBootcampHandler, getIndividualCodingDataHandler, params])

    const timestamp = assesmentData?.submitedAt
    const date = new Date(timestamp)
    const options2: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const formattedDate = date.toLocaleDateString('en-US', options2)
    console.log(codingdata)

    return (
        <>
            {codingdata ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col relative items-start">
                    <div className="flex items-center">
                        <h1 className="text-start flex ml-6 font-bold text-xl ">
                            {codingdata && (
                                <div className="p-4 rounded-lg bg-white shadow-lg backdrop-blur-lg transition-transform transform  hover:shadow-xl">
                                    <div className="flex flex-col gap-y-4">
                                        <div className="flex gap-x-2 items-center">
                                            <User size={15} />
                                            <span className="font-semibold text-[15px] text-gray-700 dark:text-gray-300">
                                                Individual Report:
                                            </span>
                                            <span className="font-semibold text-[15px] text-gray-900 dark:text-white">
                                                {username}
                                            </span>
                                        </div>
                                        <div className="flex gap-x-4 items-center">
                                            <span className="font-semibold text-[15px] text-gray-700 dark:text-gray-300">
                                                Status:
                                            </span>
                                            <span className="flex flex-row items-center gap-x-2 backdrop-blur-sm px-2 py-1 rounded-md transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                                {assesmentData?.isPassed ? (
                                                    <>
                                                        <CheckCircle
                                                            className="text-green-500"
                                                            size={16}
                                                        />
                                                        <h1 className="text-secondary font-semibold text-[15px]">
                                                            Passed
                                                        </h1>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle
                                                            className="text-red-500"
                                                            size={16}
                                                        />
                                                        <h1 className="text-red-500 font-semibold text-[15px]">
                                                            Failed
                                                        </h1>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex gap-x-4 items-center">
                                            <span className="font-semibold text-[15px] text-gray-700 dark:text-gray-300">
                                                Submitted At:
                                            </span>
                                            <span className="font-semibold text-[15px] text-gray-900 dark:text-white">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </h1>
                    </div>
                </div>

                <h1 className="text-start font-bold text-xl mt-4">Overview</h1>
                {codingdata ? (
                    <OverviewComponent
                        totalCodingChallenges={
                            assesmentData?.attemptedCodingQuestions
                        }
                        correctedCodingChallenges={9}
                        correctedMcqs={9}
                        totalCorrectedMcqs={
                            assesmentData?.attemptedMCQQuestions
                        }
                        openEndedCorrect={1}
                        totalOpenEnded={
                            assesmentData?.attemptedOpenEndedQuestions
                        }
                        score={assesmentData?.percentage}
                        totalScore={100}
                        copyPaste={assesmentData?.copyPaste}
                        tabchanges={assesmentData?.tabChange}
                        embeddedSearch={assesmentData?.embeddedGoogleSearch}
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
                    {codingdata ? (
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
                                                data.codingOutsourseId
                                            }
                                        />
                                    ))
                                ) : (
                                    <p className="text-center py-20 font-semibold w-full h-full shadow-lg backdrop-blur-lg transition-transform transform  hover:shadow-xl ">
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
                                {assesmentData?.attemptedMCQQuestions >= 1 ? (
                                    <IndividualStudentAssesment
                                        data={[]}
                                        params={params}
                                        type={'quizSubmission'}
                                    />
                                ) : (
                                    <p className="text-center py-20 font-semibold  h-2/3 w-4/5 shadow-lg backdrop-blur-lg transition-transform transform  hover:shadow-xl ">
                                        This student have not submitted any Quiz
                                        question .
                                    </p>
                                )}
                            </div>
                            <div className="w-full">
                                <h1 className="text-left font-semibold ">
                                    {' '}
                                    Open Ended Questions
                                </h1>
                                {assesmentData?.attemptedOpenEndedQuestions >=
                                1 ? (
                                    <IndividualStudentAssesment
                                        data={[]}
                                        params={params}
                                        type={'openEndedSubmission'}
                                    />
                                ) : (
                                    <p className="text-center py-20 font-semibold  h-2/3 w-4/5 shadow-lg backdrop-blur-lg transition-transform transform  hover:shadow-xl ">
                                        This student have not submitted any Open
                                        Ended Question question .
                                    </p>
                                )}
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
