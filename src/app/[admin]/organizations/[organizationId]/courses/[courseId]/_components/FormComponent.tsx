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
import { FormComponentProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { FeedbackSubmissionSkeleton } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'

import { useParams } from 'next/navigation'
import { getUser } from '@/store/store'
import { CAREER_TOUR_BOOTCAMP_IDS } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const FormComponent = ({
    bootcampId,
    moduleId,
    data,
    moduleName,
    totalStudents,
}: FormComponentProps) => {
    const { organizationId } = useParams()
    const [downloading, setDownloading] = useState(false)
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId
    const isCareerTourBootcamp = CAREER_TOUR_BOOTCAMP_IDS.includes(Number(bootcampId))

    const handleDownloadCsv = async () => {
        if (!bootcampId || !moduleId || !data?.id) return

        setDownloading(true)
        try {
            const response = await api.get(
                `/submission/formsStatus/${bootcampId}/${moduleId}?chapterId=${data.id}&limit=10000&offset=0`
            )

            const allStudents: any[] = response.data.combinedData || []

            if (allStudents.length === 0) return

            // ── Determine the max number of questions across all submitted students ──
            const maxQuestions = allStudents.reduce((max: number, s: any) => {
                return Math.max(max, (s.formResponses || []).length)
            }, 0)

            const escapeCell = (value: any): string => {
                const str = (value ?? '').toString().replace(/"/g, '""')
                return `"${str}"`
            }

            // ── Fixed headers ──
            const fixedHeaders = [
                'Student Name',
                ...(isCareerTourBootcamp ? ['Student ID'] : []),
                'Email',
                'Batch',
                'Status',
                'Submitted At',
            ]

            // ── Dynamic question headers ──
            const questionHeaders: string[] = []
            for (let i = 1; i <= maxQuestions; i++) {
                questionHeaders.push(
                    `Q${i}: Question`,
                    `Q${i}: Question Type`,
                    `Q${i}: Options`,
                    `Q${i}: Chosen Options`,
                    `Q${i}: Selected Answers`,
                    `Q${i}: Required`,
                    `Q${i}: Answered At`,
                )
            }

            const headerRow = [...fixedHeaders, ...questionHeaders].map(escapeCell).join(',')

            // ── Data rows ──
            const dataRows = allStudents.map((student: any) => {
                const fixedCells = [
                    student.name || '',
                    ...(isCareerTourBootcamp ? [student.studentId ?? 'NA'] : []),
                    student.email || 'NA',
                    student.batchName || '',
                    student.status || '',
                    student.submittedAt
                        ? moment(student.submittedAt).utc().format('DD MMM YYYY, HH:mm')
                        : 'NA',
                ]

                const responseCells: string[] = []
                const responses: any[] = student.formResponses || []

                for (let i = 0; i < maxQuestions; i++) {
                    const r = responses[i]
                    if (!r) {
                        responseCells.push('', '', '', '', '', '', '')
                    } else {
                        const optionsStr = r.options && typeof r.options === 'object'
                            ? Object.entries(r.options)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' | ')
                            : 'NA'

                        const chosenOptionsStr = Array.isArray(r.chosenOptions) && r.chosenOptions.length > 0
                            ? r.chosenOptions.join(', ')
                            : r.answer ?? 'NA'

                        const selectedAnswersStr = Array.isArray(r.selectedAnswers) && r.selectedAnswers.length > 0
                            ? r.selectedAnswers.join(', ')
                            : r.answer ?? 'NA'

                        responseCells.push(
                            r.question || '',
                            r.questionType || '',
                            optionsStr,
                            chosenOptionsStr,
                            selectedAnswersStr,
                            r.isRequired ? 'Yes' : 'No',
                            r.answeredAt
                                ? moment(r.answeredAt).utc().format('DD MMM YYYY, HH:mm')
                                : 'NA',
                        )
                    }
                }

                return [...fixedCells, ...responseCells].map(escapeCell).join(',')
            })

            const csvContent = [headerRow, ...dataRows].join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `feedback_${data.title || `chapter-${data.id}`}_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('CSV download error', error)
        } finally {
            setDownloading(false)
        }
    }
    return (
        <div className="relative bg-card border border-border rounded-md p-4 hover:shadow-lg transition-shadow w-full">
            <div className="flex flex-col w-full justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-20">
                    <div className="p-2 rounded-md flex-shrink-0">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="font-medium text-base truncate">{data.title}</h3>
                            </TooltipTrigger>
                            <TooltipContent>
                                {data.title}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                                <ArrowDownToLine size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                            </Button>

                            <Link
                                href={{
                                pathname: `/${userRole}/organizations/${orgId}/courses/${bootcampId}/submissionForm/${data.id}`,
                                query: { moduleId: moduleId, },
                                }}
                            >
                                <Button 
                                    variant="ghost" 
                                    className="px-1 hover:bg-white-500 hover:text-gray-700 transition-colors"
                                    title={'View Submissions'}
                                >
                                    <Eye size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-[2px] mt-2">
                        <div className="relative group">
                            <button  disabled className="px-1 cursor-not-allowed">
                                <ArrowDownToLine size={20} className="text-gray-400 dark:text-gray-500" />
                            </button>

                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                No submissions available
                            </div>
                        </div>

                        <div className="relative group">
                            <button  disabled className="px-1 cursor-not-allowed">
                                <Eye size={20} className="ml-1 text-gray-400 dark:text-gray-500" />
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
