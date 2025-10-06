import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, ChevronRight, Play } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import Link from 'next/link'
import Image from 'next/image'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface LiveClassSubmissionsProps {
    courseId: string
    debouncedSearch: string
}

const LiveClassSubmissions: React.FC<LiveClassSubmissionsProps> = ({
    courseId,
    debouncedSearch,
}) => {
    const [liveClassData, setLiveClassData] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [loading, setLoading] = useState(true)

    const getLiveClassData = useCallback(async () => {
        try {
            setLoading(true)
            let url = `/submission/livesession/zuvy_livechapter_submissions?bootcamp_id=${courseId}`
            if (debouncedSearch) {
                url += `&searchTerm=${encodeURIComponent(debouncedSearch)}`
            }

            const res = await api.get(url)
            const trackingData = res.data?.data?.trackingData || []
            setLiveClassData(trackingData)
            setTotalStudents(res.data?.data?.totalStudents || 0)
        } catch (error) {
            console.error('Error fetching live class data:', error)
            setLiveClassData([])
            setTotalStudents(0)
            toast({
                title: 'Error',
                description: 'Failed to fetch live class data',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }, [courseId, debouncedSearch])

    useEffect(() => {
        if (courseId) {
            getLiveClassData()
        }
    }, [courseId, debouncedSearch, getLiveClassData])

    const handleDownloadPdf = async (liveClassId: string, liveClassTitle: string) => {
        try {
            const apiUrl = `/submission/livesession/zuvy_livechapter_student_submission/${liveClassId}`
            const response = await api.get(apiUrl)

            const sessionData = response.data?.data?.[0] // First session object
            const students = sessionData?.studentAttendanceRecords || []

            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Live Class Submission Report', 14, 15)
            doc.setFontSize(14)
            doc.text(`Title: ${liveClassTitle}`, 14, 22)
            doc.text('Student Attendance:', 14, 30)

            const columns = ['Name', 'Email', 'Status', 'Duration (min)']

            const rows = students.map((record: any) => {
                return [
                    record.user?.name || 'N/A',
                    record.user?.email || 'N/A',
                    record.status || 'N/A',
                    (record.duration / 60).toFixed(2), // converting seconds to minutes (optional)
                ]
            })

            // Draw table
            autoTable(doc, {
                head: [columns],
                body: rows,
                startY: 35,
                margin: { horizontal: 10 },
                styles: { overflow: 'linebreak', halign: 'center' },
                headStyles: { fillColor: [22, 160, 133] },
                theme: 'grid',
            })

            // Save PDF
            doc.save(`${liveClassTitle || 'live-class-report'}.pdf`)
        } catch (error: any) {
            console.error('Error generating PDF:', error)
            toast.error({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to generate PDF',
            })
        }
    }


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    // Flatten all live classes from all modules
    const allLiveClasses = liveClassData.flatMap((module) =>
        (module.moduleChapterData || []).map((liveClass: any) => ({
            ...liveClass,
            moduleName: module.name,
            moduleId: module.id,
        }))
    )

    if (allLiveClasses.length === 0) {
        return (
            <div className="w-full flex flex-col justify-center items-center h-4/5">
                <p className="text-center text-muted-foreground max-w-md">
                    {debouncedSearch
                        ? `No Live Classes Found for "${debouncedSearch}"`
                        : ' No Live Classes submissions available from the students yet. Please wait until the first submission'}
                </p>
                <Image
                    src="/emptyStates/empty-submissions.png"
                    alt="No Live Classes Found"
                    width={120}
                    height={120}
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
            {allLiveClasses.map((liveClass: any) => {
                const submissions = liveClass.submitStudents || 0

                return (
                    <div
                        key={liveClass.id}
                        className="relative bg-muted border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow mb-5"
                    >

                        <button
                            onClick={() => {
                                if (submissions > 0) {
                                    handleDownloadPdf(liveClass.id, liveClass.title)
                                }
                            }}
                            className={`absolute top-2 right-2 z-10 transform ${submissions > 0
                                    ? 'hover:text-gray-700 cursor-pointer'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                            title={submissions > 0 ? 'Download Report' : 'No submissions yet'}
                            disabled={submissions === 0}
                        >
                            <ArrowDownToLine
                                size={20}
                                className={submissions > 0 ? 'text-gray-500' : 'text-gray-300'}
                            />
                        </button>


                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-md">
                                    <Play className="w-4 h-4 text-gray-600" />
                                </div>
                                <h3 className="font-medium text-base text-gray-900">
                                    {liveClass.title || 'Untitled Live Class'}
                                </h3>
                            </div>
                            <div className="flex items-center justify-between mt-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Badge
                                        variant="outline"
                                        className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                                    >
                                        {submissions} submissions
                                    </Badge>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                >
                                    {totalStudents - submissions} pending
                                </Badge>
                            </div>
                        </div>

                        <div className="w-full flex justify-end mt-2">
                            {submissions > 0 ? (
                                <Link
                                    href={`/admin/courses/${courseId}/submissionLiveClass/${liveClass.id}`}
                                >
                                    <Button
                                        variant={'ghost'}
                                        className="hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                        View Submission
                                        <ChevronRight className="text-green-700" size={17} />
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    variant={'ghost'}
                                    className="text-green-700 text-sm"
                                    disabled
                                >
                                    View Submission
                                    <ChevronRight className="text-green-700" size={17} />
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default LiveClassSubmissions