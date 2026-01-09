'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, UserCheck, UserX, CheckCircle, XCircle } from 'lucide-react'
import { DataTableColumnHeader } from '../../../../../../_components/datatable/data-table-column-header'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { getAttendancePercentage, getCompletedClasses } from '@/store/store'

interface ClassData {
    id: number
    title: string
    startTime: string
    endTime: string
    s3Link: string | null
    moduleId: number | null
    chapterId: number | null
    attendanceStatus: string
    duration: number
}

interface AttendanceColumnsProps {
    courseId: string
    studentId: string
    onStatusUpdate?: () => void
}

// Helper functions
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
        date: date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        })
    }
}

const getAttendanceStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
        case 'present':
            return {
                icon: CheckCircle,
                className: 'text-success',
                text: 'Present'
            }
        case 'absent':
            return {
                icon: XCircle,
                className: 'text-destructive',
                text: 'Absent'
            }
        default:
            return {
                icon: XCircle,
                className: 'text-muted-foreground',
                text: status || 'Unknown'
            }
    }
}

const updateAttendanceStatus = async (
    courseId: string, 
    sessionId: number, 
    studentId: string, 
    status: 'present' | 'absent',
    setCompletedClasses: (classes: ClassData[]) => void,
    setAttendancePercentage: (percentage: number) => void
) => {
    try {
        const endpoint = `/bootcamp/${courseId}/attendance/${sessionId}/mark`
        
        const payload = {
            userId: studentId,
            status: status
        }
        
        await api.post(endpoint, payload)

        const completedClassesEndpoint = `/student/bootcamp/${courseId}/completed-classes?userId=${studentId}`             
        const response = await api.get(completedClassesEndpoint)

        const classes = response.data?.data?.classes || []
        setCompletedClasses(classes)
        
        const stats = response.data?.data?.attendanceStats
        if (stats) {
            setAttendancePercentage(Math.round(stats.attendancePercentage || 0))
        } else if (classes.length > 0) {
            const totalClasses = classes.length
            const attendedClasses = classes.filter((c: ClassData) => c.attendanceStatus === 'present').length
            const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0
            setAttendancePercentage(percentage)
        } else {
            setAttendancePercentage(0)
        }
        
        toast({
            title: 'Success',
            description: `Attendance marked as ${status}`,
        })
        
        return true
    } catch (error: any) {
        console.error('Failed to update attendance:', error)
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update attendance'
        
        toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive'
        })
        
        return false
    }
}

// Separate component for the update status cell
const UpdateStatusCell = ({ 
    classData, 
    courseId, 
    studentId 
}: { 
    classData: ClassData
    courseId: string
    studentId: string
}) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(classData.attendanceStatus.toLowerCase())
    const isPresent = currentStatus === 'present'
    const { completedClasses, setCompletedClasses } = getCompletedClasses()
    const { attendancePercentage, setAttendancePercentage } = getAttendancePercentage()
    
    const handleStatusToggle = async (checked: boolean) => {
        setIsUpdating(true)
        const newStatus = checked ? 'present' : 'absent'
        const previousStatus = currentStatus
        
        // Optimistic update
        setCurrentStatus(newStatus)
        
        const success = await updateAttendanceStatus(
            courseId, 
            classData.id, 
            studentId, 
            newStatus,
            setCompletedClasses,
            setAttendancePercentage
        )
        
        if (!success) {
            // Revert on failure
            setCurrentStatus(previousStatus)
        }
        
        setIsUpdating(false)
    }
    
    return (
        <div className="flex items-center justify-start min-w-[100px] space-x-3">
            <div className="flex items-center space-x-2">
                <Switch
                    checked={isPresent}
                    onCheckedChange={handleStatusToggle}
                    disabled={isUpdating}
                    className={`
                        data-[state=checked]:bg-primary 
                        data-[state=unchecked]:bg-muted
                        ${isUpdating ? 'opacity-70' : ''}
                    `}
                />
                {isUpdating && (
                    <span className="text-xs text-muted-foreground">
                        Updating...
                    </span>
                )}
            </div>
        </div>
    )
}

export const createAttendanceColumns = (
    courseId: string, 
    studentId: string, 
    onStatusUpdate?: () => void
): ColumnDef<ClassData>[] => [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Live Class Name" />
        ),
        cell: ({ row }) => {
            const title = row.getValue('title') as string
            return (
                <div className="font-medium text-start w-[300px] truncate" title={title}>
                    {title}
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'startTime',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Start Date & Time" />
        ),
        cell: ({ row }) => {
            const startTime = row.getValue('startTime') as string
            const { date, time } = formatDateTime(startTime)
            
            return (
                <div className="flex flex-col min-w-[120px]">
                    <span className="font-medium text-gray-800">{date}</span>
                    <span className="text-sm text-muted-foreground">{time}</span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'endTime',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="End Date & Time" />
        ),
        cell: ({ row }) => {
            const endTime = row.getValue('endTime') as string
            const { date, time } = formatDateTime(endTime)
            
            return (
                <div className="flex flex-col min-w-[120px]">
                    <span className="font-medium text-gray-800">{date}</span>
                    <span className="text-sm text-muted-foreground">{time}</span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'duration',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Duration" />
        ),
        cell: ({ row }) => {
            const duration = row.getValue('duration') as number
            
            return (
                <div className="flex items-center space-x-1 min-w-[80px]">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-gray-800">
                        {duration !== null && duration !== undefined ? `${duration} mins` : 'N/A'}
                    </span>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'attendanceStatus',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue('attendanceStatus') as string
            const statusDisplay = getAttendanceStatusDisplay(status)
            const StatusIcon = statusDisplay.icon
            
            return (
                <div className="flex items-center justify-start min-w-[100px] space-x-2">
                    <StatusIcon className={`h-4 w-4 ${statusDisplay.className}`} />
                    <span className={`text-sm font-medium ${statusDisplay.className}`}>
                        {statusDisplay.text}
                    </span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            const status = row.getValue(id) as string
            return value.includes(status?.toLowerCase())
        },
    },
    {
        id: 'updateStatus',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Update Status" />
        ),
        cell: ({ row }) => {
            const classData = row.original
            
            return (
                <UpdateStatusCell 
                    classData={classData}
                    courseId={courseId}
                    studentId={studentId}
                />
            )
        },
        enableSorting: false,
    },
]

// For backward compatibility
export const attendanceColumns = createAttendanceColumns('', '', undefined)