import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import {OverviewComponentProps} from "@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType"

const OverviewComponent = (props: OverviewComponentProps) => {
    return (
        <div className="my-8 px-4 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 justify-center">
                <div className="flex h-[160px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-full md:w-5/6 lg:w-5/6 bg-white">
                    <div className="flex flex-col w-full justify-between">
                        <div className="flex items-center p-3 md:p-4 h-[75px] justify-between rounded-md bg-orange-300">
                            <h1 className="text-semibold text-[15px] font-semibold text-gray-800 dark:text-white">
                                Total Score
                            </h1>
                            <h1 className=" font-semibold text-[15px] text-gray-700">
                                {Math.floor(props.score)}%
                            </h1>
                        </div>
                        <div className="flex flex-col md:flex-row gap-5 p-3 md:p-4">
                            {props.totalCodingChallenges > 0 && (
                                <div className="flex flex-col">
                                    <h1 className="text-sm md:text-base lg:text-lg text-gray-700 font-semibold">
                                        {Math.trunc(props.codingScore)}/{' '}
                                        {props.totalCodingScore}
                                    </h1>
                                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                                        Coding Challenges
                                    </p>
                                </div>
                            )}
                            {props.totalCorrectedMcqs > 0 && (
                                <div className="flex flex-col">
                                    <h1 className="text-sm md:text-base lg:text-lg text-gray-700 font-semibold">
                                        {Math.trunc(props.mcqScore)} /{' '}
                                        {props.totalMcqScore}
                                    </h1>
                                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                                        MCQs
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex h-[160px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-full md:w-5/6 lg:w-5/6 bg-white">
                    <div className="flex flex-col w-full justify-between">
                        {!props?.proctoringData?.canCopyPaste &&
                        !props?.proctoringData?.canTabChange &&
                        !props?.proctoringData?.canScreenExit ? (
                            <div className="flex items-center p-3 md:p-4 h-[75px] justify-between rounded-md bg-red-300">
                                <h1 className="font-semibold text-[15px] text-gray-800 dark:text-white">
                                    No Proctoring Enabled By the Admin
                                </h1>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center p-3 md:p-4 h-[75px] justify-between rounded-md bg-green-300">
                                    <h1 className="font-semibold text-[15px] text-gray-800 dark:text-white">
                                        Proctoring Report
                                    </h1>
                                </div>
                                <div className="flex flex-col md:flex-row p-3 md:p-4 gap-3">
                                    {props?.proctoringData?.canCopyPaste && (
                                        <div className="flex flex-col">
                                            <h1 className="text-sm text-left md:text-base lg:text-lg text-gray-700 font-semibold">
                                                {props.copyPaste ||
                                                props.copyPaste === 0
                                                    ? props.copyPaste
                                                    : 'None'}
                                            </h1>
                                            <p className="text-xs md:text-sm lg:text-base text-gray-500">
                                                Copy Paste
                                            </p>
                                        </div>
                                    )}
                                    {props?.proctoringData?.canTabChange && (
                                        <div className="flex flex-col">
                                            <h1 className="text-sm md:text-base lg:text-lg text-gray-700 font-bold">
                                                {props.tabchanges ||
                                                props.tabchanges === 0
                                                    ? props.tabchanges
                                                    : 'None'}
                                            </h1>
                                            <p className="text-xs md:text-sm lg:text-base text-gray-500">
                                                Tab Changes
                                            </p>
                                        </div>
                                    )}
                                    {props?.proctoringData?.canScreenExit && (
                                        <div className="flex flex-col">
                                            <h1 className="text-sm md:text-base lg:text-lg text-gray-700 font-bold">
                                                {props.fullScreenExit ||
                                                props.fullScreenExit === 0
                                                    ? props.fullScreenExit
                                                    : 'None'}
                                            </h1>
                                            <p className="text-xs md:text-sm lg:text-base text-gray-500">
                                                Full Screen Exit
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewComponent
