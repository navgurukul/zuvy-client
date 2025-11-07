import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, Users, ExternalLink } from 'lucide-react'
import { LiveClassProps } from '@/app/[admin]/courses/[courseId]/module/_components/liveClass/ModuleLiveClassType'
import { getEmbedLink } from '@/utils/admin'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const LiveClass = ({
    chapterData,
    content,
    moduleId,
    courseId,
}: LiveClassProps) => {
    const session = content?.sessionDetails?.[0]

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'upcoming':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'ongoing':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const handleDownloadAttendance = async () => {
        try {
            const sessionId = session.id || session.meetingId || session.title
            const res = await api.get(`/classes/analytics/${sessionId}`)
            const data = res.data

            const studentRecords =
                data?.data?.session?.studentAttendanceRecords ?? []
            const invited = data?.data?.session?.invitedStudents ?? []

            type AttendanceRecord = {
                userId: number | string
                duration?: number
                status?: string
            }

            const attendanceMap = new Map(
                studentRecords.map((r: AttendanceRecord) => [r.userId, r])
            )

            const attendanceData = invited.map((student: any) => {
                const record = attendanceMap.get(student.userId) as
                    | AttendanceRecord
                    | undefined
                return {
                    userId: student.userId,
                    name: student.name ?? '',
                    email: student.email ?? '',
                    duration:
                        record && record.duration !== undefined
                            ? record.duration
                            : 0,
                    attendance:
                        record && record.status ? record.status : 'absent',
                }
            })

            if (attendanceData.length === 0) {
                toast.error({ title: 'No attendance data to download.' })
                return
            }


            const headers = Object.keys(attendanceData[0])
            const csvContent = `${headers.join(',')}\n${attendanceData
                .map((row: any) =>
                    headers
                        .map((header) => `"${String(row[header] ?? '')}"`)
                        .join(',')
                )
                .join('\n')}`

            const encodedUri =
                'data:text/csv;charset=utf-8,' + encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute(
                'href',
                encodedUri
            )
            link.setAttribute(
                'download',
                `${data?.data?.session?.title ?? 'attendance'}_attendance.csv`
            )
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Failed to download attendance', err)
            toast.error({ title: 'Failed to download attendance' })
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'upcoming':
                return <Clock className="w-3 h-3" />
            case 'ongoing':
                return <Video className="w-3 h-3" />
            case 'completed':
                return <Users className="w-3 h-3" />
            default:
                return <Clock className="w-3 h-3" />
        }
    }

    if (!content || !session) {
        return (
            <div className="w-3/4 mx-auto p-4">
                <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                            No live class data available
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-3/4 mx-auto">
            <div className="">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-left text-primary leading-tight mb-2">
                                {content.title}
                            </h3>
                            {content?.description && (
                                <p className="text-sm text-left text-muted-foreground mb-3">
                                    {content.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <Badge
                                    // variant="secondary"
                                    className={`${getStatusColor(
                                        session.status
                                    )} font-medium px-3 py-1 flex items-center gap-1`}
                                >
                                    {getStatusIcon(session.status)}
                                    {session.status.charAt(0).toUpperCase() +
                                        session.status.slice(1)}
                                </Badge>
                            </div>
                        </div>

                        {/* Download attendance button */}
                        <div className="ml-4 mt-5 flex items-center">
                            <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger>
                            
                            <Button
                                className="font-medium py-2 px-3 transition-all duration-200 bg-primary text-primary-foreground"
                                onClick={handleDownloadAttendance}
                                disabled={!session?.s3link || session?.s3link === 'not found'}
                            >
                                <span className="text-primary-foreground">Download Attendance</span>
                            </Button>
                            
                            <TooltipContent>
                                <p className="text-sm">{!session?.s3link || session?.s3link === 'not found' ? 'No attendance report available' : 'Click to download attendance report'}</p>
                            </TooltipContent>

                            </TooltipTrigger>
                         </Tooltip>
                         </TooltipProvider>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {formatDate(session.startTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {formatTime(session.startTime)} -{' '}
                                {formatTime(session.endTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                Created by {session.creator}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 ">
                        {session.status.toLowerCase() === 'completed' &&
                        session.s3link &&
                        session.s3link !== 'not found' ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    Meeting Recording
                                </h4>
                                <div className="w-5/6 bg-foreground rounded-lg overflow-hidden">
                                    <iframe
                                        src={getEmbedLink(session.s3link)}
                                        className="w-full h-80 border-0"
                                        allowFullScreen
                                        title={`Recording: ${session.title}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            </div>
                        ) : (
                            <Button
                                className={`w-full font-medium py-2.5 transition-all duration-200 text-primary-foreground ${
                                    session.status.toLowerCase() !== 'ongoing'
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                onClick={() => {
                                    if (
                                        session.status.toLowerCase() !==
                                        'ongoing'
                                    )
                                        return
                                    window.open(session.hangoutLink, '_blank')
                                }}
                            >
                                <Video className="w-4 h-4 mr-2 text-primary-foreground" />
                                <span className="text-primary-foreground">
                                    {session.status.toLowerCase() ===
                                    'completed'
                                        ? 'Recording Not Available'
                                        : session.status.toLowerCase() ===
                                          'ongoing'
                                        ? 'Join Live Meeting'
                                        : 'Join Meeting'}
                                </span>
                                {session.status.toLowerCase() !==
                                    'completed' && (
                                    <ExternalLink className="w-3 h-3 ml-2" />
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </div>
        </div>
    )
}

export default LiveClass