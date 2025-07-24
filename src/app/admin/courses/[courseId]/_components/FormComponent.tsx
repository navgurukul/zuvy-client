'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/utils/axios.config'

type Props = {
    bootcampId: number
    moduleId: number
    data: any
    moduleName: string
    debouncedSearch: string
}

const FormComponent = ({
    bootcampId,
    moduleId,
    data,
    moduleName,
}: Props) => {
    const [totalStudents, setTotalStudents] = useState(0)

    useEffect(() => {
        const fetchFormDataHandler = async () => {
            const url = `/submission/submissionsOfAssignment/${bootcampId}`
            const res = await api.get(url)
            setTotalStudents(res.data.data.totalStudents)
        }

        fetchFormDataHandler()
    }, [bootcampId])

    return (
        <div className="lg:flex h-[220px] w-full shadow-[0_4px_4px_rgb(0,0,0,0.12)] my-5 rounded-md p-4">
            <div className="flex flex-col w-full justify-between py-2 lg:mx-2">
                <h1 className="text-lg text-start font-semibold text-gray-800 dark:text-white">
                    {data.title}
                </h1>
                <p className="text-md text-start">{moduleName}</p>

                <div className="flex  justify-between gap-x-2 w-full">
                    <div className="flex items-center gap-x-2 justify-between">
                        <div
                            className={`h-3 w-3 rounded-full ${
                                data.submitStudents / totalStudents > 0.8
                                    ? 'bg-green-400'
                                    : data.submitStudents / totalStudents >= 0.5
                                    ? 'bg-orange-400'
                                    : 'bg-red-500'
                            }`}
                        />
                        <div className="text-base lg:text-lg font-medium text-gray-700">
                            {data.submitStudents}/{totalStudents}
                        </div>

                        <p className="text-gray-700 font-normal text-md">
                            Submissions
                        </p>
                    </div>
                </div>
                <div className="flex items-center ml-auto">
                    {data.submitStudents > 0 ? (
                        <Link
                            href={{
                                pathname: `/admin/courses/${bootcampId}/submissionForm/${data.id}`,
                                query: {
                                    moduleId: moduleId,
                                },
                            }}
                        >
                            <h1 className="w-full text-center text-sm flex lg:text-right text-green-700">
                                {' '}
                                <Button
                                    variant="ghost"
                                    className="text-green-700"
                                >
                                    View Submissions
                                    <ChevronRight size={20} />
                                </Button>
                            </h1>
                        </Link>
                    ) : (
                        <h1 className="w-full text-center text-sm flex lg:text-right text-green-700">
                            <Button
                                className="text-green-700"
                                variant="ghost"
                                disabled={data.submitStudents === 0}
                            >
                                View Submissions
                                <ChevronRight size={20} />
                            </Button>
                        </h1>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FormComponent
