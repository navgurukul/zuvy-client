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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Clock } from 'lucide-react'

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
    codingSubmission: CodingSubmission[]
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
const Page = ({ params }: { params: any }) => {
    const [individualAssesmentData, setIndividualAssesmentData] =
        useState<StudentAssessment>()
    const [individualFormData, setIndividualFormData] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [assesmentData, setAssesmentData] = useState<any>()
    const [user, setUser] = useState<any>()
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
            crumb: 'Submission - Forms',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: chapterDetails?.title,
            href: `/admin/courses/${params.courseId}/submissionForm/${params.report}?moduleId=${params.StudentForm}`,
            isLast: false,
        },
        {
            crumb: user && user.name,
            href: '',
            isLast: true,
        },
    ]

    function formatDate(isoDateStr: any) {
        // Create a Date object from the ISO 8601 string
        const date = new Date(isoDateStr);
    
        // Get day, month, and year
        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.toLocaleString('en-US', { month: 'short' });
    
        // Return the formatted date string
        return ` ${day} ${month} ${year}`;
    }

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getIndividualStudentFormDataHandler = useCallback(async () => {
        const chapterId = params.report
        const moduleId = params.StudentForm
        await api
            .get(
                `submission/getFormDetailsById/${moduleId}?chapterId=${chapterId}`
            )
            .then((res) => {
                setIndividualFormData(res.data.trackedData)
                setIndividualAssesmentData(res.data)
            })

        await api.get(`/tracking/getChapterDetailsWithStatus/${chapterId}`)
        .then((res) => {
            setChapterDetails(res.data.trackingData)
        })
    }, [params.report])

    const getIndividualStudent = useCallback(async () => {
        await api.get(
            `submission/formsStatus/${params.courseId}/${params.StudentForm}?chapterId=${params.report}&limit=3&offset=1`
        )
        .then((res) => {
            const student = res.data.data1.find((item:any) => item.id == params.IndividualReport)
            setUser(student)
        })
    }, [params.report, params.IndividualReport])

    useEffect(() => {
        getIndividualStudentFormDataHandler()
        getBootcampHandler()
        getIndividualStudent()
    }, [getIndividualStudentFormDataHandler, getBootcampHandler])

    return (
        <>
            {user ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4">
                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 text-left w-1/3">
                        <h1 className="text-xl font-bold text-secondary-foreground">
                            {chapterDetails?.title}
                        </h1>
                        <p className="text-lg">{chapterDetails?.description}</p>
                        <div>
                            {
                                individualFormData && 
                                (<p className="text-lg description bg-primary-foreground p-5 rounded-lg">
                                    Submitted on 
                                    {formatDate(individualFormData?.[0].formTrackingData[0].updatedAt)}
                                </p>)
                            }
                        </div>
                        {individualFormData &&
                            individualFormData.map((item: any, index: any) => (
                                <div
                                    key={index}
                                    className="space-y-3 text-start"
                                >
                                    {item.typeId === 1 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="space-y-3 text-start">
                                                <RadioGroup value={item.formTrackingData[0].chosenOptions[0]}>
                                                    {Object.keys(item.options).map((option) => {
                                                        const answer = item.formTrackingData[0].chosenOptions[0];
                                                        return (
                                                            <div
                                                                key={option}
                                                                className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                    answer == option &&
                                                                    'border border-gray-800 border-2 rounded-lg'
                                                                }`}
                                                            >
                                                                <div className="flex items-center w-full space-x-3 space-y-0">
                                                                    <RadioGroupItem 
                                                                        value={option} 
                                                                        checked={answer == option}
                                                                        disabled
                                                                    />
                                                                    <label className="font-normal">
                                                                        {item.options[option]}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    )}

                                    {item.typeId === 2 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="mt-2">
                                                {Object.keys(item.options).map((option) => {
                                                    const answer = item.formTrackingData[0].chosenOptions;
                                                    const optionNumber = Number(option); 
                                                    return (
                                                        <div
                                                            key={option}
                                                            className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                answer.includes(optionNumber) &&
                                                                'border border-gray-800 border-2 rounded-lg'
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                checked={answer.includes(
                                                                    optionNumber
                                                                )}
                                                                disabled
                                                                aria-label={option}
                                                                className={`translate-y-[2px] mr-1 ${
                                                                    answer.includes(optionNumber) && 'bg-green-500'
                                                                }`}
                                                            />
                                                            {item.options[option]}
                                                        </div>
                                                )})}
                                            </div>
                                        </div>
                                    )}

                                    {item.typeId === 3 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <p>{item.formTrackingData[0].answer}</p>
                                        </div>
                                    )}

                                    {item.typeId === 4 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="flex flex-row gap-x-1">
                                                <CalendarIcon className="h-4 w-4 opacity-50 m-1" />
                                                <p>
                                                    {formatDate(item.formTrackingData[0].answer)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {item.typeId === 5 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="flex flex-row gap-x-1">
                                                <Clock className="h-4 w-4 opacity-50 m-1" />
                                                <p>{item.formTrackingData[0].answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
