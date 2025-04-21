'use client'
import React, { useState, useEffect, useCallback } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProctoringDataStore } from '@/store/store'
import { paramsType } from '../ViewSolutionOpenEnded/page'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { addClassToCodeTags } from '@/utils/admin'

type SubmissionData = {
    id: number
    userId: number
    chosenOption: number
    questionId: number
    attemptCount: number
}

type QuizOptions = {
    [key: string]: string
}

type Quiz = {
    id: number
    question: string
    options: QuizOptions
    difficulty: string
    correctOption: number
    marks: number | null
}

type QuizDetails = {
    id: number
    quiz_id: number
    assessmentOutsourseId: number
    bootcampId: number
    chapterId: number
    createdAt: string
    submissionsData: SubmissionData[]
    Quiz: Quiz
}

const Page = ({ params }: { params: paramsType }) => {
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    const [bootcampData, setBootcampData] = useState<any>()
    const [assesmentData, setAssesmentData] = useState<any>()
    const [quizQuestionDetails, setQuizQuiestionDetails] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const codeBlockClass =
        'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

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
            crumb: proctoringData?.user?.name,
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.StudentAssesmentData}/IndividualReport/${params.IndividualReport}/Report/${params.report}`,
            isLast: false,
        },
        {
            crumb: `Quiz Report`,
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
                `/admin/assessment/students/assessment_id${params.StudentAssesmentData}`
            )
            .then((res) => {
                setAssesmentData(res.data.ModuleAssessment)
            })
    }, [params.StudentAssesmentData])
    const fetchQuizQuestionDetails = useCallback(async () => {
        try {
            await api
                .get(
                    `/Content/assessmentDetailsOfQuiz/${params.StudentAssesmentData}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    setQuizQuiestionDetails(res.data.data)
                })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed To fetch',
            })
        } finally {
            setLoading(false)
        }
    }, [params.IndividualReport, params.StudentAssesmentData])

    useEffect(() => {
        fetchProctoringData(params.report, params.IndividualReport)
        fetchQuizQuestionDetails()
        getBootcampHandler()
        getStudentAssesmentDataHandler()
    }, [
        getBootcampHandler,
        getStudentAssesmentDataHandler,
        fetchQuizQuestionDetails,
        fetchProctoringData,
        params,
    ])

    useEffect(() => {
        if (proctoringData) {
            setLoading(false)
        }
    }, [proctoringData])
    const { tabChange, copyPaste, quizSubmission, user } = proctoringData
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
                                {user?.name}- Quiz Questions Report
                            </h1>
                        </div>
                    </div>
                </div>
                <h1 className="text-left font-semibold text-[20px]">
                    Overview
                </h1>

                <div>
                    {quizQuestionDetails?.mcqs?.map(
                        (quizDetail: any, index: number) => {
                            const { submissionsData } = quizDetail
                            const chosenOption = submissionsData?.chosenOption
                            const isAttempted =
                                chosenOption !== null &&
                                chosenOption !== undefined

                            return (
                                <div
                                    key={quizDetail.variantId}
                                    className="flex flex-col items-start gap-y-4 mb-6"
                                >
                                    {/* Question */}
                                    <div className="flex flex-row gap-x-2 my-3">
                                        <p className="font-semibold">
                                            Q{index + 1}.
                                        </p>
                                        <div
                                            className="font-semibold"
                                            dangerouslySetInnerHTML={{
                                                __html: addClassToCodeTags(
                                                    quizDetail.question,
                                                    codeBlockClass
                                                ),
                                            }}
                                        />
                                    </div>

                                    {/* Options */}
                                    {Object.entries(quizDetail.options).map(
                                        ([key, option], idx) => {
                                            const optionKey = parseInt(key)
                                            const isCorrect =
                                                optionKey ===
                                                quizDetail.correctOption
                                            const isChosen =
                                                optionKey === chosenOption

                                            const showChecked =
                                                isCorrect || isChosen

                                            const textColor = isCorrect
                                                ? 'text-green-600'
                                                : isChosen && !isCorrect
                                                ? 'text-red-500'
                                                : 'text-black'

                                            return (
                                                <div
                                                    key={key}
                                                    className="w-full"
                                                >
                                                    <div
                                                        className={`flex items-center w-full justify-start ${textColor}`}
                                                    >
                                                        <p className="text-primary font-semibold">
                                                            {idx + 1}.
                                                        </p>
                                                        <div className="flex flex-row space-x-5 w-full m-2">
                                                            <div className="w-1/2 flex flex-row items-center gap-x-3">
                                                                <input
                                                                    type="radio"
                                                                    name={`question-${quizDetail.variantId}-${index}`}
                                                                    value={key}
                                                                    checked={
                                                                        showChecked
                                                                    }
                                                                    readOnly
                                                                    disabled
                                                                />
                                                                <span className="break-words">
                                                                    {
                                                                        option as string
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    )}

                                    {/* Not Answered Label */}
                                    {!isAttempted && (
                                        <p className="text-muted-foreground text-sm font-medium ml-8">
                                            Not Answered
                                        </p>
                                    )}
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
