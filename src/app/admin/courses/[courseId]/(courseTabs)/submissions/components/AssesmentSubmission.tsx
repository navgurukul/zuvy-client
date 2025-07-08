'use client'
import React, { useCallback, useEffect, useState } from 'react'
import AssesmentComponent from '../../../_components/AssesmentComponent'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import useDebounce from '@/hooks/useDebounce'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
// import assesmentNotfound from @/public

const AssesmentSubmissionComponent = ({ courseId, searchTerm }: any) => {
    const [assesments, setAssesments] = useState<any>()
    const debouncedSearch = useDebounce(searchTerm, 300)

    const getAssessments = useCallback(async () => {
        try {
            const url = debouncedSearch
                ? `/admin/bootcampAssessment/bootcamp_id${courseId}?searchAssessment=${debouncedSearch}`
                : `/admin/bootcampAssessment/bootcamp_id${courseId}`

            const res = await api.get(url)
            setAssesments(res.data)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching assessments:',
            })
        }
    }, [courseId, debouncedSearch])

    useEffect(() => {
        getAssessments()
    }, [getAssessments])

    const handleDownloadPdf = async (assessment: any) => {
        if (!assessment) return

        const apiUrl = `/admin/assessment/students/assessment_id${assessment.id}`

        try {
            const response = await api.get(apiUrl)
            console.log('response.data', response.data)
            console.log(
                'response?.data.passPercentage',
                response?.data.ModuleAssessment.passPercentage
            )
            const assessments = response.data.submitedOutsourseAssessments
            const requiredCodingScore =
                assessments[0]?.requiredCodingScore || null
            const requiredMcqScore = assessments[0]?.requiredMCQScore || null

            if (!Array.isArray(assessments) || assessments.length === 0) {
                toast.error({
                    title: 'Error',
                    description: 'No data available to generate PDF.',
                })
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
            doc.text(`Assessment Name: ${assessment.title}`, 10, 20)
            doc.text(
                `Qualifying Criteria: ${response?.data.ModuleAssessment.passPercentage}%`,
                10,
                26
            )
            requiredCodingScore &&
                doc.text(`Total Coding Score: ${requiredCodingScore}`, 10, 32)
            requiredMcqScore &&
                doc.text(`Total MCQ Score: ${requiredMcqScore}`, 10, 38)
            doc.text(`No of Students Attempted: ${assessments.length}`, 10, 44)

            const columns = [
                { header: 'Name', dataKey: 'name' },
                { header: 'Email', dataKey: 'email' },
                { header: 'Qualified', dataKey: 'qualified' },
                { header: 'Percentage', dataKey: 'percentage' },
                ...(assessment.totalCodingQuestions > 0
                    ? [{ header: 'Coding Score', dataKey: 'codingScore' }]
                    : []),
                ...(assessment.totalMcqQuestions > 0
                    ? [{ header: 'MCQ Score', dataKey: 'mcqScore' }]
                    : []),
                { header: 'Tab Changed', dataKey: 'tabChange' },
                { header: 'Copy Pasted', dataKey: 'copyPaste' },
            ]

            const rows = assessments.map((student: any) => ({
                name: student.name || 'N/A',
                email: student.email || 'N/A',
                qualified: student.isPassed ? 'Yes' : 'No',
                percentage: `${(student.percentage || 0).toFixed(2)}%`,
                codingScore:
                    assessment.totalCodingQuestions > 0
                        ? (student.codingScore || 0).toFixed(2)
                        : undefined,
                mcqScore:
                    assessment.totalMcqQuestions > 0
                        ? (student.mcqScore || 0).toFixed(2)
                        : undefined,
                tabChange: student.tabChange || 0,
                copyPaste: student.copyPaste || 0,
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

            doc.save(`${assessment.title}-Report.pdf`)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Failed to download PDF. Please try again later.',
            })
        }
    }

    const handleDownloadCsv = async (assessment: any) => {
        if (!assessment) return

        const apiUrl = `/admin/assessment/students/assessment_id${assessment.id}`

        try {
            const response = await api.get(apiUrl)
            const assessments = response.data.submitedOutsourseAssessments

            if (!Array.isArray(assessments) || assessments.length === 0) {
                toast.error({
                    title: 'Error',
                    description: 'No data available to generate CSV.',
                })
                return
            }

            const headers = [
                'Name',
                'Email',
                'Qualified',
                'Percentage',
                ...(assessment.totalCodingQuestions > 0
                    ? ['Coding Score']
                    : []),
                ...(assessment.totalMcqQuestions > 0 ? ['MCQ Score'] : []),
                'Tab Changed',
                'Copy Pasted',
            ]

            const rows = assessments.map((student: any) => [
                student.name || 'N/A',
                student.email || 'N/A',
                student.isPassed ? 'Yes' : 'No',
                `${(student.percentage || 0).toFixed(2)}%`,
                ...(assessment.totalCodingQuestions > 0
                    ? [(student.codingScore || 0).toFixed(2)]
                    : []),
                ...(assessment.totalMcqQuestions > 0
                    ? [(student.mcqScore || 0).toFixed(2)]
                    : []),
                student.tabChange || 0,
                student.copyPaste || 0,
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map((row) => row.join(',')),
            ].join('\n')

            const blob = new Blob([csvContent], {
                type: 'text/csv;charset=utf-8;',
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${assessment.title}-Report.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Failed to download CSV. Please try again later.',
            })
        }
    }

    return (
        <div className="grid relative gap-8 mt-4 md:mt-8">
            {assesments ? (
                Object.keys(assesments).length > 0 ? (
                    Object.keys(assesments).map(
                        (key) =>
                            key !== 'totalStudents' && (
                                <div key={key}>
                                    <h2 className="text-lg text-start font-bold text-gray-900 dark:text-white">
                                        Module - {key}
                                    </h2>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        {assesments[key].map(
                                            (assessment: any) => (
                                                <AssesmentComponent
                                                    key={assessment.id}
                                                    id={assessment.id}
                                                    title={assessment.title}
                                                    codingChallenges={
                                                        assessment.totalCodingQuestions
                                                    }
                                                    mcq={
                                                        assessment.totalMcqQuestions
                                                    }
                                                    openEnded={
                                                        assessment.totalOpenEndedQuestions
                                                    }
                                                    totalSubmissions={
                                                        assesments.totalStudents
                                                    }
                                                    studentsSubmitted={
                                                        assessment.totalSubmitedAssessments
                                                    }
                                                    bootcampId={courseId}
                                                    qualifiedStudents={
                                                        assessment.qualifiedStudents
                                                    }
                                                    // onDownloadClick={() =>
                                                    //     handleDownloadClick(
                                                    //         assessment
                                                    //     )
                                                    // }
                                                    onDownloadPdf={() =>
                                                        handleDownloadPdf(
                                                            assessment
                                                        )
                                                    }
                                                    onDownloadCsv={() =>
                                                        handleDownloadCsv(
                                                            assessment
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                    )
                ) : (
                    <div className="w-screen flex flex-col justify-center items-center h-4/5">
                        <h1 className="text-center font-semibold ">
                            No Assessment Found
                        </h1>
                        <Image
                            src="/emptyStates/curriculum.svg"
                            alt="No Assessment Found"
                            width={400}
                            height={400}
                        />
                    </div>
                )
            ) : (
                <div className="w-full flex justify-center items-center absolute inset-0 h-screen">
                    <h1 className="text-center font-semibold ">
                        No Assessment Found
                    </h1>
                    <Image
                        src="/emptyStates/curriculum.svg"
                        alt="No Assessment Found"
                        width={400}
                        height={400}
                    />
                </div>
            )}

            {/* Popup Modal */}
            {/* {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-[90%] max-w-md relative">
                        <button
                            onClick={handlePopupClose}
                            className="absolute text-2xl top-2 right-2 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            x
                        </button>
                        <h2 className="text-lg font-semibold mb-4">
                            Download full report
                        </h2>
                        <div className="flex justify-center gap-4 mt-10">
                            <button
                                onClick={handleDownloadPdf}
                                className="px-4 py-2 bg-secondary text-white rounded-md"
                            >
                                Download PDF
                            </button>
                            <button
                                onClick={handleDownloadCsv}
                                className="px-4 py-2 bg-secondary text-white rounded-md"
                            >
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    )
}

export default AssesmentSubmissionComponent
