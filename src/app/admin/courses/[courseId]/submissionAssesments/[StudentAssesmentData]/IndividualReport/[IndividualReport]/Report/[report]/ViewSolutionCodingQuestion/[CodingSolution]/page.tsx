'use client'
import React, { useCallback, useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import Editor from '@monaco-editor/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { paramsType } from '../../ViewSolutionOpenEnded/page'
import { toast } from '@/components/ui/use-toast'

import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { useSearchParams } from 'next/navigation'
import { b64DecodeUnicode } from '@/utils/base64'
import TestCaseResults from './TestCases'
import { cn, difficultyColor } from '@/lib/utils'
type Props = {}

const Page = ({ params }: { params: paramsType }) => {
    const [codingSubmissionData, setCodingSubmissionData] = useState<any>({})
    const [codingQuestionData, setcodingQuestionData] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [decodedString, setDecodedString] = useState<string>('')
    const [proctoringData, setProctorngData] = useState<any>()
    const [testCases, setTestCases] = useState<any>([])

    const saerchQuery = useSearchParams()
    const [loading, setLoading] = useState<boolean>(true)

    const questionId = saerchQuery.get('id')

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
            crumb: 'Assessment',
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.StudentAssesmentData}`,
            isLast: false,
        },
        {
            crumb: proctoringData?.user?.name,
            href: `/admin/courses/${params.courseId}/submissionAssesments/${params.StudentAssesmentData}/IndividualReport/${params.IndividualReport}/Report/${params.report}`,
            isLast: false,
        },
        {
            crumb: codingSubmissionData?.data?.questionDetail?.title,
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

    const fetchProctoringDataOfCodingQuestion = useCallback(async () => {
        try {
            await api
                .get(
                    `/tracking/assessment/submissionId=${params.report}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    setProctorngData(res?.data)
                })
        } catch (error: any) {}
    }, [params])

    const fetchCodingSubmissionData = useCallback(async () => {
        try {
            await api
                .get(
                    `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${params.report}&studentId=${params.IndividualReport}&codingOutsourseId=${params.CodingSolution}`
                )
                .then((res) => {
                    setCodingSubmissionData(res?.data)
                    setDecodedString(res?.data?.data.sourceCode)
                    setTestCases(res?.data?.data.TestCasesSubmission)
                    console.log(res?.data)
                })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error in fetching',
            })
        } finally {
            setLoading(false)
        }
    }, [params, questionId])

    useEffect(() => {
        fetchCodingSubmissionData()
        fetchProctoringDataOfCodingQuestion()
        getBootcampHandler()
    }, [
        params,
        fetchCodingSubmissionData,
        getBootcampHandler,
        fetchProctoringDataOfCodingQuestion,
    ])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="flex flex-col gap-y-4">
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
                                {proctoringData?.user?.name}- Coding Questions
                                Report
                            </h1>
                        </div>
                    </div>
                </div>

                <div>
                    <div>
                        <h1 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Title:-</span>
                            <span>
                                {
                                    codingSubmissionData?.data?.questionDetail
                                        ?.title
                                }
                            </span>
                        </h1>
                        <h1 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Description:-</span>
                            <span>
                                {
                                    codingSubmissionData?.data?.questionDetail
                                        ?.description
                                }
                            </span>
                        </h1>
                        <h1 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Difficulty:-</span>
                            <span
                                className={cn(
                                    `font-semibold text-secondary`,
                                    difficultyColor(
                                        codingSubmissionData?.data
                                            ?.questionDetail?.difficulty
                                    )
                                )}
                            >
                                {
                                    codingSubmissionData?.data?.questionDetail
                                        ?.difficulty
                                }
                            </span>
                        </h1>
                        <h1 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Constraints:-</span>
                            <span>
                                {
                                    codingSubmissionData?.data?.questionDetail
                                        ?.constraints
                                }
                            </span>
                        </h1>
                    </div>
                    <div className=" flex flex-col md:flex-row sm:flex-row">
                        <TestCaseResults testCases={testCases} />
                        <Editor
                            height="72vh"
                            theme="vs-dark"
                            value={b64DecodeUnicode(decodedString)}
                            className="p-6"
                            options={{
                                readOnly: true,
                                fontSize: 15,
                            }}
                        />
                    </div>
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
