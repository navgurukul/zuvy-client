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
        <div className="lg:flex h-[240px] w-4/5 shadow-lg my-5 rounded-lg p-6 bg-white dark:bg-gray-800 transition-transform transform hover:shadow-xl">
            <div className="flex flex-col w-full justify-between py-2 lg:mx-4">
                <h1 className="text-lg text-start font-bold text-gray-900 dark:text-white">
                    {props.title}
                </h1>
                <div className="flex justify-start gap-x-6 my-3">
                    <div className="text-center">
                        <div className="flex items-center justify-center text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-4 py-2 rounded-md backdrop-blur-md">
                            <Code className="w-6 h-6 text-blue-500 mr-2" />
                            {props.codingChallenges}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                            Coding Challenges
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-4 py-2 rounded-md backdrop-blur-md">
                            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                            {props.mcq}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                            MCQs
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center text-xl font-semibold text-secondary bg-secondary bg-opacity-30 px-4 py-2 rounded-md backdrop-blur-md">
                            <FileText className="w-6 h-6 text-yellow-500 mr-2" />
                            {props.openEnded}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                            Open-Ended
                        </p>
                    </div>
                </div>
                <div className="flex justify-between items-center gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <div className="flex  items-center gap-x-2 ">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                {props.qualifiedStudents}
                            </h3>
                            <h3 className="text-secondary font-medium">
                                Qualified Students
                            </h3>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                {props.studentsSubmitted}/
                                {props.totalSubmissions}
                            </h3>
                            <h3 className="text-secondary font-medium">
                                Submission
                            </h3>
                        </div>
                    </div>
                    <Link
                        href={`/admin/courses/${props.bootcampId}/submissionAssesments/${props.id}`}
                    >
                        <Button className="flex items-center px-4 py-2 bg-secondary text-white font-bold rounded-md shadow-md hover:bg-secondary-dark transition-all duration-300">
                            View Submissions
                            <ChevronRight size={20} className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AssesmentComponent
