'use client'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

type Props = {
    bootcampId: number
    moduleId: number
    totalStudents: number
    data: any
    moduleName: string
}

const FormComponent = (props: Props) => {
    const color = getAssesmentBackgroundColorClass(
        props.totalStudents,
        props.data.submitStudents
    )
    return (
        <div className="lg:flex h-[220px] w-full shadow-[0_4px_4px_rgb(0,0,0,0.12)] my-5 rounded-md p-4">
            <div className="flex flex-col w-full justify-between py-2 lg:mx-2">
                <h1 className="text-md text-start font-semibold text-gray-800 dark:text-white">
                    {props.data.title}
                </h1>
                <p className="text-md text-start">{props.moduleName}</p>

                <div className="flex  justify-between gap-x-2 w-full">
                    <div className="flex items-center gap-x-2 justify-between">
                        <div
                            className={`w-2 h-2 rounded-full flex items-center justify-center cursor-pointer ${color}`}
                        ></div>
                        <h3>
                            {props.data.submitStudents}/{props.totalStudents}
                        </h3>

                        <h3 className="text-gray-400 font-semibold ">
                            Submissions
                        </h3>
                    </div>
                </div>
                <div className="flex items-center ml-auto">
                    {props.data.submitStudents > 0 ? (
                        <Link
                            href={{
                                pathname: `/admin/courses/${props.bootcampId}/submissionForm/${props.data.id}`,
                                query: {
                                    moduleId: props.moduleId,
                                },
                            }}
                        >
                            <div className="flex items-center text-secondary hover:bg-popover">
                                <Button variant="ghost">
                                    View Submissions
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center cursor-no-drop text-secondary hover:bg-popover">
                            <Button
                                variant="ghost"
                                disabled={props.data.submitStudents === 0}
                            >
                                View Submissions
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FormComponent
