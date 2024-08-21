'use client'

import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const decodeBase64 = (data: string) => {
    if (!data) return ''
    return Buffer.from(data, 'base64').toString('utf-8')
}

const CodingSubmissionPage = ({ params }: { params: any }) => {
    const { studentData } = useLazyLoadedStudentData()
    let userID = studentData?.id && studentData?.id
    const [codingSubmissionsData, setCodingSubmissionsData] = useState<any>(null)
    const router = useRouter()

    async function getCodingSubmissionsData(codingOutsourseId: any, assessmentSubmissionId: any) {
        try {
            const res = await api.get(
                `codingPlatform/submissions/questionId=49?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            setCodingSubmissionsData(res.data)
            console.log(res.data)
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
        }
    }

    useEffect(() => {
        if (!userID) {
            userID = studentData?.id && studentData?.id
        }
        getCodingSubmissionsData(params.codingOutsourseId, params.assessmentSubmissionId)
    }, [userID])

    if (!codingSubmissionsData) {
        return <div>Loading...</div>
    } else if (codingSubmissionsData?.status == 'error') {
        return (
            <div>
                <div
                    onClick={() => router.back()}
                    className="cursor-pointer flex justify-start"
                >
                    <ChevronLeft width={24} /> Back
                </div>{' '}
                {codingSubmissionsData?.message}
            </div>
        )
    }

    const { title, description, difficulty, constraints, testCases, testcasesSubmission } = codingSubmissionsData?.data

    return (
        <>
            <div
                onClick={() => router.back()}
                className="cursor-pointer flex justify-start"
            >
                <ChevronLeft width={24} /> Back
            </div>
            <div className="w-full mx-auto p-4 text-start flex justify-center">
                <div className="grid grid-cols-2 gap-5 w-full max-w-7xl">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">
                            Question Details Below:
                        </h2>
                        <h2 className="text-xl font-bold mb-2">
                            {title}
                        </h2>
                        <p className="text-gray-700 mb-4">
                            {description}
                        </p>
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">Details:</h3>
                            <p>
                                <strong>Difficulty:</strong> {difficulty}
                            </p>
                            <p>
                                <strong>Constraints:</strong> {constraints}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-2">
                            Submission Details For The Question:
                        </h3>
                        {testcasesSubmission?.map((submission: any, index: number) => {
                            const testCase = testCases.find((test: any) => test.id === submission.testcastId)

                            return (
                                <div key={index} className="mb-4">
                                    <h4 className="text-lg font-semibold">
                                        Test Case {index + 1}:
                                    </h4>
                                    <p>
                                        <strong>Input:</strong> {testCase.inputs.map((input: any) => `${input.parameterName}: ${input.parameterValue}`).join(', ')}
                                    </p>
                                    <p>
                                        <strong>Expected Output:</strong> {testCase.expectedOutput.parameterValue}
                                    </p>
                                    <p>
                                        <strong>Actual Output:</strong> {decodeBase64(submission.stdout)}
                                    </p>
                                    {submission.stderr && (
                                        <div className="text-red-500">
                                            <strong>Error Output:</strong> {decodeBase64(submission.stderr)}
                                        </div>
                                    )}
                                    <p>
                                        <strong>Memory Used:</strong> {submission.memory} KB
                                    </p>
                                    <p>
                                        <strong>Execution Time:</strong> {submission.time} seconds
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CodingSubmissionPage
