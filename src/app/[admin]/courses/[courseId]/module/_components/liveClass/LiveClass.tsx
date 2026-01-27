import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, Users, ExternalLink, Info, CalendarIcon } from 'lucide-react'
import { LiveClassProps } from '@/app/[admin]/courses/[courseId]/module/_components/liveClass/ModuleLiveClassType'
import { getEmbedLink } from '@/utils/admin'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {RecordingSkeletons} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import PermissionAlert from '@/app/_components/PermissionAlert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { getBatchDataNew } from '@/utils/students'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getModuleData, getChapterDataState } from '@/store/store'

const liveClassSchema = z
    .object({
        title: z.string().min(1, 'Title is required').max(50, 'Title must not exceed 50 characters'),
        description: z.string().min(1, 'Description is required'),
        date: z.string().min(1, 'Date is required'),
        startTime: z.string().min(1, 'Start time is required'),
        endTime: z.string().min(1, 'End time is required'),
        batch: z.string().min(1, 'Batch is required'),
        secondaryBatch: z.string().optional(),
        meetingPlatform: z.string(),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: 'Start Time cannot be after or equal to end Time',
        path: ['endTime'],
    })
    .refine((data) => {
        // Ensure at least 30 minutes gap between startTime and endTime
        if (!data.startTime || !data.endTime) return true
        const [startHour, startMinute] = data.startTime.split(':').map(Number)
        const [endHour, endMinute] = data.endTime.split(':').map(Number)
        const start = startHour * 60 + startMinute
        const end = endHour * 60 + endMinute
        return end - start >= 30
    }, {
        message: 'There must be at least 30 minutes between start and end time',
        path: ['endTime'],
    })

type LiveClassFormData = z.infer<typeof liveClassSchema>

