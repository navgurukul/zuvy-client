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
}

const OverviewComponent = (props: Props) => {
    return (
        <div className="my-4">
            <div className="grid grid-cols-1 gap-20   md:grid-cols-2">
                <div className="lg:flex h-[150px]  shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md ">
                    <div className="flex flex-col w-full justify-between   ">
                        <div className="flex items-center p-4 justify-between bg-orange-300 rounded-md">
                            <h1 className="text-xl text-start font-semibold text-gray-800  dark:text-white ">
                                Total Score
                            </h1>
                            <h1 className="font-bold">
                                {props.score}/{props.totalScore}
                            </h1>
                        </div>
                        <div className="flex flex-start gap-x-4 p-4">
                            <div>
                                <h1 className="text-start font-bold">
                                    {props.correctedCodingChallenges}/
                                    {props.totalCodingChallenges}
                                </h1>
                                <p className="text-gray-500 text-start">
                                    Coding Challenges
                                </p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {props.correctedMcqs}/
                                    {props.totalCorrectedMcqs}
                                </h1>
                                <p className="text-gray-500 text-start">MCQs</p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {props.totalOpenEnded}
                                </h1>
                                <p className="text-gray-500">Open-Ended</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md ">
                    <div className="flex flex-col w-full justify-between   ">
                        <div className="flex items-center justify-between p-4 rounded-md bg-green-300">
                            <h1 className="text-xl text-start font-semibold text-gray-800  dark:text-white ">
                                Proctoring Report
                            </h1>
                            <h1 className="font-bold">Favorable</h1>
                        </div>
                        <div className="flex flex-start p-4 gap-x-4">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewComponent
