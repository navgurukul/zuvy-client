import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
    totalCodingChallenges: number
    correctedCodingChallenges: number
    correctedMcqs: number
    totalCorrectedMcqs: number
    openEndedCorrect: number
    totalOpenEnded: number
    totalScore: number
    score: number
    copyPaste: string
    tabchanges: number
    embeddedSearch: number
    submissionType: string
}

const OverviewComponent = (props: Props) => {
    return (
        <div className="my-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md ">
                    <div className="flex flex-col w-full justify-between">
                        <div className="flex items-center p-4 justify-between rounded-md bg-orange-300">
                            <h1 className="text-xl text-start font-semibold text-gray-800 dark:text-white">
                                Total % Obtained
                            </h1>
                            <h1 className="font-bold">
                                {Math.floor(props.score)}%
                            </h1>
                        </div>
                        <div className="flex flex-start gap-x-3 p-3">
                            <>
                                {props.totalCodingChallenges > 0 && (
                                    <div>
                                        <h1 className="text-start font-bold">
                                            {props.totalCodingChallenges}
                                        </h1>
                                        <p className="text-gray-500 text-start">
                                            Coding Questions
                                        </p>
                                    </div>
                                )}

                                {props.totalCorrectedMcqs > 0 && (
                                    <div>
                                        <h1 className="text-start font-bold">
                                            {props.totalCorrectedMcqs}
                                        </h1>
                                        <p className="text-gray-500 text-start">
                                            MCQs
                                        </p>
                                    </div>
                                )}

                                {props.totalOpenEnded > 0 && (
                                    <div>
                                        <h1 className="text-start font-bold">
                                            {props.totalOpenEnded}
                                        </h1>
                                        <p className="text-gray-500 text-start">
                                            Open-Ended
                                        </p>
                                    </div>
                                )}
                            </>
                        </div>
                    </div>
                </div>

                <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md">
                    <div className="flex flex-col w-full justify-between">
                        <div className="flex items-center justify-between p-4  rounded-md  bg-green-300 ">
                            <h1 className="text-xl text-start font-semibold text-gray-800 dark:text-white">
                                Proctoring Report
                            </h1>
                        </div>
                        <div className="flex flex-start p-3 gap-x-3">
                            <div>
                                <h1 className="text-start font-bold">
                                    {props.copyPaste}
                                </h1>
                                <p className="text-gray-500 text-start">
                                    Copy Paste
                                </p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {props.tabchanges}
                                </h1>
                                <p className="text-gray-500">Tab Changes</p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {props.embeddedSearch}
                                </h1>
                                <p className="text-gray-500">Embedded Search</p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold capitalize">
                                    {props.submissionType}
                                </h1>
                                <p className="text-gray-500">Submission Type</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewComponent
