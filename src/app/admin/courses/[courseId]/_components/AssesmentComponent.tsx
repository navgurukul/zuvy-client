'use client'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { CheckCircle, ChevronRight, Code, FileText } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

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

const AssesmentComponent = (props: Props) => {
    const color = getAssesmentBackgroundColorClass(
        props.totalSubmissions,
        props.studentsSubmitted
    )
    return (
        <div className="lg:flex h-auto lg:h-[280px] w-full lg:w-4/5 shadow-lg backdrop-blur-lg  my-5 rounded-lg p-4 lg:p-6 bg-white dark:bg-gray-800 transition-transform transform hover:shadow-xl">
            <div className="flex flex-col w-full justify-between py-2 lg:mx-4">
                <h1 className="text-base lg:text-lg text-start font-semibold text-gray-900 dark:text-white">
                    {props.title}
                </h1>
                <div className="flex flex-col lg:flex-row justify-start gap-y-3 lg:gap-x-6 my-3">
                    {props.codingChallenges > 0 && (
                        <div className="text-center">
                            <div className="flex items-center justify-center text-lg lg:text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-3 lg:px-4 py-2 rounded-md backdrop-blur-md">
                                <Code className="w-5 lg:w-6 h-5 lg:h-6 text-blue-500 mr-2" />
                                {props.codingChallenges}
                            </div>
                            <p className="text-gray-600 font-semibold text-sm mt-2">
                                Coding Challenges
                            </p>
                        </div>
                    )}
                    {props.mcq > 0 && (
                        <div className="text-center">
                            <div className="flex items-center justify-center text-lg lg:text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-3 lg:px-4 py-2 rounded-md backdrop-blur-md">
                                <CheckCircle className="w-5 lg:w-6 h-5 lg:h-6 text-green-500 mr-2" />
                                {props.mcq}
                            </div>
                            <p className="text-gray-600 font-semibold text-sm mt-2">
                                MCQs
                            </p>
                        </div>
                    )}
                    {props.openEnded > 0 && (
                        <div className="text-center">
                            <div className="flex items-center justify-center text-lg lg:text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-3 lg:px-4 py-2 rounded-md backdrop-blur-md">
                                <FileText className="w-5 lg:w-6 h-5 lg:h-6 text-yellow-500 mr-2" />
                                {props.openEnded}
                            </div>
                            <p className="text-gray-600 font-semibold text-sm mt-2">
                                Open-Ended
                            </p>
                        </div>
                    )}
                </div>
                <div className="">
                    <div className="flex flex-col lg:flex-row justify-start gap-y-3 lg:gap-x-6 my-3 pb-3">
                        {/* <div className=" gap-x-2 flex items-center text-sm justify-center  lg:text-md font-semibold text-secondary bg-secondary bg-opacity-30 px-3 lg:px-4 py-2 rounded-md backdrop-blur-md">
                            <h3 className="text-base   text-gray-800 dark:text-gray-200">
                                {props.qualifiedStudents}
                            </h3>
                            <h3 className="text-secondary font-medium ">
                                Qualified Students
                            </h3>
                        </div> */}
                        <div className="text-center">
                            <div className="flex items-center justify-center text-lg lg:text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-3 lg:px-4 py-2 rounded-md backdrop-blur-md">
                                {props.qualifiedStudents}
                            </div>
                            <p className="text-gray-600 font-semibold text-sm mt-2">
                                Qualified Students
                            </p>
                        </div>
                        {/* <div className="flex items-center gap-x-2">
                            <h3 className="text-base   text-gray-800 dark:text-gray-200">
                                {props.studentsSubmitted}/
                                {props.totalSubmissions}
                            </h3>
                            <h3 className="text-secondary font-medium">
                                Submissions
                            </h3>
                        </div> */}
                        <div className="text-center">
                            <div className="flex items-center justify-center text-lg lg:text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-3 lg:px-4 py-2 rounded-md backdrop-blur-md">
                                {props.studentsSubmitted}/
                                {props.totalSubmissions}
                            </div>
                            <p className="text-gray-600 font-semibold text-sm mt-2">
                                Submitted Students
                            </p>
                        </div>
                        <Link
                            href={`/admin/courses/${props.bootcampId}/submissionAssesments/${props.id}`}
                            className="w-full lg:w-auto"
                        >
                            <Button className="flex justify-center lg:justify-start items-center w-full mt-1 lg:w-auto py-2 bg-secondary text-white font-bold rounded-md shadow-md transition-all duration-300">
                                <h1 className="w-full text-center">
                                    View Submission
                                </h1>
                                <ChevronRight size={20} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssesmentComponent
