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

interface StudentsInfo {
    total_students: number
    present: number
    s3link: string
}

interface DisplayAttendance {
    status: string
    message: string
    studentsInfo: StudentsInfo
}

function RecordingCard({
    classData,
    isAdmin,
}: {
    classData: any
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

    const [displayAttendance, setDisplayAttendance] =
        useState<DisplayAttendance | null>(null)

    // func

    async function handleClassDetails() {
        try {
            const response = await api.get(
                `/classes/analytics/${classData?.id}`
            )
            setDisplayAttendance(response.data)
        } catch (err) {
            console.error(err)
        }
    }

    const absentStudents =
        (displayAttendance?.studentsInfo?.total_students ?? 0) -
        (displayAttendance?.studentsInfo?.present ?? 0)

    const presentStudents = displayAttendance?.studentsInfo?.present

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

    const handleAttendance = async () => {
        try {
            const response = await api.get(
                `/classes/getAttendance/${classData.meetingId}`
            )
            const attendanceData = response.data.attendanceSheet
            if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
                throw new Error(
                    'Attendance data is not in the expected format or is empty.'
                )
            }
            const headers = Object.keys(attendanceData[0])
            const csvContent = `${headers.join(',')}\n${attendanceData
                .map((row) => headers.map((header) => row[header]).join(','))
                .join('\n')}`
            const encodedUri = encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute(
                'href',
                'data:text/csv;charset=utf-8,' + encodedUri
            )
            link.setAttribute('download', `${classData.title}_attendance.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error(
                'Error fetching or processing attendance data:',
                error
            )
            toast.error({
                title: 'Error fetching attendance data',
            })
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
                                    <h3 className="font-semibold">
                                        {ellipsis(classData.title, 30)}
                                    </h3>
                                </TooltipTrigger>
                                <TooltipContent className="font-semibold">
                                    {classData.title}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </p>
                    <div className="text-md flex font-semibold capitalize items-center">
                        <Moment format="D MMMM">{classData.startTime}</Moment>
                        <p className="mr-2">,</p>
                        <Moment format="hh:mm A">{classData.startTime}</Moment>
                        <p className="mx-2">-</p>
                        <Moment format="hh:mm A">{classData.endTime}</Moment>
                    </div>
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
                ) : (
                    <Sheet>
                        <div className="flex items-center">
                            <TooltipProvider>
                                <SheetTrigger
                                    disabled={
                                        isVideo === 'not found' ||
                                        presentStudents === 0
                                    }
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="inline-block">
                                                <Button
                                                    variant="ghost"
                                                    className="flex gap-2 items-center"
                                                    onClick={handleClassDetails}
                                                    disabled={
                                                        isVideo ===
                                                            'not found' ||
                                                        presentStudents === 0
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
                                    </Tooltip>
                                </SheetTrigger>
                            </TooltipProvider>
                            <ChevronRight size={15} />
                        </div>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>
                                    <h1 className="mb-10 text-xl text-start">
                                        {classData.title}
                                    </h1>
                                </SheetTitle>
                                <SheetDescription>
                                    <h2 className="mb-3 font-bold">
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
                                    <h3 className="mb-3 font-bold mt-3">
                                        Attendance Information
                                    </h3>
                                    {displayAttendance ? (
                                        <div className="flex mb-5">
                                            <div className="flex-grow basis-0">
                                                <p>Total Students</p>
                                                <p>
                                                    {
                                                        displayAttendance
                                                            ?.studentsInfo
                                                            ?.total_students
                                                    }
                                                </p>
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
                                        disabled={presentStudents === 0}
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
