import { ArrowDownToLine } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'
import { api } from '@/utils/axios.config'
type Props = {
    title: string
    studentsSubmitted: number
    totalSubmissions: number
    courseId: number
    id: string
    moduleId: any
}

const SubmissionComponent = (props: Props) => {
    const handleDownloadPdf = async (id: any) => {
        const apiUrl = `submission/practiseProblemStatus/${props.moduleId}?chapterId=365&questionId=102`

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
                    { header: 'Staatus', dataKey: 'status' },
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
        <div className="lg:flex h-[100px] shadow-md rounded-md p-4 relative">
            <div className="flex flex-col justify-between flex-grow py-2 lg:mx-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-sm lg:text-base text-start font-medium text-gray-900 dark:text-white">
                        {props.title}
                    </h1>
                    <div className="relative group">
                        <button
                            className={`ml-2 cursor-pointer ${
                                isDisabled
                                    ? 'text-gray-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={isDisabled ? undefined : handleDownloadPdf}
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
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-start flex gap-x-2">
                        <div className="flex items-center justify-center">
                            <div
                                className={`w-2 h-2 rounded-full flex items-center justify-center ${
                                    submissionPercentage >= 0.8
                                        ? 'bg-green-300'
                                        : submissionPercentage <= 0.8 &&
                                          submissionPercentage >= 0.5
                                        ? 'bg-yellow-300'
                                        : 'bg-red-500'
                                }`}
                            ></div>
                        </div>
                        <h3>
                            {props.studentsSubmitted} / {props.totalSubmissions}
                        </h3>

                        {/* Conditionally rendering Link for Submissions */}
                        {hasSubmissions ? (
                            <Link
                                href={`/admin/courses/${props.courseId}/submissionProblems/${props.moduleId}`}
                            >
                                <h3 className="font-semibold cursor-pointer">
                                    Submissions
                                </h3>
                            </Link>
                        ) : (
                            <h3 className="text-gray-400 font-semibold cursor-not-allowed">
                                Submissions
                            </h3>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SubmissionComponent
