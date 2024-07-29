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
    const [bootcampData, setBootcampData] = useState<any>()
    const [assesmentData, setAssesmentData] = useState<any>()
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

    const newContent = {
        title: 'Class Feedback',
        description:
            'We would like to know how you liked this class. Please share your insights with us',
        section: [
            {
                type: 'multiple-choice',
                question: 'What is your favorite color?',
                options: ['Red', 'Blue', 'Green', 'Yellow'],
                answer: 'Blue',
            },
            {
                type: 'paragraph',
                question: 'How are your?',
                options: [],
                answer: 'I am good!',
            },
            {
                type: 'checkbox',
                question: 'What are your favorite pet animal?',
                options: ['Dog', 'Cat', 'Squerall', 'Rabbit'],
                answer: ['Dog', 'Cat', 'Rabbit'],
            },
            {
                type: 'paragraph',
                question: 'Which course are you studying currently?',
                options: [],
                answer: 'I am studying Data Science',
            },
            {
                type: 'time',
                question: 'When do you start studying?',
                options: [],
                answer: '08:00 am',
            },
            {
                type: 'date',
                question: 'When did you start this course?',
                options: [],
                answer: '15th May 2024',
            },
        ],
    }

    // const getBootcampHandler = useCallback(async () => {
    //     try {
    //         const res = await api.get(`/bootcamp/${params.courseId}`)
    //         setBootcampData(res.data.bootcamp)
    //     } catch (error) {
    //         console.error('API Error:', error)
    //     }
    // }, [params.courseId])
    // const getIndividualStudentAssesmentDataHandler = useCallback(async () => {
    //     await api
    //         .get(
    //             `/admin/assessment/submission/user_id${params.IndividualReport}?submission_id=${params.report}`
    //         )
    //         .then((res) => {
    //             setIndividualAssesmentData(res.data)
    //         })
    // }, [params.IndividualReport, params.report])

    return (
        <>
            {/* {individualAssesmentData ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )} */}
            <MaxWidthWrapper className="p-4">
                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 text-left w-1/3">
                        <h1 className="text-xl font-bold text-secondary-foreground">
                            {newContent.title}
                        </h1>
                        <p className="text-lg">{newContent.description}</p>
                        <div>
                            {/* Change the color */}
                            <p className="text-lg description bg-primary-foreground p-5 rounded-lg">
                                Submitted on 26 Jun 2024
                            </p>
                        </div>
                        {newContent.section.map((item, index) => (
                            <div key={index} className="space-y-3 text-start">
                                {item.type === 'multiple-choice' && (
                                    <div className="mt-6">
                                        <div className="flex flex-row gap-x-2 font-semibold">
                                            <p>{index + 1}.</p>
                                            <p>{item.question}</p>
                                        </div>
                                        <div className="space-y-3 text-start">
                                            <RadioGroup
                                            // onValueChange={field.onChange}
                                            // value={item.answer}
                                            >
                                                {item.options.map((option) => (
                                                    <div
                                                        key={option}
                                                        className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                            item.answer ===
                                                                option &&
                                                            `border border-secondary border-2 rounded-lg`
                                                        }`}
                                                    >
                                                        <div className="flex items-center w-full space-x-3 space-y-0">
                                                            <RadioGroupItem
                                                                value={option}
                                                            />
                                                            <label className="font-normal">
                                                                {option}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </div>
                                )}

                                {item.type === 'checkbox' && (
                                    <div className="mt-6">
                                        <div className="flex flex-row gap-x-2 font-semibold">
                                            <p>{index + 1}.</p>
                                            <p>{item.question}</p>
                                        </div>
                                        <div className="mt-2">
                                            {/* {item.options.map((option) => (
                                                <div>
                                                    {option}
                                                    </div>
                                            )} */}
                                            {item.options.map((option,index) => (
                                                <div key={index} >
                                                    <Checkbox
                                                        checked={item.answer.includes(
                                                            option
                                                        )}
                                                        aria-label={option}
                                                        className="translate-y-[2px] mr-1"
                                                    />
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.type === 'paragraph' && (
                                    <div className="mt-6">
                                        <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                            <p>{index + 1}.</p>
                                            <p>{item.question}</p>
                                        </div>
                                        <p>{item.answer}</p>
                                    </div>
                                )}

                                {item.type === 'time' && (
                                    <div className="mt-6">
                                        <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                            <p>{index + 1}.</p>
                                            <p>{item.question}</p>
                                        </div>
                                        <div className="flex flex-row gap-x-1">
                                            <Clock className="h-4 w-4 opacity-50 m-1" />
                                            <p>{item.answer}</p>
                                        </div>
                                    </div>
                                )}

                                {item.type === 'date' && (
                                    <div className="mt-6">
                                        <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                            <p>{index + 1}.</p>
                                            <p>{item.question}</p>
                                        </div>
                                        <div className="flex flex-row gap-x-1">
                                            <CalendarIcon className="h-4 w-4 opacity-50 m-1" />
                                            <p>{item.answer}</p>
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
