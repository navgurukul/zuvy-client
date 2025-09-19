'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, ArrowDownToLine, FileText } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Image from 'next/image'
import { error } from 'console'
import { nullable } from 'zod'
import { AssignmentProps, AssignmentModuleData, AssignmentApiResponse } from "@/app/admin/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType"
import { Badge } from '@/components/ui/badge';


const Assignments = ({ courseId, debouncedSearch }: AssignmentProps) => {
    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)

    useEffect(() => {
        const fetchAssignmentDataHandler = async () => {
            try {
                const url = debouncedSearch
                    ? `/submission/submissionsOfAssignment/${courseId}?searchAssignment=${debouncedSearch}`
                    : `/submission/submissionsOfAssignment/${courseId}`
                const res = await api.get<AssignmentApiResponse>(url)
                setAssignmentData(res.data.data.trackingData)
                setTotalStudents(res.data.data.totalStudents)
            } catch (error) {
                toast.error({
                    title: 'Error',
                    description: 'Error while fetching assignment data',
                })
            }
        }

        fetchAssignmentDataHandler()
    }, [courseId, debouncedSearch])

    const handleDownloadPdf = async (id: number) => {
        const apiUrl = `/submission/assignmentStatus?chapterId=${id}&limit=5&offset=0`

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
                const rows = assessments.data.map(
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
                doc.save(`${assessments.chapterName}.pdf`)
            } catch (error) { }
        }

        fetchData()
    }

    return (
        <div className="">
            {assignmentData?.length > 0 ? (
                assignmentData?.every(
                    (data) => data.moduleChapterData.length === 0
                ) ? (
                    <div className="w-screen flex flex-col justify-center items-center h-4/5">
                        <h5 className="text-center font-semibold text-[1.063rem]">
                            No Assignment Found
                        </h5>
                        <Image
                            src="/emptyStates/curriculum.svg"
                            alt="No Assessment Found"
                            width={400}
                            height={400}
                        />
                    </div>
                ) : (
                    assignmentData?.map((data) => {
                        const moduleDataLength = data.moduleChapterData.length

                        if (moduleDataLength > 0)
                            return (
                                <div className="my-3" key={data.id}>
                                    <div className="w-full flex flex-col gap-y-5">
                                        <h1 className="w-full text-[20px] text-left font-semibold">
                                            Module: {data.name}
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 mt-2 md:mt-4 md:grid-cols-2 lg:grid-cols-3">
                                        {data.moduleChapterData.map(
                                            (moduleData: AssignmentModuleData) => {
                                                const isDisabled =
                                                    moduleData.submitStudents ===
                                                    0
                                                const chapterId = moduleData.id

                                                const submissionPercentage =
                                                    moduleData.submitStudents >
                                                        0
                                                        ? totalStudents /
                                                        moduleData.submitStudents
                                                        : 0
                                                return (
                                                    <div
                                                        className="relative bg-muted border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full"
                                                        key={moduleData.id}
                                                    >
                                                        {/* Icon at the top-right */}
                                                        <div className="absolute top-5 pr-3 right-2 group">
                                                            <button
                                                                className={`ml-2 cursor-pointer ${isDisabled
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-500 hover:text-gray-700'
                                                                    }`}
                                                                onClick={
                                                                    isDisabled
                                                                        ? undefined
                                                                        : () =>
                                                                            handleDownloadPdf(
                                                                                Number(
                                                                                    chapterId
                                                                                )
                                                                            )
                                                                }
                                                                aria-label="Download full report"
                                                                disabled={
                                                                    isDisabled
                                                                } // Disable button
                                                            >
                                                                <ArrowDownToLine
                                                                    size={20}
                                                                />
                                                            </button>
                                                            {/* Tooltip visible on hover */}
                                                            {!isDisabled && (
                                                                <div className="absolute right-0 mt-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                                                    Download
                                                                    full report
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="font-semibold pl-3 flex w-full flex-col justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 rounded-md">
                                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                                <h3 className="font-medium text-base text-gray-900">{moduleData.title}</h3>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-4 text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                                                                    >
                                                                        {moduleData.submitStudents} submissions
                                                                    </Badge>
                                                                </div>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                                >
                                                                    {totalStudents - moduleData.submitStudents} pending
                                                                </Badge>
                                                            </div>
                                                            {/* Fix View Submissions button to right bottom corner */}
                                                            <div className="w-full flex justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    className="flex items-center text-green-700 hover:bg-transparent"
                                                                >
                                                                    <Link
                                                                        href={`/admin/courses/${courseId}/submissionAssignments/${moduleData.id}`}
                                                                    >
                                                                        View
                                                                        Submissions
                                                                    </Link>
                                                                    <ChevronRight
                                                                        size={16}  className="ml-1"
                                                                    />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            )
                    })
                )
            ) : (
                <div className="w-screen flex flex-col justify-center items-center h-4/5">
                    <h5 className="text-center font-semibold text-[1.063rem]">
                        No Assignment Found
                    </h5>
                    <Image
                        src="/emptyStates/curriculum.svg"
                        alt="No Assessment Found"
                        width={400}
                        height={400}
                    />
                </div>
            )}
        </div>
    )
}

export default Assignments
