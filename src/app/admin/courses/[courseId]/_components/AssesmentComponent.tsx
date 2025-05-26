'use client'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import { ArrowDownToLine, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

type Props = {
    title: string
    codingChallenges: number
    mcq: number
    openEnded: number
    studentsSubmitted: number
    totalSubmissions: number
    id: any
    bootcampId: number
    qualifiedStudents: number
}

const AssesmentComponent = (props: Props & { onDownloadClick: () => void }) => {
    const printRef = useRef<HTMLDivElement | null>(null)

    const color = getAssesmentBackgroundColorClass(
        props.totalSubmissions,
        props.studentsSubmitted
    )

    const isDisabled = props.studentsSubmitted === 0

    const handleButtonClick = () => {
        if (props.onDownloadClick) {
            props.onDownloadClick();
        }
    };

    return (
        <div
            ref={printRef}
            className=" relative lg:flex-row h-auto lg:h-[280px] sm:h-[360px] w-full shadow-lg my-5 rounded-lg p-4 lg:p-6 bg-white dark:bg-gray-800 transition-transform transform hover:shadow-xl"
        >
            <div className="w-full justify-between py-2 lg:mx-4 min-h-[250px] sm:min-h-[200px]">
                <div className="flex items-center justify-between">
                    <h1 className="text-sm lg:text-base text-start font-medium text-gray-900 dark:text-white">
                        {props.title}
                    </h1>
                    <div className="relative group">
                        <button
                            className={`ml-2 cursor-pointer ${
                                isDisabled
                                    ? 'text-gray-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={isDisabled ? undefined : handleButtonClick} // Show popup on click
                            aria-label="Download full report"
                            disabled={isDisabled}
                        >
                            <ArrowDownToLine size={20} />
                        </button>
                        {isDisabled && (
                            <div
                            className="absolute right-0 bottom-full mb-2 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap group-hover:block"
                            >
                            No submissions available.
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row justify-start gap-y-3 lg:gap-x-6 my-3 flex-grow">
                    {props.codingChallenges > 0 && (
                        <div className="text-left">
                            <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                {props.codingChallenges}
                            </div>
                            <p className="text-gray-700 font-normal text-md">
                                Coding Challenges
                            </p>
                        </div>
                    )}
                    {props.mcq > 0 && (
                        <div className="text-left">
                            <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                {props.mcq}
                            </div>
                            <p className="text-gray-700 font-normal text-md mt-1">
                                MCQs
                            </p>
                        </div>
                    )}
                    {props.openEnded > 0 && (
                        <div className="text-left">
                            <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                {props.openEnded}
                            </div>
                            <p className="text-gray-700 font-normal text-md">
                                Open-Ended
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-3 lg:gap-x-6 my-3 pb-3 flex-grow">
                    <div className="flex flex-row items-center gap-x-2">
                        <div
                            className={`h-3 w-3 rounded-full ${
                                props.studentsSubmitted /
                                    props.totalSubmissions >
                                0.8
                                    ? 'bg-green-400'
                                    : props.studentsSubmitted /
                                          props.totalSubmissions >=
                                      0.5
                                    ? 'bg-orange-400'
                                    : 'bg-red-500'
                            }`}
                        />
                        <div className="text-base lg:text-lg font-medium text-gray-700">
                            {props.studentsSubmitted}/{props.totalSubmissions}
                        </div>
                        <p className="text-gray-700 font-normal text-md">
                            Submissions
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-x-2">
                        <div className="h-3 w-3 bg-orange-400 rounded-full" />
                        <div className="text-base lg:text-lg font-medium text-gray-700">
                            {props.qualifiedStudents}
                        </div>
                        <p className="text-gray-700 font-normal text-md">
                            Qualified
                        </p>
                    </div>
                </div>
                <div className="flex flex-col  items-end absolute  justify-end bottom-4 right-0 ">
                    <Link
                        href={`/admin/courses/${props.bootcampId}/submissionAssesments/${props.id}`}
                        className="w-full h-full lg:w-auto"
                    >
                        <Button
                            variant="ghost"
                            className="flex h-full justify-center items-center w-full lg:w-auto py-2 text-secondary font-bold rounded-md transition-all duration-300"
                        >
                            <h1 className="w-full text-center flex lg:text-right">
                                View Submission
                                <ChevronRight size={20} className="ml-2" />
                            </h1>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AssesmentComponent
