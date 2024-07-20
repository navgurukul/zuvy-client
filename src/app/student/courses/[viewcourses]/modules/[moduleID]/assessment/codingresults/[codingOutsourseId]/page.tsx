'use client'

import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const decodeBase64 = (data: string) => {
    if (!data) return '';
    return Buffer.from(data, 'base64').toString('utf-8');
};

const CodingSubmissionPage = ({ params }: { params: any }) => {
    const { studentData } = useLazyLoadedStudentData()
    let userID = studentData?.id && studentData?.id
    const [codingSubmissionsData, setCodingSubmissionsData] = useState<any>(null)
    const router = useRouter()

    async function getCodingSubmissionsData(codingOutsourseId: any) {
        try {
            const res = await api.get(`codingPlatform/PracticeCode?studentId=${userID}&codingOutsourseId=${codingOutsourseId}`)
            setCodingSubmissionsData(res.data)
            console.log(res.data);
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
        }
    }

    useEffect(() => {
        if (!userID) {
            userID = studentData?.id && studentData?.id
        }
        getCodingSubmissionsData(params.codingOutsourseId)
    }, [userID])

    if (!codingSubmissionsData) {
        return <div>Loading...</div>
    }else if(codingSubmissionsData?.status == 'error'){
        return <div><div onClick={()=>router.back()} className='cursor-pointer flex justify-start'><ChevronLeft width={24}/> Back</div> {codingSubmissionsData?.message}</div>
    }

    const { questionInfo, shapecode } = codingSubmissionsData

    return (
        <>
        <div onClick={()=>router.back()} className='cursor-pointer flex justify-start'><ChevronLeft width={24}/> Back</div>
        <div className="w-full mx-auto p-4 text-start flex justify-center">
            <div className="grid grid-cols-2 gap-5 w-full max-w-7xl">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Question Details Below:</h2>
                    <h2 className="text-xl font-bold mb-2">{questionInfo?.title}</h2>
                    <p className="text-gray-700 mb-4">{questionInfo?.description}</p>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold">Details:</h3>
                        <p><strong>Difficulty:</strong> {questionInfo?.difficulty}</p>
                        <p><strong>Constraints:</strong> {questionInfo?.constraints}</p>
                        <p><strong>Tags:</strong> {questionInfo?.tags}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold">Examples:</h3>
                        {questionInfo?.examples.map((example: any, index: number) => (
                            <div key={index} className="mb-2">
                                <p><strong>Input:</strong> {example.input.join(', ')}</p>
                                <p><strong>Output:</strong> {example.output.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">Submission Details For The Question:</h3>
                    <p><strong>Language:</strong> {shapecode?.language.name}</p>
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold">Source Code:</h4>
                        <pre className="bg-gray-100 p-4 rounded">{decodeBase64(shapecode?.source_code)}</pre>
                    </div>
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold">Test Cases:</h4>
                        <p><strong>Input:</strong> {decodeBase64(shapecode?.stdin)}</p>
                        <p><strong>Expected Output:</strong> {decodeBase64(shapecode?.expected_output)}</p>
                        <p><strong>Actual Output:</strong> {decodeBase64(shapecode?.stdout)}</p>
                        {shapecode?.stderr && (
                            <div className="text-red-500">
                                <strong>Error Output:</strong> {decodeBase64(shapecode?.stderr)}
                            </div>
                        )}
                    </div>
                    <p><strong>Memory Used:</strong> {shapecode?.memory} KB</p>
                    <p><strong>Execution Time:</strong> {shapecode?.time} seconds</p>
                </div>
            </div>
        </div>
        </>
    )
}

export default CodingSubmissionPage
