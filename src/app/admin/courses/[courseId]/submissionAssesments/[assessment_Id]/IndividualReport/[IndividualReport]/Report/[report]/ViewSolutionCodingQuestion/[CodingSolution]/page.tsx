'use client'
import React, { useCallback, useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import Editor from '@monaco-editor/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { paramsType } from "@/app/admin/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionOpenEnded/ViewSolutionPageType"
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from '@/utils/axios.config'
import { FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { b64DecodeUnicode } from '@/utils/base64'
import TestCaseResults from './TestCases'
import { cn, difficultyColor } from '@/lib/utils'
import { CodingSubmissionData, BootcampData, ProctoringData, CodingSubmissionResponse } from "@/app/admin/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionCodingQuestion/SubmissionViewPageType"

const Page = ({ params }: { params: paramsType }) => {
    const router = useRouter()
    const [codingSubmissionData, setCodingSubmissionData] = useState<CodingSubmissionData | null>(null)
    const [codingQuestionData, setcodingQuestionData] = useState<any>()
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [decodedString, setDecodedString] = useState<string>('')
    const [proctoringData, setProctorngData] = useState<ProctoringData | null>(null);
    const [testCases, setTestCases] = useState<any>([])

    const saerchQuery = useSearchParams()
    const [loading, setLoading] = useState<boolean>(true)

    const questionId = saerchQuery.get('id')

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
        } catch (error: any) { }
    }, [params])

    const fetchCodingSubmissionData = useCallback(async () => {
        try {
            await api
                .get<CodingSubmissionResponse>(
                    `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${params.report}&studentId=${params.IndividualReport}&codingOutsourseId=${params.CodingSolution}`
                )
                .then((res) => {
                    setCodingSubmissionData(res?.data)
                    setDecodedString(res?.data?.data.sourceCode)
                    setTestCases(res?.data?.data.TestCasesSubmission)
                })
        } catch (error) {
            toast.error({
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
            <MaxWidthWrapper className="flex flex-col gap-y-4 text-gray-600">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Submissions
                    </Button>
                </div>
                <Card className='bg-card border border-border rounded-2xl p-8 mb-8 shadow-lg'>
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50 pb-6">
                        <div className="flex flex-row items-center gap-x-6">
                            <div className="relative">
                                <Avatar className="h-16 w-16 ring-4 ring-primary/20 ring-offset-2 ring-offset-background">
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="@shadcn"
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg">
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full"></div>
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-left text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                                    {proctoringData?.user?.name} - Coding Report
                                </CardTitle>
                                <p className="text-left text-muted-foreground text-sm">Detailed submission analysis and performance metrics</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">
                                            Question Title
                                        </h3>
                                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                            {codingSubmissionData?.data?.questionDetail?.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 uppercase tracking-wide">
                                            Description
                                        </h3>
                                        <p className="text-green-900 dark:text-green-100 leading-relaxed">
                                            {codingSubmissionData?.data?.questionDetail?.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2 uppercase tracking-wide">
                                            Difficulty Level
                                        </h3>
                                        <span className={cn(
                                            `inline-flex items-center px-4 py-2 rounded-full text-sm font-bold`,
                                            difficultyColor(codingSubmissionData?.data?.questionDetail?.difficulty ?? 'unknown')
                                        )}>
                                            <div className="w-2 h-2 rounded-full mr-2 bg-current"></div>
                                            {codingSubmissionData?.data?.questionDetail?.difficulty}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2 uppercase tracking-wide">
                                            Constraints
                                        </h3>
                                        <p className="text-orange-900 dark:text-orange-100 text-sm leading-relaxed break-words">
                                            {codingSubmissionData?.data?.questionDetail?.constraints}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                </Card>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="w-full md:w-1/2">
                        <TestCaseResults testCases={testCases} />
                    </div>

                    <div className="w-full md:w-1/2">
                        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4 border-b border-border">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                        <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-left text-lg font-semibold text-foreground">Source Code</h2>
                                        <p className="text-sm text-muted-foreground">Solution implementation</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <Editor
                                    height="600px"
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
                </div>


            </MaxWidthWrapper >
        </>
    )
}

export default Page
