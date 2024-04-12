import { ChevronRight, Clapperboard, Clock3, Download } from 'lucide-react'
import Moment from 'react-moment'

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

import { ellipsis } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import { Button } from '@/components/ui/button'

function RecordingCard({
    classData,
    isAdmin,
}: {
    classData: any
    isAdmin: Boolean
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
        <Card className="w-full p-6">
            <div className="flex justify-start">
                <Clapperboard size={40} className="text-yellow-dark mr-2" />
                <div>
                    <p className="text-xl text-start">
                        {ellipsis(classData.title, 40)}
                    </p>
                    <div className="text-md flex w-[200px] font-semibold capitalize items-center">
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
                            <SheetTrigger>Class Details</SheetTrigger>
                            <ChevronRight size={15} />
                        </div>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>
                                    <p className="text-xl text-start">
                                        {classData.title}
                                    </p>
                                </SheetTitle>
                                <SheetDescription>
                                    <p>Session Recording</p>
                                    <p className="text-md text-start">
                                        {classData.description}
                                    </p>
                                    <p>Attendance Information</p>
                                    <Button
                                        className="flex gap-2 items-center"
                                        onClick={handleAttendance}
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
