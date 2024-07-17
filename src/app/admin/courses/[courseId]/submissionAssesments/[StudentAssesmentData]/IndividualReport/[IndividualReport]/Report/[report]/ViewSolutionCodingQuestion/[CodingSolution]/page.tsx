'use client'
import React, { useCallback, useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProctoringDataStore } from '@/store/store'
import { paramsType } from '../../ViewSolutionOpenEnded/page'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'

type Props = {}

const Page = ({ params }: { params: paramsType }) => {
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    const [codingSubmissionData, setCodingSubmissionData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)

    const fetchCodingSubmissionData = useCallback(async () => {
        try {
            await api
                .get(
                    `/codingPlatform/PracticeCode?studentId=${params.IndividualReport}&codingOutsourseId=${params.CodingSolution}`
                )
                .then((res) => {
                    setCodingSubmissionData(res.data.shapecode)
                })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error in fetching',
            })
        } finally {
            setLoading(false)
        }
    }, [params])

    useEffect(() => {
        fetchProctoringData(params.report, params.IndividualReport)
        fetchCodingSubmissionData()
    }, [fetchProctoringData, params, fetchCodingSubmissionData])

    useEffect(() => {
        if (proctoringData) {
            setLoading(false)
        }
    }, [proctoringData])

    console.log(codingSubmissionData)

    const sourceCodeDecoder = (sourceCode: string) => {
        if (!codingSubmissionData) return
        const decodedString = atob(sourceCode)

        return decodedString
    }
    const decodedString = sourceCodeDecoder(codingSubmissionData?.source_code)
    const { tabChange, copyPaste, PracticeCode, user } = proctoringData
    const cheatingClass =
        tabChange > 0 && tabChange > 0 ? 'bg-red-600' : 'bg-green-400'

    console.log(decodedString)
    return (
        <MaxWidthWrapper>
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
            <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-2/5 ">
                <div className="flex flex-col w-full justify-between   ">
                    <div
                        className={`flex items-center justify-between p-4 rounded-md ${cheatingClass} `}
                    >
                        <h1 className="text-xl text-start font-semibold text-gray-800  dark:text-white ">
                            Total Score:
                        </h1>
                        <p
                            className={`font-semibold ${
                                cheatingClass ? 'text-white' : 'text-black'
                            }`}
                        >
                            {PracticeCode?.needCodingScore}/
                            {PracticeCode?.totalCodingScore}
                        </p>
                    </div>
                    <div className="flex flex-start p-4 gap-x-4">
                        <div>
                            <h1 className="text-start font-bold">
                                {copyPaste}
                            </h1>
                            <p className="text-gray-500 text-start">
                                Copy Paste
                            </p>
                        </div>
                        <div>
                            <h1 className="text-start font-bold">
                                {tabChange}
                            </h1>
                            <p className="text-gray-500">Tab Changes</p>
                        </div>
                        <div>
                            <h1 className="text-start font-bold">
                                {cheatingClass ? 'Yes' : 'No'}
                            </h1>
                            <p className="text-gray-500">Cheating Detected</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="my-5 flex flex-col gap-y-3 text-left ">
                <h1 className="text-left font-semibold">Student Answers</h1>
                <div className="flex font-semibold gap-x-3 ">
                    <h1>Answer:</h1>
                    <p>{decodedString}</p>
                </div>
            </div>
        </MaxWidthWrapper>
    )
}

export default Page
