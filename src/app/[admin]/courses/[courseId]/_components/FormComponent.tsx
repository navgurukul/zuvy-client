'use client'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { ChevronRight, MessageSquare, Eye, Download, DownloadIcon } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import moment from 'moment'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import { FormComponentProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { FeedbackSubmissionSkeleton } from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
const FormComponent = ({
    bootcampId,
    moduleId,
    data,
    moduleName,
    totalStudents,
}: FormComponentProps) => {
    const [downloading, setDownloading] = useState(false)

    const handleDownloadStatus = async () => {
        if (!bootcampId || !moduleId || !data?.id) return
        try {
            setDownloading(true)
            const resp = await api.get(`/submission/formsStatus/${bootcampId}/${moduleId}`, {
                params: { chapterId: data.id },
            })
            const payload = resp.data
            const rows: any[] = payload?.combinedData || []

            // Use landscape to give more horizontal space for table columns
            const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })
            const title = `Form Submission data`
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text(title, 40, 40)

            const head = [['S.No', 'Name', 'Email', 'Status', 'Submitted At']]
            const body = rows.map((r: any, idx: number) => {
                const submittedRaw = r.submittedAt || r.createdAt
                const submittedFormatted = submittedRaw
                    ? moment(submittedRaw).utc().format('DD MMM YYYY, HH:mm')
                    : 'N/A'

                return [
                    String(idx + 1),
                    r.name || 'N/A',
                    r.email || 'N/A',
                    r.status || 'N/A',
                    submittedFormatted,
                ]
            })

            autoTable(doc, {
                head,
                body,
                startY: 64,
                // default styles for all cells, include border color/width
                styles: { fontSize: 10, cellPadding: 6, textColor: 0, fontStyle: 'normal', lineColor: [220, 220, 220], lineWidth: 0.4 },
                // header styles (bold, dark text on light gray background)
                headStyles: { fillColor: [22, 160, 133] , textColor: 255, fontStyle: 'bold', lineColor: [200,200,200], lineWidth: 0.6 },
                // force body rows to have white background and black, semibold text
                bodyStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'normal', lineColor: [220,220,220], lineWidth: 0.4 },
                // disable alternate row shading by making alternate same as body
                alternateRowStyles: { fillColor: [255, 255, 255] },
                margin: { left: 40, right: 20 },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 180 },
                    2: { cellWidth: 250 },
                    3: { cellWidth: 100 },
                    4: { cellWidth: 180 },
                },
            })

            doc.save(`form-status-${bootcampId}-${moduleId}-chapter-${data.id}.pdf`)
        } catch (error) {
            console.error('Error downloading form status PDF', error)
        } finally {
            setDownloading(false)
        }
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
                <div className="absolute top-2 right-1">
                    {data.submitStudents > 0 ? (
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                className="hover:bg-white-600 hover:text-gray-700 transition-colors"
                                onClick={handleDownloadStatus}
                                disabled={downloading}
                                title={downloading ? 'Preparing PDF...' : 'Download status PDF'}
                            >
                                <DownloadIcon size={18} className="" />
                            </Button>

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
                                    title={'View Submissions'}

                                >
                                    <Eye size={20} className="text-gray-500" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Button
                            className="text-gray-400"
                            variant="ghost"
                            disabled={data.submitStudents === 0}
                        >
                            <Eye size={20} className="ml-1" />
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
