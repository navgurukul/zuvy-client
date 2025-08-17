'use client'

import { ChevronRight, Clapperboard, Clock3, Download } from 'lucide-react'
import Moment from 'react-moment'
import Plyr from 'plyr'

import { toast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

import { ellipsis } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {ClassDatas} from "@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType"


function RecordingCard({
    classData,
    isAdmin,
}: {
    classData: ClassDatas
    isAdmin: Boolean
}) {
    // misc
    const isVideo = classData.s3link

    let embedUrl = ''

    // Check if classData.s3link is truthy
    if (isVideo) {
        // Extract video ID from classData.s3link
        const videoId = classData.s3link?.split('/d/')[1]?.split('/view')[0]

        // Construct embeddable URL
        embedUrl = `https://drive.google.com/file/d/${videoId}/preview`
    }

    const [analyticsData, setAnalyticsData] = useState<any | null>(null)

    // func

    async function handleClassDetails() {
        try {
            const response = await api.get(`/classes/analytics/${classData?.id}`)
            setAnalyticsData(response.data?.data)
        } catch (err) {
            console.error(err)
        }
    }

    const totalStudents = analyticsData?.analytics?.totalStudents ?? 0
    const presentStudents = analyticsData?.analytics?.present ?? 0
    const absentStudents = analyticsData?.analytics?.absent ?? (totalStudents - presentStudents)

    const isWithin12Hours = () => {
        if (!classData.endTime) return false
        const classEndTime = new Date(classData.endTime)
        const now = new Date()
        const timeDiff = now.getTime() - classEndTime.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        return hoursDiff < 12
    }

    const within12Hours = isWithin12Hours()

    const handleViewRecording = () => {
        if (isVideo) {
            if (
                classData.s3link === 'not found' ||
                !classData.s3link.startsWith('https')
            ) {
                toast.error({
                    title: 'Recording not yet updated',
                })
            } else {
                window.open(classData.s3link, '_blank')
            }
        } else {
            toast.error({
                title: 'Recording not yet updated',
            })
        }
    }

    const handleAttendance = () => {
        try {
            if (!analyticsData) {
                toast.error({ title: 'Open Class Details first to load analytics' })
                return
            }
            const records = analyticsData?.session?.studentAttendanceRecords || []
            if (!Array.isArray(records) || records.length === 0) {
                toast.error({ title: 'No attendance records to download' })
                return
            }
            const total = analyticsData?.analytics?.totalStudents ?? ''
            const present = analyticsData?.analytics?.present ?? ''
            const absent = analyticsData?.analytics?.absent ?? ''

            const mapped = records.map((r: any) => ({
                id: r.id,
                userId: r.userId,
                batchId: r.batchId,
                bootcampId: r.bootcampId,
                sessionId: r.sessionId,
                attendanceDate: r.attendanceDate,
                status: r.status,
                duration: r.duration,
                createdAt: r.createdAt,
            }))
            const headers = Object.keys(mapped[0])
            const summaryHeader = ['totalStudents', 'present', 'absent']
            const summaryRow = [total, present, absent]
            const csvRows = [
                summaryHeader.join(','),
                summaryRow.join(','),
                '',
                headers.join(','),
                ...mapped.map(row => headers.map(h => (row as any)[h] ?? '').join(',')),
            ]
            const csvContent = csvRows.join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.href = url
            link.setAttribute('download', `${classData.title}_attendance.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error generating attendance CSV from cached analytics:', error)
            toast.error({ title: 'Error preparing attendance data' })
        }
    }

    return (
        <Card className="w-full p-6">
            <div className="flex justify-start">
                <Clapperboard size={40} className="text-yellow-dark mr-2" />
                <div>
                    <p className="text-xl text-start">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <h3 className="font-semibold text-lg">
                                        {ellipsis(classData.title, 30)}
                                    </h3>
                                </TooltipTrigger>
                                <TooltipContent className="font-semibold">
                                    {classData.title}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </p>
                    <div className="text-[15px] flex font-semibold capitalize items-center">
                        <Moment format="D MMMM">{classData.startTime}</Moment>
                        <p className="mr-2">,</p>
                        <Moment format="hh:mm A">{classData.startTime}</Moment>
                        <p className="mx-2">-</p>
                        <Moment format="hh:mm A">{classData.endTime}</Moment>
                    </div>
                    {analyticsData && (
                        <div className="mt-2 flex gap-6 text-sm font-medium">
                            <div>
                                <span className="text-muted-foreground mr-1">Total:</span>
                                {totalStudents}
                            </div>
                            <div>
                                <span className="text-muted-foreground mr-1">Present:</span>
                                <span className="text-secondary">{presentStudents}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground mr-1">Absent:</span>
                                <span className="text-destructive">{absentStudents}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-6 gap-3 flex justify-end text-secondary font-bold text-md cursor-pointer">
                {!isAdmin ? (
                    <div
                        className="flex items-center"
                        onClick={handleViewRecording}
                    >
                        <p className="mr-1 text-lg">View Recording</p>
                        <ChevronRight size={15} />
                    </div>
                ) : (<Sheet>
                    <div className={`flex items-center ${isVideo === 'not found' ||
                        presentStudents === 0 ||
                        within12Hours
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer'
                        }`}>
                        <TooltipProvider>                                
                            <SheetTrigger
                            disabled={
                                isVideo === 'not found' ||
                                presentStudents === 0 ||
                                within12Hours
                            }
                            className={
                                isVideo === 'not found' ||
                                    presentStudents === 0 ||
                                    within12Hours
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="inline-block">                                                
                                        <Button
                                        variant="ghost"
                                        className={`flex gap-2 items-center ${isVideo === 'not found' ||
                                            presentStudents === 0 ||
                                            within12Hours
                                            ? 'cursor-not-allowed'
                                            : ''
                                            }`}
                                        onClick={handleClassDetails}
                                        disabled={
                                            isVideo ===
                                            'not found' ||
                                            presentStudents === 0 ||
                                            within12Hours
                                        }
                                    >
                                        Class Details
                                    </Button>
                                    </div>
                                </TooltipTrigger>
                                {(isVideo === 'not found' ||
                                    presentStudents === 0) && (
                                        <TooltipContent className="font-semibold">
                                            Recording is not available and
                                            present students are 0
                                        </TooltipContent>
                                    )}
                                {within12Hours && (
                                    <TooltipContent className="font-semibold">
                                        Class details will be updated at mid night after the class ends.
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </SheetTrigger>                            
                        </TooltipProvider>
                        <ChevronRight
                            size={15}
                            className={
                                isVideo === 'not found' ||
                                    presentStudents === 0 ||
                                    within12Hours
                                    ? 'text-muted-foreground opacity-50'
                                    : ''
                            }
                        />
                    </div>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>
                                <h1 className="mb-10 text-lg text-start">
                                    {classData.title}
                                </h1>
                            </SheetTitle>
                            <SheetDescription>
                                <h2 className="mb-3 font-bold text-[15px]">
                                    Session Recording
                                </h2>
                                {isVideo ? (
                                    <div
                                        className="plyr__video-embed"
                                        id="player"
                                    >
                                        <iframe
                                            src={embedUrl}
                                            allowFullScreen
                                            allowTransparency
                                            allow="autoplay"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <p className="mb-5">
                                        Video is under processing...Please
                                        check after some time
                                    </p>
                                )}
                                <p className="text-md text-start">
                                    {classData.description}
                                </p>
                                <h3 className="mb-3 font-bold mt-3 text-[15px]">
                                    Attendance Information
                                </h3>
                                {analyticsData ? (
                                    <div className="flex mb-5">
                                        <div className="flex-grow basis-0">
                                            <p>Total Students</p>
                                            <p>{totalStudents}</p>
                                        </div>
                                        <div className="flex-grow basis-0">
                                            <p>Present</p>
                                            <p className="text-secondary">
                                                {presentStudents}
                                            </p>
                                        </div>
                                        <div className="flex-grow basis-0">
                                            <p>Absent</p>
                                            <p className="text-destructive">
                                                {absentStudents}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="my-5">Loading...</p>
                                )}
                                <Button
                                    className="flex gap-2 items-center"
                                    onClick={handleAttendance}
                                    disabled={presentStudents === 0 || !analyticsData}
                                >
                                    <p>Download Attendance Data</p>
                                    <Download size={20} />
                                </Button>
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
                )}
            </div>
        </Card>
    )
}

export default RecordingCard