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
import {
    ClassDatas,
    DisplayAttendance,
} from '@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType'

function RecordingCard({
    classData,
    isAdmin,
}: {
    classData: ClassDatas
    isAdmin: Boolean
}) {
    // misc
    const [classDetails, setClassDetails] = useState<DisplayAttendance | null>(
        null
    )
    const [isLoading, setIsLoading] = useState(false)

    const isVideo = classDetails?.data?.session?.s3link

    let embedUrl = ''

    // Check if classData.s3link is truthy
    if (isVideo) {
        // Extract video ID from classData.s3link
        const videoId = classDetails?.data?.session.s3link
            ?.split('/d/')[1]
            ?.split('/view')[0]

        // Construct embeddable URL
        embedUrl = `https://drive.google.com/file/d/${videoId}/preview`
    }

    // Get Class Details
    async function handleClassDetails() {
        setIsLoading(true)
        try {
            const response = await api.get(
                `/classes/analytics/${classData?.id}`
            )
            setClassDetails(response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const absentStudents = classDetails?.data?.analytics?.absent

    const presentStudents = classDetails?.data?.analytics?.present

    const isWithin24Hours = () => {
        if (!classData?.endTime) return false
        const classEndTime = new Date(classData.endTime)
        const endPlus24 = new Date(classEndTime.getTime() + 24 * 60 * 60 * 1000) // add 24 hours
        const now = new Date()
        return now < endPlus24 // disabled until 24h after class end
    }

    const within24Hours = isWithin24Hours()

    const handleViewRecording = () => {
        if (isVideo) {
            if (
                classDetails?.data?.session?.s3link === 'not found' ||
                !classDetails?.data?.session?.s3link?.startsWith('https')
            ) {
                toast.error({
                    title: 'Recording not yet updated',
                })
            } else {
                window.open(classDetails?.data?.session?.s3link, '_blank')
            }
        } else {
            toast.error({
                title: 'Recording not yet updated',
            })
        }
    }

    const handleAttendance = async () => {
        if (!classDetails?.data) {
            toast.error({
                title: 'Class details not available.',
            })
            return
        }

        try {
            const { studentAttendanceRecords, invitedStudents, title } =
                classDetails.data.session

            const attendanceMap = new Map(
                studentAttendanceRecords.map((rec) => [rec.userId, rec])
            )

            const attendanceData = invitedStudents.map((student) => {
                const record = attendanceMap.get(student.userId)
                return {
                    userId: student.userId,
                    email: student.email,
                    duration: record ? record.duration : 0,
                    attendance: record ? record.status : 'absent',
                }
            })

            if (attendanceData.length === 0) {
                toast.error({
                    title: 'No attendance data to download.',
                })
                return
            }

            const headers = Object.keys(attendanceData[0])
            const csvContent = `${headers.join(',')}\n${attendanceData
                .map((row: any) =>
                    headers.map((header) => row[header]).join(',')
                )
                .join('\n')}`

            const encodedUri =
                'data:text/csv;charset=utf-8,' + encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute('href', encodedUri)
            link.setAttribute('download', `${title}_attendance.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error(
                'Error processing or downloading attendance data:',
                error
            )
            toast.error({
                title: 'Error generating attendance data',
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
                                    <h3 className="font-semibold text-lg">
                                        {ellipsis(
                                            classDetails?.data?.session
                                                ?.title ?? classData.title,
                                            30
                                        )}
                                    </h3>
                                </TooltipTrigger>
                                <TooltipContent className="font-semibold">
                                    {classDetails?.data?.session?.title ??
                                        classData.title}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </p>
                    <div className="text-[15px] flex font-semibold capitalize items-center">
                        <Moment format="D MMMM">
                            {classDetails?.data?.session?.startTime ??
                                classData.startTime}
                        </Moment>
                        <p className="mr-2">,</p>
                        <Moment format="hh:mm A">
                            {classDetails?.data?.session?.startTime ??
                                classData.startTime}
                        </Moment>
                        <p className="mx-2">-</p>
                        <Moment format="hh:mm A">
                            {classDetails?.data?.session?.endTime ??
                                classData.endTime}
                        </Moment>
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
                        <div
                            className={`flex items-center ${
                                classData.s3link === 'not found' ||
                                !classData?.s3link ||
                                within24Hours
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                        >
                            <TooltipProvider>
                                <SheetTrigger
                                    disabled={
                                        
                                        within24Hours
                                    }
                                    className={
                                        
                                        within24Hours
                                            ? 'cursor-not-allowed'
                                            : 'cursor-pointer'
                                    }
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="inline-block">
                                                <Button
                                                    variant="ghost"
                                                    className={`flex gap-2 items-center ${
                                                        
                                                        within24Hours
                                                            ? 'cursor-not-allowed'
                                                            : ''
                                                    }`}
                                                    onClick={handleClassDetails}
                                                    disabled={within24Hours}
                                                >
                                                    Class Details
                                                </Button>
                                            </div>
                                        </TooltipTrigger>
                                        {/* {(classData.s3link === 'not found' ||
                                            presentStudents === 0) && (
                                            <TooltipContent className="font-semibold">
                                                Recording is not available or
                                                attendance is 0
                                            </TooltipContent>
                                        )} */}
                                        {within24Hours && (
                                            <TooltipContent className="font-semibold">
                                                Class details will be updated 24
                                                hours after the class ends.
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </SheetTrigger>
                            </TooltipProvider>
                            <ChevronRight
                                size={15}
                                className={
                                    classData.s3link === 'not found' ||
                                    presentStudents === 0 ||
                                    within24Hours
                                        ? 'text-muted-foreground opacity-50'
                                        : ''
                                }
                            />
                        </div>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>
                                    <h1 className="mb-10 text-lg text-start">
                                        {classDetails?.data?.session?.title}
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
                                            Recording Not Available
                                        </p>
                                    )}
                                    <h3 className="mb-3 font-bold mt-3 text-[15px]">
                                        Attendance Information
                                    </h3>
                                    {isLoading ? (
                                        <p className="my-5">Loading...</p>
                                    ) : classDetails ? (
                                        <div className="flex mb-5">
                                            <div className="flex-grow basis-0">
                                                <p>Total Students</p>
                                                <p>
                                                    {
                                                        classDetails?.data
                                                            ?.analytics
                                                            ?.totalStudents
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
                                        <p className="my-5">
                                            No attendance data available.
                                        </p>
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
