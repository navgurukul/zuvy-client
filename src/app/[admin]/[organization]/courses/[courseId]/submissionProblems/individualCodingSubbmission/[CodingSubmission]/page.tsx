'use client'
import { api } from '@/utils/axios.config'
import { useSearchParams, usePathname } from 'next/navigation'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TestCaseResults from '../../../submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionCodingQuestion/[CodingSolution]/TestCases'
import Editor from '@monaco-editor/react'
import { b64DecodeUnicode } from '@/utils/base64'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, difficultyColor } from '@/lib/utils'
import { FileText, ArrowLeft, Heading6 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
    PageParams,
    CodingSubmission,
    ApiResponse,
} from '@/app/[admin]/[organization]/courses/[courseId]/submissionProblems/individualCodingSubbmission/CodingSubmissionType'

const Page = ({ params }: PageParams) => {
    const router = useRouter()
    const [codingSubmissiondata, setCodingSubmissiondata] =
        useState<CodingSubmission | null>(null)
    const [decodedString, setDecodedString] = useState<string>('')
    const searchQuery = useSearchParams()
    const [crumbData, setCrumbData] = useState<string | null>(null)

    const questionId = searchQuery.get('questionId')
    const moduleId = searchQuery.get('moduleId')
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]

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
                href: `/admin/${orgName}/courses`,
                isLast: false,
            },
            {
                crumb: parsedCrumbData[0],
                href: `/admin/${orgName}/courses/${params.courseId}/submissions`,
                isLast: false,
            },
            // {
            //     crumb: 'Submission - Practice Problems',
            //     href: `/admin/${orgName}/courses/${params.courseId}/submissions`,
            //     isLast: false,
            // },
            {
                crumb: parsedCrumbData[1],
                href: `/admin/${orgName}/courses/${params.courseId}/submissionProblems/${moduleId}`,
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
                .get<ApiResponse>(
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
                    <MaxWidthWrapper className="container mx-auto px-2 pt-2 pb-2 max-w-7xl">
                        <div className="flex items-center gap-4 mb-8 mt-8">
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                className="hover:bg-transparent hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Course Submissions
                            </Button>
                        </div>
                        <Card className="bg-transparent shadow-none border-none p-0">
                            <CardContent className="px-0 py-8 space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-card from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-10 border border-blue-200/50 dark:border-blue-800/50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                                <svg
                                                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h6 className="text-lg font-semibold text-foreground">
                                                    Title
                                                </h6>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        codingSubmissiondata
                                                            ?.questionDetail
                                                            ?.title
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-card from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-10 border border-green-200/50 dark:border-green-800/50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                                                <svg
                                                    className="w-6 h-6 text-green-600 dark:text-green-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h6 className="text-lg font-semibold text-foreground">
                                                    Description
                                                </h6>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        codingSubmissiondata
                                                            ?.questionDetail
                                                            ?.description
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-card from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl p-10 border border-purple-200/50 dark:border-purple-800/50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                                                <svg
                                                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h6 className="text-lg font-semibold text-foreground">Difficulty Level</h6>
                                                <span className={cn(
                                                    `text-sm text-muted-foreground`,
                                                    difficultyColor(
                                                        codingSubmissiondata?.questionDetail
                                                            ?.difficulty
                                                    ))}>
                                                    <p className="text-sm text-muted-foreground">
                                                    {
                                                        codingSubmissiondata
                                                            ?.questionDetail
                                                            ?.difficulty
                                                    }
                                                    </p>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-card from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-10 border border-orange-200/50 dark:border-orange-800/50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                                <svg
                                                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h6 className="text-lg font-semibold text-foreground">Constraints</h6>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        codingSubmissiondata
                                                            ?.questionDetail
                                                            ?.constraints
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="w-full md:w-1/2">
                                <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4 border-b border-border">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                                <FileText
                                                    size={20}
                                                    className="text-purple-600 dark:text-purple-400"
                                                />
                                            </div>
                                            <div>
                                                <h2 className="text-left text-lg font-semibold text-foreground">
                                                    Source Code
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Solution implementation
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Editor
                                            height="600px"
                                            theme="vs-dark"
                                            value={b64DecodeUnicode(
                                                decodedString
                                            )}
                                            className="p-6"
                                            options={{
                                                readOnly: true,
                                                fontSize: 15,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <TestCaseResults
                                    testCases={
                                        codingSubmissiondata?.TestCasesSubmission
                                    }
                                />
                            </div>

                          
                        </div>
                    </MaxWidthWrapper>
                </div>
            )}
        </>
    )
}

export default Page
