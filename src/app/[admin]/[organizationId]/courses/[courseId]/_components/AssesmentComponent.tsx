'use client'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, ChevronRight, ClipboardCheck, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AssesmentComponentProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { getUser } from '@/store/store'

const AssesmentComponent = (props: AssesmentComponentProps) => {
    const isDisabled = props.studentsSubmitted === 0
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    return (
        <div className="bg-card border border-gray-200 rounded-md p-3 hover:shadow-lg transition-shadow w-full mb-4">
            <div className="flex items-start justify-between">
                {/* Icon + Title */}
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md">
                        <ClipboardCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-base">
                        {props.title}
                    </h3>
                </div>

                {/* Dropdown / Download Button */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                    {isDisabled ? (
                        <div className="group relative">
                            <button
                            className="ml-2 text-gray-400 cursor-not-allowed"
                            onClick={(e) => e.preventDefault()}
                            >
                            <ArrowDownToLine size={20} />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded group-hover:block">
                            No submissions available
                            </div>
                        </div>
                        ) : (
                        <button
                            className="ml-2 text-gray-500 hover:text-gray-700"
                            aria-label="Download CSV"
                            onClick={props.onDownloadCsv}
                        >
                            <ArrowDownToLine size={20} />
                        </button>
                        )}
                    </div>
                    {isDisabled ? (
                        <div className="group relative">
                            <button
                                className="text-gray-400 cursor-not-allowed"
                                onClick={(e) => e.preventDefault()}
                                disabled
                            >
                                <Eye size={20} />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded group-hover:block">
                                No submissions to view
                            </div>
                        </div>
                    ) : (
                        <Link
                            href={`/${userRole}/${orgName}/courses/${props.bootcampId}/submissionAssesments/${props.id}`}
                            className="text-gray-500 hover:text-gray-700 mb-2"
                        >
                            <Eye size={20} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Submission + Pending Info */}
            <div className="flex items-center justify-between mt-4 text-sm">
                <Badge
                    variant="outline"
                    className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                >
                    {props.studentsSubmitted} submissions
                </Badge>
                <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                >
                    {props.totalSubmissions - props.studentsSubmitted} pending
                </Badge>
            </div>
        </div>
    )
}

export default AssesmentComponent
