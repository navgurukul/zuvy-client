'use client'
import { api } from '@/utils/axios.config'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TestCaseResults from '../../../submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionCodingQuestion/[CodingSolution]/TestCases'
import Editor from '@monaco-editor/react'
import { b64DecodeUnicode } from '@/utils/base64'
import { cn, difficultyColor } from '@/lib/utils'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'

type Props = {}

const Page = ({ params }: any) => {
    const [codingSubmissiondata, setCodingSubmissiondata] = useState<any>()
    const [decodedString, setDecodedString] = useState<string>('')
    const searchQuery = useSearchParams()
    const [crumbData, setCrumbData] = useState<string | null>(null)

    const questionId = searchQuery.get('questionId')
    const moduleId = searchQuery.get('moduleId')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCrumbData = localStorage.getItem('crumbData')
            if (storedCrumbData) {
                setCrumbData(storedCrumbData)
            }
        }
    }, [])

    const parsedCrumbData = crumbData ? JSON.parse(crumbData) : []

    const crumbs = useMemo(
        () => [
            {
                crumb: 'My Courses',
                href: `/admin/courses`,
                isLast: false,
            },
            {
                crumb: parsedCrumbData[0],
                href: `/admin/courses/${params.courseId}/submissions`,
                isLast: false,
            },
            // {
            //     crumb: 'Submission - Practice Problems',
            //     href: `/admin/courses/${params.courseId}/submissions`,
            //     isLast: false,
            // },
            {
                crumb: parsedCrumbData[1],
                href: `/admin/courses/${params.courseId}/submissionProblems/${moduleId}`,
                isLast: false,
            },
            {
                crumb: 'Individual Coding Submission',
                href: ``,
                isLast: true,
            },
        ],
        [params, parsedCrumbData]
    )

    const fetchCodingSubbmissionDataHandler = useCallback(async () => {
        try {
            await api
                .get(
                    `/codingPlatform/submissions/questionId=${questionId}?studentId=${params.CodingSubmission}`
                )
                .then((res) => {
                    setCodingSubmissiondata(res?.data?.data)
                    setDecodedString(res?.data?.data.sourceCode)
                })
        } catch (error: any) {
            console.error('Error Fetching Data')
        }
    }, [questionId, params.CodingSubmission, setCodingSubmissiondata])

    useEffect(() => {
        fetchCodingSubbmissionDataHandler()
    }, [fetchCodingSubbmissionDataHandler])


    return (
        <>
            {codingSubmissiondata && (
                <div>
                    <BreadcrumbComponent crumbs={crumbs} />
                    <div className="p-4">
                        <h6 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Title:-</span>
                            <span>
                                {codingSubmissiondata?.questionDetail?.title}
                            </span>
                        </h6>
                        <h6 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Description:-</span>
                            <span>
                                {
                                    codingSubmissiondata?.questionDetail
                                        ?.description
                                }
                            </span>
                        </h6>
                        <h6 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Difficulty:-</span>
                            <span
                                className={cn(
                                    `font-semibold text-secondary`,
                                    difficultyColor(
                                        codingSubmissiondata?.questionDetail
                                            ?.difficulty
                                    )
                                )}
                            >
                                {
                                    codingSubmissiondata?.questionDetail
                                        ?.difficulty
                                }
                            </span>
                        </h6>
                        <h6 className="text-left font-semibold flex gap-x-3 m-3">
                            <span>Constraints:-</span>
                            <span>
                                {
                                    codingSubmissiondata?.questionDetail
                                        ?.constraints
                                }
                            </span>
                        </h6>
                    </div>
                    <div className="flex flex-col items-center md:flex-row w-full">
                        <div className="w-full md:w-1/2 p-4">
                            <TestCaseResults
                                testCases={
                                    codingSubmissiondata?.TestCasesSubmission
                                }
                            />
                        </div>
                        <div className="w-full md:w-1/2 p-4">
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
                </div>
            )}
        </>
    )
}

export default Page
