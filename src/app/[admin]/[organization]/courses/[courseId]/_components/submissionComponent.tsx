import { ArrowDownToLine, Code, ChevronRight,Eye } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'
import { api } from '@/utils/axios.config'
import { SubmissionComponentProps } from '@/app/[admin]/[organization]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useDownloadCsv from '@/hooks/useDownloadCsv'

const SubmissionComponent = (props: SubmissionComponentProps) => {
    const { downloadCsv } = useDownloadCsv()
    const handleDownloadCsv = () => {
        if (!props.moduleId || !props.chapterId || !props.questionId) return
        downloadCsv({
          endpoint: `submission/practiseProblemStatus/${props.moduleId}?chapterId=${props.chapterId}&questionId=${props.questionId}`,
          fileName: props.title || 'practice-problem',
      
          dataPath: 'data',
      
          columns: [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Status', key: 'status' },
          ],
      
          mapData: (item) => ({
            name: item.name || 'N/A',
            email: item.email || 'N/A',
            status: item.status || 'N/A',
          }),
        })
      }
      
    const submissionPercentage =
        props.totalSubmissions > 0
            ? props.studentsSubmitted / props.totalSubmissions
            : 0
    const isDisabled = props.studentsSubmitted === 0

    // Check if there are no submissions
    const hasSubmissions =
        props.totalSubmissions > 0 && props.studentsSubmitted > 0

    return (
        <div className="bg-card border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full mb-5">
            <div className="flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md">
                            <Code className="w-4 h-4" />
                        </div>
                        <h3 className="font-medium text-base">{props.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                    <div className="relative group">
                        <button
                            className={`ml-2 ${
                                isDisabled
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                            }`}
                            onClick={
                                isDisabled ? undefined : () => handleDownloadCsv()
                            }
                            aria-label="Download full report"
                            disabled={isDisabled} // Disable button
                        >
                            <ArrowDownToLine size={20} />
                        </button>
                        {isDisabled && (
                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap hidden group-hover:block">
                            No submissions to view
                            </div>
                        )}
                    </div>
                    <div className="relative group">
                            {hasSubmissions ? (
                                <Link
                                    href={`/admin/courses/${props.courseId}/submissionProblems/${props.moduleId}?praticeProblems=${props.id}`}
                                >
                                    <div>
                                        <Eye className="text-gray-500 mb-2 hover:text-gray-700" size={20} />
                                    </div>
                                </Link>
                            ) : (
                            <div className="group relative">
                                <button
                                className="text-gray-400 cursor-not-allowed"
                                onClick={(e) => e.preventDefault()}
                                disabled
                            >
                                <Eye size={20} />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap hidden group-hover:block">
                                No submissions to view
                            </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* <div className="flex justify-between items-center"> */}
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Badge
                                variant="outline"
                                className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                            >
                                {props.studentsSubmitted} submissions
                            </Badge>
                        </div>
                        <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                            {props.totalSubmissions - props.studentsSubmitted} pending
                        </Badge>
                    </div>
            </div>
        </div>
    )
}

export default SubmissionComponent
