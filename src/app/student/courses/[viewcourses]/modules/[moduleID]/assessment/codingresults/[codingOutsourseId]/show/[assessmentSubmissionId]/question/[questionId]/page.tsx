'use client'

import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { ScrollBar } from '@/components/ui/scroll-area'
import { ScrollArea } from '@radix-ui/react-scroll-area'

const decodeBase64 = (data: string) => {
    if (!data) return ''
    return Buffer.from(data, 'base64').toString('utf-8')
}

const CodingSubmissionPage = ({ params }: { params: any }) => {
    const { studentData } = useLazyLoadedStudentData()
    let userID = studentData?.id
    const [codingSubmissionsData, setCodingSubmissionsData] = useState<any>(null)
    const router = useRouter()

    async function getCodingSubmissionsData(codingOutsourseId: any, assessmentSubmissionId: any, questionId: any) {
        try {
            const res = await api.get(
                `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            setCodingSubmissionsData(res.data)
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
        }
    }

    useEffect(() => {
        if (!userID) {
            userID = studentData?.id
        }
        getCodingSubmissionsData(params.codingOutsourseId, params.assessmentSubmissionId, params.questionId)
    }, [userID])

    if (!codingSubmissionsData) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    } else if (codingSubmissionsData?.status === 'error') {
        return (
            <div className="p-4">
                <div
                    onClick={() => router.back()}
                    className="cursor-pointer flex items-center space-x-2 text-secondary hover:text-green-800 mb-4"
                >
                    <ChevronLeft width={24} /> <span>Back</span>
                </div>
                <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow-md">
                    {codingSubmissionsData?.message}
                </div>
            </div>
        )
    }

    const { sourceCode, TestCasesSubmission } = codingSubmissionsData?.data

    return (
        <>
            <div
                onClick={() => router.back()}
                className="cursor-pointer flex items-center space-x-2 text-secondary hover:text-green-800 mb-4"
            >
                <ChevronLeft width={24} /> <span>Back</span>
            </div>
            <div className="w-full mx-auto p-4 flex justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
                   <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            Submitted Code
                        </h2>
                        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-y-auto text-sm max-h-[400px]">
                            {decodeBase64(sourceCode)}     
                        </pre>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            Submission Details
                        </h3>
                        {TestCasesSubmission?.map((submission: any, index: number) => (
                            <div
                                key={index}
                                className="mb-4 p-4 bg-gray-50 border-l-2 border-r-2 border-secondary rounded-lg"
                            >
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                    Test Case {index + 1}
                                </h4>
                                <p className="text-gray-600">
                                    <strong>Status:</strong> {submission.status}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Inputs:</strong>
                                    <ul>
                                        {submission.testCases.inputs.map((input: any, i: number) => (
                                            <li key={i}>{input.parameterName}: {input.parameterValue}</li>
                                        ))}
                                    </ul>
                                </p>
                                <p className="text-gray-600">
                                    <strong>Expected Output:</strong> {submission.testCases.expectedOutput.parameterValue}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Your Output:</strong> {decodeBase64(submission.stdout) || 'N/A'}
                                </p>
                                {submission.stderr && (
                                    <div className="text-red-500 mt-2">
                                        <strong>Error Output:</strong> {decodeBase64(submission.stderr)}
                                    </div>
                                )}
                                <p className="text-gray-600">
                                    <strong>Memory Used:</strong> {submission.memory || 'N/A'} KB
                                </p>
                                <p className="text-gray-600">
                                    <strong>Execution Time:</strong> {submission.time || 'N/A'} seconds
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CodingSubmissionPage
