'use client'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
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
}

const AssesmentComponent = (props: Props) => {
    const color = getAssesmentBackgroundColorClass(
        props.totalSubmissions,
        props.studentsSubmitted
    )
    return (
        <div className="lg:flex h-[220px] w-full shadow-[0_4px_4px_rgb(0,0,0,0.12)] my-5 rounded-md p-4">
            <div className="flex flex-col w-full justify-between py-2 lg:mx-2">
                <h1 className="text-md text-start font-semibold text-gray-800  dark:text-white ">
                    {props.title}
                </h1>
                <div className="flex flex-start gap-x-4">
                    <div>
                        <h1 className="text-start font-bold">
                            {props.codingChallenges}
                        </h1>
                        <p className="text-gray-500 text-start">
                            Coding Challenges
                        </p>
                    </div>
                    <div>
                        <h1 className="text-start font-bold">{props.mcq}</h1>
                        <p className="text-gray-500 text-start">MCQs</p>
                    </div>
                    <div>
                        <h1 className="text-start font-bold">
                            {props.openEnded}
                        </h1>
                        <p className="text-gray-500">Open-Ended</p>
                    </div>
                </div>
                <div className="flex  justify-between gap-x-2 w-full">
                    <div className="flex items-center gap-x-2 justify-between">
                        <div
                            className={`w-2 h-2 rounded-full flex items-center justify-center cursor-pointer ${color}`}
                        ></div>
                        <h3>
                            {props.studentsSubmitted}/{props.totalSubmissions}
                        </h3>

                        <h3 className="text-gray-400 font-semibold ">
                            Submissions
                        </h3>
                    </div>
                    <Link
                        href={`/admin/courses/${props.bootcampId}/submissionAssesments/${props.id}`}
                    >
                        <Button className=" flex items-center text-white font-bold">
                            View Submissions
                            <ChevronRight size={20} />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AssesmentComponent
