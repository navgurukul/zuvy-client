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
import { calculateTimeTaken } from '@/utils/admin'

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
    const [proctoringData, setProctoringData] = useState<any>()
    const [timeTaken, setTimeTaken] = useState<string>('')
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
            crumb: assesmentData?.submitedOutsourseAssessment?.chapterName,
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.StudentAssesmentData}`,
            isLast: false,
        },
        {
            crumb: username,
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
                    const timeTaken = calculateTimeTaken(
                        res?.data?.startedAt,
                        res?.data?.submitedAt
                    )
                    setTimeTaken(timeTaken)
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
                    setProctoringData({
                        canEyeTrack:
                            res?.data?.submitedOutsourseAssessment?.canEyeTrack,
                        canTabChange:
                            res?.data?.submitedOutsourseAssessment
                                ?.canTabChange,
                        canScreenExit:
                            res?.data?.submitedOutsourseAssessment
                                ?.canScreenExit,
                        canCopyPaste:
                            res?.data?.submitedOutsourseAssessment
                                ?.canCopyPaste,
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

    return (
        <>
            {codingdata ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-10 ">
                <div className="flex flex-col relative items-start">
                    <div className="flex items-center">
                        <h1 className="text-start flex  font-bold text-xl ">
                            {codingdata && (
                                <div className=" rounded-lg bg-white  transition-transform transform  ">
                                    <div className="flex flex-col gap-y-4">
                                        <div className="flex gap-x-2 items-center">
                                            <Avatar>
                                                <AvatarImage
                                                    src="https://github.com/shadcn.png"
                                                    alt="@shadcn"
                                                />
                                                <AvatarFallback>
                                                    CN
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-[20px] text-gray-900 dark:text-white">
                                                {username} -
                                            </span>
                                            <span className="font-semibold text-[20px] text-gray-700 dark:text-gray-300">
                                                Individual Report:
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex gap-x-1">
                                                <span className="font-normal text-[15px] text-gray-700 dark:text-gray-300">
                                                    Submitted On
                                                </span>
                                                <span className="font-normal text-[15px] text-gray-900 dark:text-white">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                            <div className="flex gap-x-1">
                                                <span className="font-normal text-[15px] text-gray-700 dark:text-gray-300">
                                                    Time Taken:
                                                </span>
                                                <span className="font-normal text-[15px] text-gray-900 dark:text-white">
                                                    {timeTaken}
                                                </span>
                                            </div>
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
                            assesmentData?.submitedOutsourseAssessment?.totalCodingQuestions
                        }
                        correctedCodingChallenges={9}
                        correctedMcqs={9}
                        totalCorrectedMcqs={
                            assesmentData?.submitedOutsourseAssessment?.totalMcqQuestions
                        }
                        openEndedCorrect={1}
                        totalOpenEnded={
                            assesmentData?.attemptedOpenEndedQuestions
                        }
                        score={assesmentData?.percentage}
                        totalScore={100}
                        copyPaste={assesmentData?.copyPaste}
                        tabchanges={assesmentData?.tabChange}
                        fullScreenExit={assesmentData?.fullScreenExit}
                        eyeMomentCount={assesmentData?.eyeMomentCount}
                        embeddedSearch={assesmentData?.embeddedGoogleSearch}
                        submissionType={assesmentData?.typeOfsubmission}
                        totalCodingScore={
                            assesmentData?.submitedOutsourseAssessment?.weightageCodingQuestions
                        }
                        codingScore={assesmentData?.codingScore}
                        mcqScore={assesmentData?.mcqScore}
                        totalMcqScore={
                            assesmentData?.submitedOutsourseAssessment?.weightageMcqQuestions
                        }
                        openEndedScore={assesmentData?.openEndedScore}
                        totalOpenEndedScore={
                            assesmentData?.requiredOpenEndedScore
                        }
                        proctoringData={proctoringData}
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

                <div className="grid grid-cols-2 gap-20 mt-4 ">
                    {codingdata ? (
                        <>

                            {/* Coding Submission */}
                            {codingdata && codingdata.length === 0 ? (
                                <div className='w-full'>
                                    <h1 className="text-left font-semibold">
                                        Coding Questions
                                    </h1>
                                    <p className="text-center py-20 font-semibold w-5/6 h-1/2 shadow-lg transition-transform transform hover:shadow-xl">
                                        This student has not submitted any coding question.
                                    </p>
                                </div>
                            ) : (
                                codingdata.map((data) => (
                                    <>
                                  <div>
                                  <h1 className="text-left font-semibold">
                                            Coding Question
                                        </h1>
                                        <IndividualStudentAssesment
                                            key={data.id}
                                            data={data}
                                            params={params}
                                            type="codingSubmission"
                                            codingOutsourseId={data.codingOutsourseId}
                                            copyPaste={assesmentData?.copyPaste}
                                            tabchanges={assesmentData?.tabChange}
                                            totalCodingScore={
                                                assesmentData?.submitedOutsourseAssessment?.weightageCodingQuestions
                                            }
                                            codingScore={assesmentData?.codingScore}
                                        />
                                  </div>
                                    </>
                                ))
                            )}

                            {/* Quiz Submission */}
                            {(assesmentData?.submitedOutsourseAssessment
                                ?.easyMcqQuestions ||
                                assesmentData?.submitedOutsourseAssessment
                                    ?.mediumMcqQuestions ||
                                assesmentData?.submitedOutsourseAssessment
                                    ?.hardMcqQuestions > 0) && (
                                    <div className="w-full pl-5">
                                        <h1 className="text-left font-semibold">
                                            MCQs
                                        </h1>
                                        {assesmentData?.mcqQuestionCount === 0 &&
                                            assesmentData?.attemptedMCQQuestions ===
                                            0 ? (
                                            <>
                                                <p className="text-center py-20 font-semibold w-full h-1/2 shadow-lg transition-transform transform hover:shadow-xl">
                                                    This student has not submitted any quiz question.
                                                </p>
                                            </>
                                        ) : assesmentData?.attemptedMCQQuestions >=
                                            1 ? (
                                            <IndividualStudentAssesment
                                                data={[]}
                                                params={params}
                                                type="quizSubmission"
                                                copyPaste={assesmentData?.copyPaste}
                                                tabchanges={
                                                    assesmentData?.tabChange
                                                }
                                                mcqScore={assesmentData?.mcqScore}
                                                totalMcqScore={
                                                    assesmentData
                                                        ?.submitedOutsourseAssessment
                                                        .weightageMcqQuestions
                                                }
                                            />
                                        ) : (
                                            <p className="text-center py-20 font-semibold h-1/2 w-4/5 shadow-lg  transition-transform transform hover:shadow-xl">
                                                This student has not submitted any
                                                quiz question.
                                            </p>
                                        )}
                                    </div>
                                )}

                            {/* Open Ended Submission */}
                            {assesmentData?.openEndedQuestionCount > 0 && (
                                <div className="w-full">
                                    <h1 className="text-left font-semibold">
                                        Open-Ended
                                    </h1>
                                    {assesmentData?.openEndedQuestionCount ===
                                        0 &&
                                        assesmentData?.attemptedOpenEndedQuestions ===
                                        0 ? (
                                        <p className="text-center py-20 font-semibold h-[100px] w-4/5 shadow-lg  transition-transform transform hover:shadow-xl">
                                            There are no open-ended questions in
                                            this assessment.
                                        </p>
                                    ) : assesmentData?.attemptedOpenEndedQuestions >=
                                        1 ? (
                                        <IndividualStudentAssesment
                                            data={[]}
                                            params={params}
                                            type="openEndedSubmission"
                                            copyPaste={assesmentData?.copyPaste}
                                            tabchanges={
                                                assesmentData?.tabChange
                                            }
                                            openEndedScore={
                                                assesmentData?.openEndedScore
                                            }
                                            totalOpenEndedScore={
                                                assesmentData.requiredOpenEndedScore
                                            }
                                        />
                                    ) : (
                                        <p className="text-center py-20 font-semibold h-[100px] w-4/5 shadow-lg  transition-transform transform hover:shadow-xl">
                                            This student has not submitted any
                                            open-ended questions.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center font-semibold">
                            Loading data...
                        </p>
                    )}
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
