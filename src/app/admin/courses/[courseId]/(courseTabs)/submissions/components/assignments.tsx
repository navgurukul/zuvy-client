'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, ArrowDownToLine } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Image from 'next/image'
import { error } from 'console'
import { nullable } from 'zod'

type Props = {
    courseId: number
    debouncedSearch: string
    // id:number
}

const Assignments = ({ courseId, debouncedSearch }: Props) => {
    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)

    useEffect(() => {
        const fetchAssignmentDataHandler = async () => {
            try {
                const url = debouncedSearch
                    ? `/submission/submissionsOfAssignment/${courseId}?searchAssignment=${debouncedSearch}`
                    : `/submission/submissionsOfAssignment/${courseId}`
                const res = await api.get(url)
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

    const handleDownloadPdf = async (id: any) => {
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
            } catch (error) {}
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
                    assignmentData?.map((data, i) => {
                        if (data.moduleChapterData.length === 0) return null

                        return (
                            <div className="my-3" key={data.id}>
                                <div className="w-full flex flex-col gap-y-5">
                                    <h1 className="w-full text-[20px] text-left font-semibold">
                                        Module: {data.name}
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 gap-8 mt-2 md:mt-4 md:grid-cols-2 lg:grid-cols-3">
                                    {data.moduleChapterData.map(
                                        (moduleData: any) => {
                                            // Your card rendering logic here...
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
