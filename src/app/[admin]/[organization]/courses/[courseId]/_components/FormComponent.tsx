'use client'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight, MessageSquare, Eye, Download, DownloadIcon,ArrowDownToLine } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import moment from 'moment'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import { FormComponentProps } from '@/app/[admin]/[organization]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { FeedbackSubmissionSkeleton } from '@/app/[admin]/[organization]/courses/[courseId]/_components/adminSkeleton'
import useDownloadCsv from '@/hooks/useDownloadCsv'
import { usePathname } from 'next/navigation'
import { getUser } from '@/store/store'

const FormComponent = ({
    bootcampId,
    moduleId,
    data,
    moduleName,
    totalStudents,
}: FormComponentProps) => {
    const { downloadCsv } = useDownloadCsv()
    const [downloading, setDownloading] = useState(false)
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    const handleDownloadCsv = () => {
        if (!bootcampId || !moduleId || !data?.id) return
    
        downloadCsv({
          endpoint: `/submission/formsStatus/${bootcampId}/${moduleId}?chapterId=${data.id}`,
          fileName: `form-status-${bootcampId}-${moduleId}-chapter-${data.id}`,
      
          dataPath: 'combinedData',
      
          columns: [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Status', key: 'status' },
            { header: 'Submitted At', key: 'submittedAt' },
          ],
      
          mapData: (item) => ({
            name: item.name || 'N/A',
            email: item.email || 'N/A',
            status: item.status || 'N/A',
            submittedAt: item.submittedAt
              ? moment(item.submittedAt).utc().format('DD MMM YYYY, HH:mm')
              : 'N/A',
          }),
        })
    }
    return (
        <div className="relative bg-card border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full">
            <div className="flex flex-col w-full justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="font-medium text-base">{data.title}</h3>
                </div>
                <div className="absolute top-2 right-2">
                    {data.submitStudents > 0 ? (
                        <div className="flex items-center gap-[2px]">
                            <Button
                                variant="ghost"
                                className="px-1 hover:bg-white-500 hover:text-gray-700 transition-colors"
                                onClick={handleDownloadCsv}
                                disabled={downloading}
                            >
                                <ArrowDownToLine size={20} className="text-gray-500" />
                            </Button>

                            <Link
                                href={{
                                pathname: `/${userRole}/${orgName}/courses/${bootcampId}/submissionForm/${data.id}`,
                                query: { moduleId: moduleId, },
                                }}
                            >
                                <Button 
                                    variant="ghost" 
                                    className="px-1 hover:bg-white-500 hover:text-gray-700 transition-colors"
                                    title={'View Submissions'}
                                >
                                    <Eye size={20} className="text-gray-500" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-[2px] mt-2">
                        <div className="relative group">
                            <button  disabled className="px-1 cursor-not-allowed">
                                <ArrowDownToLine size={20} className="text-gray-400" />
                            </button>

                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                No submissions available
                            </div>
                        </div>

                        <div className="relative group">
                            <button  disabled className="px-1 cursor-not-allowed">
                                <Eye size={20} className="ml-1 text-gray-400" />
                            </button>

                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                No submissions available
                            </div>
                        </div>
                        </div>
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
