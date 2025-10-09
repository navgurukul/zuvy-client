import { ArrowDownToLine, Code, ChevronRight,Eye } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'
import { api } from '@/utils/axios.config'
import { SubmissionComponentProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SubmissionComponent = (props: SubmissionComponentProps) => {
    const handleDownloadPdf = async (id: number) => {
        const apiUrl = `submission/practiseProblemStatus/${props.moduleId}?chapterId=${props.chapterId}&questionId=${props.questionId}`

        async function fetchData() {
            try {
                const response = await api.get(apiUrl)
                const assessments = response.data.data
                const doc = new jsPDF()

                // Title Styling
                doc.setFontSize(18)
                doc.setFont('Regular', 'normal')

                doc.setFontSize(15)
                doc.setFont('Regular', 'normal')
                doc.text('List of Students-:', 14, 23) // Closer to the table

                // Define columns for the table
                const columns = [
                    { header: 'Name', dataKey: 'name' },
                    { header: 'Email', dataKey: 'email' },
                    { header: 'Status', dataKey: 'status' },
                ]

                // Prepare rows for the table
                const rows = assessments.map(
                    (assessment: {
                        name: string
                        emailId: string
                        status: string
                    }) => ({
                        name: assessment.name || 'N/A',
                        email: assessment.emailId || 'N/A',
                        status: assessment.status || 'N/A', // Correctly mapping status
                    })
                )

                // Use autoTable to create the table in the PDF
                autoTable(doc, {
                    head: [columns.map((col) => col.header)],
                    body: rows.map(
                        (row: {
                            name: string
                            email: string
                            status: string
                        }) => [row.name, row.email, row.status]
                    ), // Ensure status is used here
                    startY: 25,
                    margin: { horizontal: 10 },
                    styles: { overflow: 'linebreak', halign: 'center' },
                    headStyles: { fillColor: [22, 160, 133] },
                    theme: 'grid',
                })

                // Save the document
                doc.save(`${props.title}.pdf`)
            } catch (error) {}
        }

        fetchData()
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
        <div className="bg-muted border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full mb-5">
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
                                    ? 'text-gray-400 cursor-no-drop'
                                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                            }`}
                            onClick={
                                isDisabled ? undefined : () => handleDownloadPdf
                            }
                            aria-label="Download full report"
                            disabled={isDisabled} // Disable button
                        >
                            <ArrowDownToLine size={20} />
                        </button>
                        <div
                            className={`absolute right-0 bottom-full mb-2 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded group-hover:block whitespace-nowrap ${
                                isDisabled ? 'hidden' : 'block'
                            }`}
                        >
                            {isDisabled
                                ? ' No submissions available.'
                                : 'Download full report'}
                        </div>
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
                                <div className="flex items-center text-sm font-medium text-gray-400 cursor-not-allowed">
                                    <Eye className="text-gray-400 mb-2" size={20} />
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
