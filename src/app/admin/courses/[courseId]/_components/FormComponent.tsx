'use client'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import { FormComponentProps } from "@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType"

const FormComponent = ({
    bootcampId,
    moduleId,
    data,
    moduleName,
}: FormComponentProps) => {
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
        <div className="bg-muted border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full">
            <div className="flex flex-col w-full justify-between py-2 lg:mx-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="font-medium text-base text-gray-900">{data.title}</h3>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="flex items-center gap-1">
                        <Badge
                            variant="outline"
                            className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                        >
                            {data.submitStudents} submissions
                        </Badge>
                    </div>
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    >
                        {totalStudents - data.submitStudents} pending
                    </Badge>
                </div>
                <div className="mt-4 flex justify-end">
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
                                    <ChevronRight size={16}  className="ml-1" />
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
                                <ChevronRight size={16}  className="ml-1" />
                            </Button>
                        </h1>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FormComponent
