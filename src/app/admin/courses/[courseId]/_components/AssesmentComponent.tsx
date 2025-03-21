'use client'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import { ArrowDownToLine, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useRef } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'

type Props = {
    title: string
    codingChallenges: number
    mcq: number
    openEnded: number
    studentsSubmitted: number
    totalSubmissions: number
    id: any
    bootcampId: number
    qualifiedStudents: number
}

const AssesmentComponent = (props: Props) => {
    const printRef = useRef<HTMLDivElement | null>(null)

    const handleDownloadPdf = async () => {
        const apiUrl = `/admin/assessment/students/assessment_id${props.id}`

        async function fetchData() {
            try {
                const response = await api.get(apiUrl)
                const assessments = response.data.submitedOutsourseAssessments
                const requiredCodingScore =
                    assessments[0]?.requiredCodingScore || null
                const requiredMcqScore =
                    assessments[0]?.requiredMCQScore || null

                if (!Array.isArray(assessments) || assessments.length === 0) {
                    toast.error('No data available to generate PDF.')
                    return
                }

                const doc = new jsPDF({
                    format: 'a4',
                    orientation: 'landscape',
                })

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text(`Assessment Report`, 10, 10)

                doc.setFontSize(12)
                doc.setFont('helvetica', 'normal')
                doc.text(`Assessment Name: ${props.title}`, 10, 20)
                doc.text(
                    `Qualifying Criteria: ${response?.data.passPercentage}%`,
                    10,
                    26
                )
                requiredCodingScore &&
                    doc.text(
                        `Total Coding Score: ${requiredCodingScore}`,
                        10,
                        32
                    )
                requiredMcqScore &&
                    doc.text(`Total MCQ Score: ${requiredMcqScore}`, 10, 38)
                doc.text(
                    `No of Students Attempted: ${assessments.length}`,
                    10,
                    44
                )

                const columns = [
                    { header: 'Name', dataKey: 'name' },
                    { header: 'Email', dataKey: 'email' },
                    { header: 'Qualified', dataKey: 'qualified' },
                    { header: 'Percentage', dataKey: 'percentage' },
                    ...(props.codingChallenges > 0
                        ? [{ header: 'Coding Score', dataKey: 'codingScore' }]
                        : []),
                    ...(props.mcq > 0
                        ? [{ header: 'MCQ Score', dataKey: 'mcqScore' }]
                        : []),
                    { header: 'Tab Changed', dataKey: 'tabChange' },
                    { header: 'Copy Pasted', dataKey: 'copyPaste' },
                ]

                const rows = assessments.map((assessment: any) => ({
                    name: assessment.name || 'N/A',
                    email: assessment.email || 'N/A',
                    qualified: assessment.isPassed ? 'Yes' : 'No',
                    percentage: `${Math.floor(assessment.percentage) || 0}%`,
                    codingScore:
                        props.codingChallenges > 0
                            ? assessment.codingScore || 0
                            : undefined,
                    mcqScore:
                        props.mcq > 0 ? assessment.mcqScore || 0 : undefined,
                    tabChange: assessment.tabChange || 0,
                    copyPaste: assessment.copyPaste || 0,
                }))

                autoTable(doc, {
                    head: [columns.map((col) => col.header)],
                    body: rows.map((row: any) =>
                        columns.map((col) => row[col.dataKey])
                    ),
                    startY: 50,
                    margin: { horizontal: 10 },
                    styles: {
                        overflow: 'linebreak',
                        halign: 'left',
                        fontSize: 10,
                        textColor: [0, 0, 0],
                    },
                    headStyles: {
                        fillColor: [22, 160, 133],
                        fontSize: 11,
                        textColor: [255, 255, 255],
                    },
                    theme: 'grid',
                })

                const pageCount = doc.getNumberOfPages()
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i)
                    doc.setFontSize(10)
                    doc.setFont('helvetica', 'normal')
                    const pageText = `Page ${i} of ${pageCount}`
                    const pageWidth = doc.internal.pageSize.width
                    const pageHeight = doc.internal.pageSize.height
                    doc.text(pageText, pageWidth - 30, pageHeight - 10)
                }

                doc.save(`${props.title}-Report.pdf`)
            } catch (error) {
                toast.error('Failed to download PDF. Please try again later.')
            }
        }

        fetchData()
    }

    const color = getAssesmentBackgroundColorClass(
        props.totalSubmissions,
        props.studentsSubmitted
    )

    const isDisabled = props.studentsSubmitted === 0

    return (
        <div
            ref={printRef}
            className=" relative lg:flex-row h-auto lg:h-[280px] sm:h-[360px] w-full shadow-lg my-5 rounded-lg p-4 lg:p-6 bg-white dark:bg-gray-800 transition-transform transform hover:shadow-xl"
        >
            <div className="w-full justify-between py-2 lg:mx-4 min-h-[250px] sm:min-h-[200px]">
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
                            disabled={isDisabled}
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
                <div className="flex flex-col lg:flex-row justify-start gap-y-3 lg:gap-x-6 my-3 flex-grow">
                    {props.codingChallenges > 0 && (
                        <div className="text-left">
                            <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                {props.codingChallenges}
                            </div>
                            <p className="text-gray-700 font-normal text-md">
                                Coding Challenges
                            </p>
                        </div>
                    )}
                    {props.mcq > 0 && (
                        <div className="text-left">
                            <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                {props.mcq}
                            </div>
                            <p className="text-gray-700 font-normal text-md mt-1">
                                MCQs
                            </p>
                        </div>
                    )}
                    {props.openEnded > 0 && (
                        <div className="text-left">
                            <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                {props.openEnded}
                            </div>
                            <p className="text-gray-700 font-normal text-md">
                                Open-Ended
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-3 lg:gap-x-6 my-3 pb-3 flex-grow">
                    <div className="flex flex-row items-center gap-x-2">
                        <div
                            className={`h-3 w-3 rounded-full ${
                                props.studentsSubmitted /
                                    props.totalSubmissions >
                                0.8
                                    ? 'bg-green-400'
                                    : props.studentsSubmitted /
                                          props.totalSubmissions >=
                                      0.5
                                    ? 'bg-orange-400'
                                    : 'bg-red-500'
                            }`}
                        />
                        <div className="text-base lg:text-lg font-medium text-gray-700">
                            {props.studentsSubmitted}/{props.totalSubmissions}
                        </div>
                        <p className="text-gray-700 font-normal text-md">
                            Submissions
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-x-2">
                        <div className="h-3 w-3 bg-orange-400 rounded-full" />
                        <div className="text-base lg:text-lg font-medium text-gray-700">
                            {props.qualifiedStudents}
                        </div>
                        <p className="text-gray-700 font-normal text-md">
                            Qualified
                        </p>
                    </div>
                </div>
                <div className="flex flex-col  items-end absolute  justify-end bottom-4 right-0 ">
                    <Link
                        href={`/admin/courses/${props.bootcampId}/submissionAssesments/${props.id}`}
                        className="w-full h-full lg:w-auto"
                    >
                        <Button
                            variant="ghost"
                            className="flex h-full justify-center items-center w-full lg:w-auto py-2 text-secondary font-bold rounded-md transition-all duration-300"
                        >
                            <h1 className="w-full text-center flex lg:text-right">
                                View Submission
                                <ChevronRight size={20} className="ml-2" />
                            </h1>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AssesmentComponent
