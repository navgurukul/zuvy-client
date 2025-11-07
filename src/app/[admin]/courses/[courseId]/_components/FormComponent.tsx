'use client'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight, MessageSquare, Eye } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import { FormComponentProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import {FeedbackSubmissionSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
const FormComponent = ({
    bootcampId,
    moduleId,
    data,
    moduleName,
}: FormComponentProps) => {
    const [totalStudents, setTotalStudents] = useState(0)
     const [loading, setLoading] = useState(true)

    useEffect(() => {
        // const fetchFormDataHandler = async () => {
        //     const url = `/submission/submissionsOfAssignment/${bootcampId}`
        //     const res = await api.get(url)
        //     setTotalStudents(res.data.data.totalStudents)
        // }
          const fetchFormDataHandler = async () => {
      try {
        setLoading(true)
        const url = `/submission/submissionsOfAssignment/${bootcampId}`
        const res = await api.get(url)
        setTotalStudents(res.data.data.totalStudents)
      } catch (error) {
        console.error('Error fetching form data', error)
      } finally {
        setLoading(false)
      }
    }

        fetchFormDataHandler()
    }, [bootcampId])

    if (loading) {
      return <FeedbackSubmissionSkeleton/>
    }
    return (
        <div className="relative bg-card border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full">
            <div className="flex flex-col w-full justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2rounded-md">
                        <MessageSquare className="w-4 h-4"/>
                    </div>
                    <h3 className="font-medium text-base">{data.title}</h3>
                </div>
                <div className="absolute top-2 right-1">
                {data.submitStudents > 0 ? (
                        <Link
                            href={{
                                pathname: `/admin/courses/${bootcampId}/submissionForm/${data.id}`,
                                query: {
                                    moduleId: moduleId,
                                },
                            }}
                        >
                                <Button
                                    variant="ghost"
                                    className="hover:bg-white-600 hover:text-gray-700 transition-colors"                               
                                >
                                    
                                    <Eye size={20}  className="text-gray-500" />
                                </Button>
                        </Link>
                    ) : (
                            <Button
                                className="text-gray-400"
                                variant="ghost"
                                disabled={data.submitStudents === 0}
                            >
                                <Eye size={20}  className="ml-1" />
                            </Button>
                    )}
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
            </div>
        </div>
    )
}

export default FormComponent
