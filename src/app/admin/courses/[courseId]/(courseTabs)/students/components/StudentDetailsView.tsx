'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Clock, Calendar, User, Filter } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

interface Meeting {
    id: number
    title: string
    date: string
    duration: number
    isPresent: boolean
    startTime: string
    endTime: string
    description?: string
}

interface StudentDetails {
    id: number
    name: string
    email: string
    batchName: string
    profilePicture?: string
}

interface StudentDetailsViewProps {
    courseId: string
    studentId: string
    onBack: () => void
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ 
    courseId, 
    studentId, 
    onBack 
}) => {
    const [student, setStudent] = useState<StudentDetails | null>(null)
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [attendanceFilter, setAttendanceFilter] = useState('all')

    useEffect(() => {
        fetchStudentDetails()
        fetchMeetings()
    }, [studentId, courseId])

    useEffect(() => {
        filterMeetings()
    }, [meetings, searchTerm, attendanceFilter])

    const fetchStudentDetails = async () => {
        try {
            const response = await api.get(`/student/${studentId}`)
            setStudent(response.data.data)
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description: 'Failed to fetch student details',
            })
        }
    }

    const fetchMeetings = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/meetings/student/${studentId}/batch`)
            setMeetings(response.data.data)
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description: 'Failed to fetch meetings',
            })
        } finally {
            setLoading(false)
        }
    }

    const filterMeetings = () => {
        let filtered = meetings

        if (searchTerm) {
            filtered = filtered.filter(meeting =>
                meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (attendanceFilter !== 'all') {
            filtered = filtered.filter(meeting =>
                attendanceFilter === 'present' ? meeting.isPresent : !meeting.isPresent
            )
        }

        setFilteredMeetings(filtered)
    }

    const toggleAttendance = async (meetingId: number, currentStatus: boolean) => {
        try {
            await api.patch(`/meetings/${meetingId}/attendance/${studentId}`, {
                isPresent: !currentStatus
            })
            
            setMeetings(prev =>
                prev.map(meeting =>
                    meeting.id === meetingId
                        ? { ...meeting, isPresent: !currentStatus }
                        : meeting
                )
            )
            
            toast.success({
                title: 'Success',
                description: `Attendance ${!currentStatus ? 'marked' : 'unmarked'} successfully`,
            })
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description: 'Failed to update attendance',
            })
        }
    }

    // ... rest of your existing functions (formatDuration, formatDate, getAttendanceStats)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Go Back</span>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
                        <p className="text-gray-600">Meeting attendance and details</p>
                    </div>
                </div>
            </div>

            {/* Rest of your existing JSX */}
            {/* ... */}
        </div>
    )
}

export default StudentDetailsView