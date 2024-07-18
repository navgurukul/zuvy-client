'use client'
import React, { useCallback, useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'

import Editor from '@monaco-editor/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProctoringDataStore } from '@/store/store'
import { paramsType } from '../../ViewSolutionOpenEnded/page'
import { toast } from '@/components/ui/use-toast'
import dynamic from 'next/dynamic'

import { api } from '@/utils/axios.config'

type Props = {}

const Page = ({ params }: { params: paramsType }) => {
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    const [codingSubmissionData, setCodingSubmissionData] = useState<any>()
    const [codingQuestionData, setcodingQuestionData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)

    const fetchCodingSubmissionData = useCallback(async () => {
        try {
            await api
                .get(
                    `/codingPlatform/PracticeCode?studentId=${params.IndividualReport}&codingOutsourseId=${params.CodingSolution}`
                )
                .then((res) => {
                    setCodingSubmissionData(res.data.shapecode)
                    setcodingQuestionData(res.data.questionInfo)
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

    const sourceCodeDecoder = (sourceCode: string) => {
        if (!codingSubmissionData) return
        const decodedString = atob(sourceCode)

        return decodedString
    }
    const decodedString = sourceCodeDecoder(codingSubmissionData?.source_code)
    const { tabChange, copyPaste, PracticeCode, user } = proctoringData
    const cheatingClass =
        tabChange > 0 && tabChange > 0 ? 'bg-red-600' : 'bg-green-400'

    console.log(codingQuestionData)

    return (
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
                            {user?.name}- Coding Questions Report
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
            {/* <div className="my-5 flex flex-col gap-y-3 text-left ">
                <h1 className="text-left font-semibold">Student Answers</h1>
                <div className="flex font-semibold gap-x-3 ">
                    <h1>Answer:</h1>
                    <p>{decodedString}</p>
                </div>
            </div> */}
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full max-w-12xl rounded-lg "
            >
                <ResizablePanel defaultSize={50}>
                    <div className="flex  w-full h-[90vh] my-6">
                        <div className=" flex flex-col items-start space-y-4">
                            <h1 className="text-2xl font-bold capitalize ">
                                {codingQuestionData?.title}
                            </h1>

                            <div>
                                <h2 className="text-xl text-left font-semibold">
                                    Description:
                                </h2>
                                <p>{codingQuestionData?.description}</p>
                            </div>

                            <div className="flex ">
                                <h2 className="text-xl font-semibold">
                                    Examples:
                                </h2>
                                {codingQuestionData?.examples.map(
                                    (example: any, index: number) => (
                                        <div
                                            key={index}
                                            className="pl-4 flex gap-x-3"
                                        >
                                            <p>
                                                Input:{' '}
                                                {example.input.join(', ')}
                                            </p>
                                            <p>
                                                Output:{' '}
                                                {example.output.join(', ')}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex">
                                <h2 className="text-xl font-semibold">
                                    Test Cases:
                                </h2>
                                {codingQuestionData?.testCases.map(
                                    (testCase: any, index: number) => (
                                        <div
                                            key={index}
                                            className="pl-4 flex gap-x-3"
                                        >
                                            <p>
                                                Input:{' '}
                                                {testCase.input.join(', ')}
                                            </p>
                                            <p>
                                                Output:{' '}
                                                {testCase.output.join(', ')}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex items-center gap-x-2">
                                <h2 className="text-xl font-semibold">
                                    Expected Output:
                                </h2>
                                <p>
                                    {codingQuestionData?.expectedOutput.join(
                                        ', '
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={70}>
                            <div className="flex h-full">
                                <div className="w-full max-w-5xl bg-muted p-2">
                                    <form>
                                        <div>
                                            {/* <div className="flex justify-between p-2"></div */}
                                            <Editor
                                                height="52vh"
                                                theme="vs-dark"
                                                value={decodedString}
                                                className={`p-6 ${cheatingClass}`}
                                                options={{
                                                    readOnly: true,
                                                }}
                                            />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </MaxWidthWrapper>
    )
}

export default Page
