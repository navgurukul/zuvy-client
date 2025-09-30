'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Mail, Calendar, Search, Filter, CalendarRange } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { DataTable } from '../../../../../../_components/datatable/data-table'
import { createAttendanceColumns } from './attendanceColumns'

interface StudentDetailsViewProps {
    courseId: string
    studentId: string
    onBack: () => void
}

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

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({
    courseId,
    studentId,
    onBack
}) => {
    const [completedClasses, setCompletedClasses] = useState<ClassData[]>([])
    const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attendancePercentage, setAttendancePercentage] = useState<number>(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [studentInfo, setStudentInfo] = useState<{
        name: string
        email: string
        batchName: string
        status: string
    }>({
        name: '',
        email: '',
        batchName: '',
        status: ''
    })

    // Create columns with courseId and studentId
    const attendanceColumns = createAttendanceColumns(
        courseId, 
        studentId, 
        () => {
            // Refresh data after status update
            fetchCompletedClasses()
        }
    )

    useEffect(() => {
        fetchCompletedClasses()
        fetchStudentInfo()
    }, [studentId, courseId])

    useEffect(() => {
        filterClasses()
    }, [completedClasses, searchTerm, statusFilter, fromDate, toDate])

    const fetchStudentInfo = async () => {
        try {
            const response = await api.get(`/bootcamp/students/${courseId}?userId=${studentId}`)
            const student = response.data?.modifiedStudentInfo?.find((s: any) => s.userId == studentId)

            if (student) {
                setStudentInfo({
                    name: student.name || 'Unknown Student',
                    email: student.email || 'No email',
                    batchName: student.batchName || 'No batch assigned',
                    status: student.status || 'Active'
                })
            }
        } catch (error: any) {
            console.error('Failed to fetch student info:', error)
            setStudentInfo({
                name: 'Student Details',
                email: 'Loading...',
                batchName: 'Loading...',
                status: 'Unknown'
            })
        }
    }

    const fetchCompletedClasses = async () => {
        try {
            setLoading(true)
            setError(null)

            const endpoint = `/student/bootcamp/${courseId}/completed-classes?userId=${studentId}`
            const response = await api.get(endpoint)

            const classes = response.data?.data?.classes || []
            setCompletedClasses(classes)

            if (Array.isArray(classes) && classes.length > 0) {
                const totalClasses = classes.length
                const attendedClasses = classes.filter((classData: ClassData) =>
                    classData.attendanceStatus === 'present'
                ).length

                const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0
                setAttendancePercentage(percentage)
            } else {
                setAttendancePercentage(0)
            }

        } catch (error: any) {
            console.error('API Error:', error)

            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch completed classes'
            setError(errorMessage)

            toast({
                title: 'API Error',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const filterClasses = () => {
        let filtered = completedClasses

        // Search filter by class name
        if (searchTerm) {
            filtered = filtered.filter(classItem =>
                classItem.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Status filter by attendance status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(classItem =>
                classItem.attendanceStatus.toLowerCase() === statusFilter.toLowerCase()
            )
        }

        // Date range filter
        if (fromDate) {
            const fromDateTime = new Date(fromDate)
            filtered = filtered.filter(classItem => {
                const classDate = new Date(classItem.startTime)
                return classDate >= fromDateTime
            })
        }

        if (toDate) {
            const toDateTime = new Date(toDate)
            toDateTime.setHours(23, 59, 59, 999) // End of day
            filtered = filtered.filter(classItem => {
                const classDate = new Date(classItem.startTime)
                return classDate <= toDateTime
            })
        }

        setFilteredClasses(filtered)
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'default'
            case 'inactive':
            case 'suspended':
                return 'destructive'
            case 'pending':
                return 'secondary'
            case 'completed':
                return 'outline'
            default:
                return 'secondary'
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Back Button */}
            <div className="flex items-center mb-8">
                <p
                    // variant="outline"
                    // size="sm"
                    onClick={onBack}
                    className="text-sm text-foreground flex items-center space-x-2 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Students</span>
                </p>
            </div>

            {/* Student Info Header */}
            <div className="flex items-center justify-between">
                {/* Left Side - Student Information */}
                <div className="flex flex-col items-start space-y-2">
                    {/* Name and Status */}
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-foreground">{studentInfo.name}</h1>
                        <Badge
                            variant={getStatusBadgeVariant(studentInfo.status)}
                            className="text-xs"
                        >
                            {studentInfo.status}
                        </Badge>
                    </div>

                    {/* Email with Icon */}
                    <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{studentInfo.email}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">Batch: {studentInfo.batchName}</p>
                    </div>
                </div>

                {/* Right Side - Overall Attendance Percentage */}
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Overall Attendance</p>
                        <p className="text-2xl font-bold text-foreground">{attendancePercentage}%</p>
                    </div>
                </div>
            </div>

            {/* Filters Row - All 4 filters in one line - Left aligned */}
            <div className="flex items-center gap-4 flex-wrap justify-start">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by class name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-[300px]"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-2 mt-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* From Date Filter */}
                <div className="flex items-center space-x-2">
                    <p className='text-foreground mt-2'>From:</p>
                    <Input
                        type="date"
                        placeholder="From Date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        max={toDate || undefined} // From date cannot be after To date
                        className="w-[150px]"
                    />
                </div>

                {/* To Date Filter */}
                <div className="flex items-center space-x-2">
                    <p className='text-foreground mt-2'>To:</p>
                    <Input
                        type="date"
                        placeholder="To Date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        min={fromDate || undefined} // To date cannot be before From date
                        className="w-[150px]"
                    />
                </div>

                {/* Clear Filters Button */}
                {(searchTerm || statusFilter !== 'all' || fromDate || toDate) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setFromDate('')
                            setToDate('')
                        }}
                        className="whitespace-nowrap mt-2"
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <p className="text-gray-600">Loading class attendance...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card className="border-red-200">
                    <CardContent className="text-center py-8">
                        <div className="space-y-4">
                            <p className="text-destructive">{error}</p>
                            <Button onClick={fetchCompletedClasses} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data Table */}
            {!loading && !error && (
                <div className="space-y-4">
                    <DataTable
                        columns={attendanceColumns}
                        data={filteredClasses}
                    />
                </div>
            )}
        </div>
    )
}

export default StudentDetailsView