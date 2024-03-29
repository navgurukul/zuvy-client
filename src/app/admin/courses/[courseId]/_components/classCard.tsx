import { ChevronRight, Clock3 } from 'lucide-react'
import Moment from 'react-moment'
import Link from 'next/link'

import { toast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import api from '@/utils/axios.config'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

function ClassCard({
    classData,
    classType,
}: {
    classData: any
    classType: any
}) {
    // misc
    const isVideo = classData.s3link

    // func
    const handleViewRecording = () => {
        if (isVideo) {
            window.open(classData.s3link, '_blank')
        } else {
            toast({
                title: 'Recording not yet updated',
                variant: 'default',
                className: 'text-start capitalize',
            })
        }
    }

    const handleAttendance = async () => {
        try {
            const response = await api.get(
                `/classes/getAttendance/${classData.meetingid}`
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
            toast({
                title: 'Error fetching attendance data',
                variant: 'default',
                className: 'text-start capitalize',
            })
        }
    }

    return (
        <Card className="w-full p-6" key={classData.id}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="font-bold text-lg flex flex-col">
                        <Moment format="DD">{classData.startTime}</Moment>{' '}
                        <Moment format="MMM">{classData.startTime}</Moment>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="bg-foreground h-[90px]"
                    />
                    <div className="text-start">
                        {classType === 'ongoing' ? (
                            <Badge variant="yellow" className="mb-3">
                                Ongoing
                            </Badge>
                        ) : null}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <h3 className="font-semibold">
                                        {classData.title}
                                    </h3>
                                </TooltipTrigger>
                                <TooltipContent className="font-semibold">
                                    {classData.title}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="text-md flex w-[200px] font-semibold capitalize items-center">
                            <Clock3 className="mr-2" width={20} height={20} />
                            <Moment format="hh:mm A">
                                {classData.startTime}
                            </Moment>
                            <p className="mx-2">-</p>
                            <Moment format="hh:mm A">
                                {classData.endTime}
                            </Moment>
                        </div>
                    </div>
                </div>
                <div className="flex w-full items-center text-lg font-bold justify-center">
                    {classType !== 'complete' ? (
                        <Link
                            target="_blank"
                            href={classData.hangoutLink}
                            className="gap-3 flex  items-center text-secondary"
                        >
                            <p>Join Class</p>
                            <ChevronRight size={15} />
                        </Link>
                    ) : (
                        <div className="w-auto ">
                            <div
                                onClick={handleViewRecording}
                                className=" gap-3 items-center text-secondary cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <p className="mr-1">View Recording</p>
                                    <ChevronRight size={15} />
                                </div>
                            </div>
                            {/* commented btn as not required in student side */}
                            {/* <div onClick={handleAttendance}>
                                <Button>ATTENDANCE</Button>
                            </div> */}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default ClassCard