const LiveClass = ({
    // chapterData,
    content,
    fetchChapterContent,
    moduleId,
    courseId,
    canEdit = true,
    chapterId,
    topicId,
}: LiveClassProps) => {
    const session = content?.sessionDetails?.[0]
    const [isLoading, setIsLoading] = useState(true)
    const [alertOpen, setAlertOpen] = useState(false)
    const [batchData, setBatchData] = useState<any[]>([])
    const [recordingLink, setRecordingLink] = useState<string | null>(null)
        const { moduleData, setModuleData } = getModuleData()    
        const { chapterData, setChapterData } = getChapterDataState()    
        const isUpcoming = session?.status?.toLowerCase() === 'upcoming'
    const canEditFields = canEdit && isUpcoming

    const form = useForm<LiveClassFormData>({
        resolver: zodResolver(liveClassSchema),
        defaultValues: {
            title: '',
            description: '',
            date: '',
            startTime: '',
            endTime: '',
            batch: '',
            secondaryBatch: '',
            meetingPlatform: 'zoom',
        },
    })


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
        if (!canEdit) return
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

    // Watch startTime and endTime for real-time validation
    const startTime = form.watch('startTime')
    const endTime = form.watch('endTime')

    // Trigger validation when times change
    React.useEffect(() => {
        if (startTime && endTime) {
            form.trigger(['startTime', 'endTime'])
        }
    }, [startTime, endTime, form])

    // Fetch recording link from analytics API for completed sessions
    useEffect(() => {
        const fetchRecordingLink = async () => {
            if (session?.status?.toLowerCase() === 'completed' && session?.id) {
                try {
                    const res = await api.get(`/classes/analytics/${session.id}`)
                    const analyticsS3Link = res.data?.data?.session?.s3link
                    const analyticsRecordingLink = res.data?.data?.session?.recordingLink
                    const analyticsYoutubeLink = res.data?.data?.session?.youtubeLink
                    
                    // Set recording link if available
                    if (analyticsS3Link && analyticsS3Link !== 'not found') {
                        setRecordingLink(analyticsS3Link)
                    } else if (analyticsRecordingLink) {
                        setRecordingLink(analyticsRecordingLink)
                    } else if (analyticsYoutubeLink) {
                        setRecordingLink(analyticsYoutubeLink)
                    }
                } catch (error) {
                    console.error('Error fetching recording link:', error)
                }
            }
        }

        fetchRecordingLink()
    }, [session?.id, session?.status])

    useEffect(() => {

        getBatchDataNew(courseId).then((data) => {
            setBatchData(data.data)
        })

       if (content && content.sessionDetails?.length > 0) {
        const sessionStartTime = new Date(session?.startTime || '')
        const sessionEndTime = new Date(session?.endTime || '')
        
        const initialData = {
            title: content?.title || '',
            description: content?.description || '',
            date: session?.startTime ? sessionStartTime.toISOString().split('T')[0] : '',
            startTime: session?.startTime ? sessionStartTime.toTimeString().slice(0, 5) : '',
            endTime: session?.endTime ? sessionEndTime.toTimeString().slice(0, 5) : '',
            batch: content?.batchId?.toString() || session?.batch || '',
            secondaryBatch: content?.secondbatchId?.toString() || session?.secondaryBatch || '',
            meetingPlatform: 'zoom',
        }
        form.reset(initialData)
        setIsLoading(false)
       }
    }, [content, session, form])

    const onSubmit = async (data: LiveClassFormData) => {
        if (!canEditFields) return
                    // Capitalize title - convert to title case
                    const capitalizeTitle = (str: string) => {
                        return str
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                    }

        try {
            // Use the same date formatting logic as createLiveClass
            const combineDateTime = (date: Date, time: string) => {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}T${time}:00`
            }

            // Convert string date to Date object
            const dateObj = new Date(data.date)
            const startDateTime = combineDateTime(dateObj, data.startTime)
            const endDateTime = combineDateTime(dateObj, data.endTime)
            
                        // Capitalize the title before sending
                        const capitalizedTitle = capitalizeTitle(data.title)
            
            // Generate payload in the required format
            const payload = {
                title: capitalizedTitle,
                description: data.description,
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                isZoomMeet: data.meetingPlatform === 'zoom',
                batchId: parseInt(data.batch),
                secondBatchId: data.secondaryBatch && data.secondaryBatch !== 'none' ? parseInt(data.secondaryBatch) : undefined,
            }
            
            // console.log('Payload:', payload)
            
            const sessionId =  session.id
            await api.put(`/classes/sessions/${sessionId}`, payload)
            
            // Update both moduleData and chapterData in store to reflect title change in sidebar
            if (capitalizedTitle !== content?.title) {
                const updatedData = moduleData.map((chapter: any) => 
                    chapter.chapterId === chapterId 
                        ? { ...chapter, chapterTitle: capitalizedTitle }
                        : chapter
                )
                setModuleData(updatedData)
                setChapterData(updatedData)
            }
            
            // Fetch updated content
            if (chapterId && topicId) {
                await fetchChapterContent(chapterId, topicId)
            }
            
            toast.success({ title: 'Live class updated successfully' })
        } catch (err) {
            console.error('Failed to update live class', err)
            toast.error({ title: 'Failed to update live class' })
        }
    }

    const handleCancelChanges = () => {
        form.reset()
    }

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
    }


    if (isLoading) {
       return <RecordingSkeletons/>
    }

    console.log('Session Data:', session)
    console.log('Recording Links - s3link:', session?.s3link, 'recordingLink:', session?.recordingLink, 'youtubeLink:', session?.youtubeLink)

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
        <div className="w-4/5 mx-auto py-6 h-full flex flex-col">
            {!canEdit && (
                <PermissionAlert
                    alertOpen={alertOpen}
                    setAlertOpen={setAlertOpen}
                />
            )}          
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background rounded-lg flex flex-col h-[600px] overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Header with title and status badge */}
                    <div className="flex items-start justify-between border-b pb-4">
                        <h2 className="text-2xl font-semibold text-foreground">
                            {content.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <Badge
                                className={`${getStatusColor(
                                    session.status
                                )} font-medium px-3 py-1 text-sm`}
                            >
                                {session.status.charAt(0).toUpperCase() +
                                    session.status.slice(1)}
                            </Badge>
                            {/* Download Attendance Button for Completed Classes */}
                            {session.status.toLowerCase() === 'completed' && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="font-medium"
                                                onClick={handleDownloadAttendance}
                                                disabled={
                                                    !canEdit ||
                                                    !session?.s3link ||
                                                    session?.s3link === 'not found'
                                                }
                                            >
                                                Download Attendance
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-sm">
                                                {!session?.s3link || session?.s3link === 'not found' 
                                                    ? 'No attendance report available' 
                                                    : 'Click to download attendance report'}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                    {/* Title Input */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium text-foreground block text-left">
                                        Title
                                    </FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Advanced Event Handling"
                                        disabled={!canEditFields}
                                        maxLength={50}
                                        className="bg-card border-input"
                                    />
                                </FormControl>
                                {field.value?.length >= 50 && (
                                    <p className="text-sm text-red-600 font-medium text-left">
                                        You can enter up to 100 characters only.
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Date, Start Time, End Time Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground block mb-3 text-left">
                                        Date
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    disabled={!canEditFields}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-card border-input",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        field.onChange(format(date, "yyyy-MM-dd"))
                                                    }
                                                }}
                                                disabled={(date) => {    
                                                    const today = new Date()
                                                    today.setHours(0, 0, 0, 0)
                                                    return date < today
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground block text-left">
                                        Start Time
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="time"
                                            disabled={!canEditFields}
                                            className="bg-card border-input"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground block text-left">
                                        End Time
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="time"
                                            disabled={!canEditFields}
                                            className="bg-card border-input"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Batch and Secondary Batch Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="batch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground block mb-3 text-left">
                                        Batch
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!canEditFields}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-card border-input">
                                                <SelectValue placeholder="Select batch" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {batchData?.filter(batch => batch.id.toString() !== form.watch('secondaryBatch') || form.watch('secondaryBatch') === 'none').map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                                    {batch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="secondaryBatch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground block mb-2  text-left">
                                        Secondary Batch <span className="text-muted-foreground">(optional)</span>
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!canEditFields}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-card border-input">
                                                <SelectValue placeholder="Select secondary batch" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {batchData?.filter(batch => batch.id.toString() !== form.watch('batch')).map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                                    {batch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Meeting Platform Radio Buttons */}
                    <FormField
                        control={form.control}
                        name="meetingPlatform"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-medium text-foreground text-left block">
                                    Meeting Platform
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!canEditFields}
                                        className="flex gap-6"
                                    >
                                        <div className="flex space-x-2">
                                            <RadioGroupItem value="zoom" id="zoom" disabled={!canEditFields} />
                                            <Label htmlFor="zoom" className="font-normal cursor-pointer text-foreground">
                                                Zoom
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Zoom Integration Info Box */}
                    {form.watch('meetingPlatform') === 'zoom' && isUpcoming && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-left text-blue-900 text-sm">
                                    Zoom Meeting Integration
                                </h4>
                                <p className="text-sm text-blue-700">
                                    A Zoom class link will be generated and emailed to everyone automatically when you save this live class.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recording or Meeting Link Section */}
                {session.status.toLowerCase() === 'completed' ? (
                    (session.s3link && session.s3link !== 'not found') || 
                    session.recordingLink || 
                    session.youtubeLink ||
                    recordingLink ? (
                        <div className="space-y-3 pt-4 border-t">
                            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Meeting Recording
                            </h4>
                            <div className="bg-foreground/5 rounded-lg overflow-hidden">
                                <iframe
                                    src={getEmbedLink(
                                        recordingLink ||
                                        (session.s3link && session.s3link !== 'not found' 
                                            ? session.s3link 
                                            : session.recordingLink || session.youtubeLink)
                                    )}
                                    className="w-full h-80 border-0"
                                    allowFullScreen
                                    title={`Recording: ${session.title}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 border-t">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-medium text-left text-yellow-900 text-sm">
                                        Recording Processing
                                    </h4>
                                    <p className="text-sm text-yellow-700">
                                        The recording is being processed and will be available shortly. Please refresh the page after some time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                ) : session.status.toLowerCase() === 'ongoing' ? (
                    <div className="pt-4 border-t">
                        <Button
                            className="w-full font-medium"
                            onClick={() => window.open(session.hangoutLink, '_blank')}
                            disabled={!canEdit}
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Join Live Meeting
                            <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                ) : null}
                </div>

                {/* Action Buttons - Show when form is dirty */}
                {form.formState.isDirty && canEditFields && (
                    <div className="border-t bg-background p-4 flex justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelChanges}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-6 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Save Live Class
                        </Button>
                    </div>
                )}
            </form>
            </Form>
        </div>
    )
}

export default LiveClass