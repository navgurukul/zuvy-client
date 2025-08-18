'use client'
import { calculateTimeTaken } from '@/utils/admin'
import { api } from '@/utils/axios.config'
import { format } from 'date-fns'
import { color } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ArrowBigDownDash } from 'lucide-react'

const DownloadReport = ({ userInfo, submitedAt }: any) => {
    const { userId, id, title } = userInfo

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy hh:mm a')
        } catch {
            return 'Invalid Date'
        }
    }

    async function fetchReportData() {
        try {
            const res = await api.get(
                `/tracking/assessment/submissionId=${id}?studentId=${userId}`
            )
            generatePDF(res?.data)
        } catch (error) {
            console.error('Error fetching report data:', error)
        }
    }

    async function generatePDF(reportData: any) {
        const doc = new jsPDF()

        // Add Assessment Summary at the Top
        // Add "Zuvy Assessment Report" in bold and red
        doc.setFont('helvetica', 'bold') // Set font to bold
        doc.setTextColor(96, 144, 130) // Set text color to zuvy color
        doc.setFontSize(16)
        doc.text(`${title} Assessment Report`, 105, 10, { align: 'center' })

        // Reset font and color for subsequent text
        doc.setFont('helvetica', 'normal') // Reset to normal font
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text(`Name: ${reportData.user?.name || 'N/A'}`, 15, 25)
        doc.text(`Email: ${reportData.user?.email || 'N/A'}`, 15, 30)
        doc.text(
            `Submitted On: ${new Date(reportData.submitedAt).toLocaleString()}`,
            15,
            35
        )
        doc.text(
            `Time Taken: ${calculateTimeTaken(
                reportData.startedAt,
                reportData.submitedAt
            )}`,
            15,
            40
        )
        doc.text(`Total Marks: 100`, 15, 45)
        doc.text(
            `Percentage: ${Math.trunc(reportData.percentage || 0)}%`,
            15,
            50
        )

        // Table for CopyPaste and TabChange
        // Table for CopyPaste and TabChange
        autoTable(doc, {
            head: [['Proctoring Details', 'Count']],
            body: [
                ['Copy Paste', `${reportData.copyPaste || 0} times`],
                ['Tab Change', `${reportData.tabChange || 0} times`],
                ['Exit Full Screen', `${reportData.fullScreenExit || 0} times`],
            ],
            startY: 60,
            theme: 'grid',
            headStyles: {
                fillColor: [96, 144, 130],
                textColor: [255, 255, 255], // White text for contrast
            },
            bodyStyles: {
                textColor: [0, 0, 0], // Black text for body cells
            },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { cellWidth: 60 },
            },
        })

        // Table for Coding Problems
        autoTable(doc, {
            head: [['Coding Details', 'Questions & Score']],
            body: [
                [
                    'Coding Questions Attempted',
                    `${reportData.PracticeCode.length || 0} / ${
                        reportData.submitedOutsourseAssessment.totalCodingQuestions || 0
                    }`,
                ],
                [
                    'Coding Score',
                    `${reportData.codingScore || 0} / ${
                        reportData.submitedOutsourseAssessment.weightageCodingQuestions || 0
                    }`,
                ],
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [96, 144, 130],
                textColor: [255, 255, 255], // White text for contrast
            },
            bodyStyles: {
                textColor: [0, 0, 0], // Black text for body cells
            },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { cellWidth: 60 },
            },
        })

        // Table for MCQs
        autoTable(doc, {
            head: [[`MCQ Details`, 'Score']],
            body: [
                  [
                      'Total MCQ Attempted',
                    `${Math.round(reportData.attemptedMCQQuestions) || 0} / ${
                        reportData?.submitedOutsourseAssessment?.totalMcqQuestions || 0
                    }`
                ],
                [
                    'MCQ Score',
                    `${Math.round(reportData.mcqScore) || 0} / ${
                        reportData?.submitedOutsourseAssessment?.weightageMcqQuestions || 0
                    }`
                ]
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [96, 144, 130],
                textColor: [255, 255, 255], // White text for contrast
            },
            bodyStyles: {
                textColor: [0, 0, 0], // Black text for body cells
            },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { cellWidth: 60 },
            },
        })

        // Create an array to hold all rows for the table
        const tableData = reportData.PracticeCode.map(
            (practiceCode: any, index: any) => [
                `Q${index + 1}. ${practiceCode.questionDetail.title}`,
                practiceCode.status == 'Accepted'
                    ? 'Correct Answer'
                    : 'Wrong Answer',
            ]
        )

        // Generate a single table with all rows
        autoTable(doc, {
            head: [['Coding Questions', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [96, 144, 130],
                textColor: [255, 255, 255], // White text for contrast
            },
            bodyStyles: {
                textColor: [0, 0, 0], // Black text for body cells
            },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { cellWidth: 60 },
            },
        })

        // Save the PDF
        doc.save(`${reportData.user?.name}_${title}.pdf`)
    }

    async function handleDownload() {
        await fetchReportData()
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleDownload}
                className={ submitedAt ? `max-w-[500px] text-[rgb(81,134,114)] font-medium flex items-center` : `max-w-[500px] text-secondary font-medium flex items-center opacity-50 cursor-not-allowed`}
            >
                <ArrowBigDownDash className="mr-2" />
                Download Report
            </button>
        </div>
    )
}

export default DownloadReport
