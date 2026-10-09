'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Mail } from 'lucide-react'
import { useGetStudentInfo } from '@/app/[admin]/hooks/useGetStudentInfo'
import { useGetStudentCompletedClasses } from '@/app/[admin]/hooks/useGetStudentCompletedClasses'
import { useLearnerProfiles } from '@/app/[admin]/hooks/useLearnerProfiles'
import { toast } from '@/components/ui/use-toast'
import { DataTable } from '../../../../../../../../_components/datatable/data-table'
import { createAttendanceColumns } from './attendanceColumns'
import { StudentDetailsViewProps, ClassData } from './courseStudentComponentType'
import { SearchBox } from '@/utils/searchBox'
import { z } from 'zod'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { getCompletedClasses, getAttendancePercentage } from '@/store/store'

const dateFilterSchema = z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
})
    .refine((data) => {
        // If toDate is provided but fromDate is not, return error
        if (data.toDate && !data.fromDate) {
            return false
        }
        return true
    }, {
        message: 'Please select a From date first.',
        path: ['toDate']
    })
    .refine((data) => {
        // If both dates exist, fromDate should not be after toDate
        if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
            return false
        }
        return true
    }, {
        message: 'From date cannot be after To date.',
        path: ['fromDate']
    })

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({
    courseId,
    studentId,
    onBack
}) => {

    const { completedClasses, setCompletedClasses } = getCompletedClasses()
    const { attendancePercentage, setAttendancePercentage } = getAttendancePercentage()
    const { getStudentInfo } = useGetStudentInfo()
    const { getStudentCompletedClasses } = useGetStudentCompletedClasses()
    const { learnerProfile, loading: profileLoading } = useLearnerProfiles(studentId)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'profile' | 'attendance'>('profile')
    const [activeProfileSection, setActiveProfileSection] = useState('Basic Info')
    const [isFromCalendarOpen, setFromCalendarOpen] = useState(false)
    const [isToCalendarOpen, setToCalendarOpen] = useState(false)
    const [dateErrors, setDateErrors] = useState<{
        fromDate?: string
        toDate?: string
    }>({})
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
            fetchCompletedClasses(searchTerm)
        }
    )

    // Validate dates using Zod
    const validateDates = (from: string, to: string) => {
        try {
            dateFilterSchema.parse({ fromDate: from, toDate: to })
            setDateErrors({}) // Clear all errors if validation passes
            return true
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errors: { fromDate?: string; toDate?: string } = {}
                err.errors.forEach((error) => {
                    const path = error.path[0] as 'fromDate' | 'toDate'
                    errors[path] = error.message
                })
                setDateErrors(errors)

                // Show toast for the first error
                const firstError = err.errors[0]
            }
            return false
        }
    }


    const fetchStudentInfo = async () => {
        try {
            const response = await getStudentInfo(courseId, studentId)
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

    const fetchCompletedClasses = useCallback(async (searchTermParam?: string) => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                userId: studentId.toString()
            })

            const currentSearchTerm = searchTermParam !== undefined ? searchTermParam : searchTerm

            if (currentSearchTerm && currentSearchTerm.trim()) {
                params.append('searchTerm', currentSearchTerm.trim())
            }

            if (statusFilter !== 'all') {
                params.append('attendanceStatus', statusFilter)
            }

            // Only add date filters if BOTH dates are selected and valid
            if (fromDate && toDate && fromDate <= toDate) {
                params.append('fromDate', fromDate)
                params.append('toDate', toDate)
            }

            const response = await getStudentCompletedClasses(courseId, params)

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

        } catch (error: any) {
            console.error('API Error:', error)

            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch completed classes'
            setError(errorMessage)

            toast.error({
                title: 'API Error',
                description: errorMessage,
            })
        } finally {
            setLoading(false)
        }
    }, [courseId, studentId, statusFilter, fromDate, toDate, searchTerm, getStudentCompletedClasses])

    useEffect(() => {
        const loadData = async () => {
            await fetchStudentInfo()

            const params = new URLSearchParams(window.location.search)
            const search = params.get("search") || ""

            setSearchTerm(search)
            fetchCompletedClasses(search)
        }

        loadData()
    }, [studentId, courseId, fetchCompletedClasses])


    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!query.trim()) return []

        try {
            const params = new URLSearchParams({
                userId: studentId.toString(),
                searchTerm: query.trim()
            })

            if (statusFilter !== 'all') {
                params.append('attendanceStatus', statusFilter)
            }

            if (fromDate && toDate && fromDate <= toDate) {
                params.append('fromDate', fromDate)
                params.append('toDate', toDate)
            }

            const res = await getStudentCompletedClasses(courseId, params)

            return res.data?.data?.classes?.map((classItem: any) => ({
                ...classItem,
                name: classItem.title
            })) || []
        } catch (error) {
            console.error('Search suggestions error:', error)
            return []
        }
    }, [courseId, studentId, statusFilter, fromDate, toDate, getStudentCompletedClasses])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setSearchTerm(query)
        await fetchCompletedClasses(query)
    }, [fetchCompletedClasses])

    const defaultFetchApi = useCallback(async () => {
        setSearchTerm('')
        await fetchCompletedClasses('')
    }, [fetchCompletedClasses])

    const handleFromDateChange = (value: string) => {
        setFromDate(value)
        // Validate with the new fromDate and existing toDate
        validateDates(value, toDate)
    }

    const handleToDateChange = (value: string) => {
        setToDate(value)
        // Validate with existing fromDate and new toDate
        validateDates(fromDate, value)
    }

    // Trigger API call when filters change
    useEffect(() => {
        // Don't fetch if there are validation errors
        if (Object.keys(dateErrors).length > 0) {
            return
        }

        // Don't fetch if only fromDate is set (wait for toDate)
        if (fromDate && !toDate) {
            return
        }

        const shouldFetch =
            statusFilter !== 'all' ||
            (fromDate && toDate && fromDate <= toDate) ||
            (!fromDate && !toDate)

        if (shouldFetch && !loading) {
            const timer = setTimeout(() => {
                fetchCompletedClasses(searchTerm)
            }, 300)

            return () => clearTimeout(timer)
        }
    }, [statusFilter, fromDate, toDate, dateErrors])

    const clearFilters = () => {
        setStatusFilter('all')
        setFromDate('')
        setToDate('')
        setDateErrors({})
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

    const hasActiveFilters = statusFilter !== 'all' || fromDate || toDate

    const profileDetails = learnerProfile
    const graduationDate = profileDetails?.graduationMonth && profileDetails.graduationYear
        ? `${new Date(0, profileDetails.graduationMonth - 1).toLocaleString('en-US', { month: 'short' })} ${profileDetails.graduationYear}`
        : 'Not provided'

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Back Button */}
            <div className="flex items-center mb-8">
                <p
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
                        <h1 className="text-2xl font-bold text-foreground">{learnerProfile?.fullName || studentInfo.name}</h1>
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
                        <p className="text-sm text-muted-foreground">{learnerProfile?.email || studentInfo.email}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">Batch: {studentInfo.batchName}</p>
                    </div>
                </div>

                {/* Right Side - Overall Attendance Percentage */}
                <div className="flex items-center space-x-8">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{completedClasses?.length}</p>
                        <p className="text-sm text-muted-foreground">Total Classes</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{attendancePercentage?.toFixed(2)}%</p>
                        <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    </div>
                </div>
            </div>

            {/* <div className="flex w-fit gap-1 rounded-md border bg-muted p-1">
                <Button
                    variant={activeTab === 'profile' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </Button>
                <Button
                    variant={activeTab === 'attendance' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('attendance')}
                >
                    Attendance
                </Button>
            </div> */}
            <div className="flex w-[420px] gap-1 rounded-lg border bg-white p-1">
                <Button
                    className={`flex-1 rounded-md ${
                        activeTab === 'profile'
                            ? 'bg-[#28632D] text-white hover:bg-[#28632D]'
                            : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </Button>

                <Button
                    className={`flex-1 rounded-md ${
                        activeTab === 'attendance'
                            ? 'bg-[#28632D] text-white hover:bg-[#28632D]'
                            : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('attendance')}
                >
                    Attendance
                </Button>
            </div>

            {activeTab === 'profile' ? (
                <div className="grid gap-6 text-left lg:grid-cols-[252px_minmax(0,1fr)]">
                    <nav className="space-y-1" aria-label="Profile sections">
                        {[
                            'Basic Info',
                            'Skills & Projects',
                            'Education',
                            'Career goals',
                        ].map((section) => (
                            <button
                                key={section}
                                type="button"
                                onClick={() => {
                                    setActiveProfileSection(section)
                                    const sectionIds: Record<string, string> = {
                                        'Basic Info': 'basic-info',
                                        'Skills & Projects': 'skills-projects',
                                        Education: 'education',
                                        'Career goals': 'career-goals',
                                    }
                                    document.getElementById(sectionIds[section])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                                className={`w-full rounded-md px-4 py-3 text-left text-sm transition-colors ${
                                    activeProfileSection === section
                                        ? 'bg-green-50 font-semibold text-green-900 dark:bg-green-950 dark:text-green-200'
                                        : 'text-foreground hover:bg-muted'
                                }`}
                            >
                                {section}
                            </button>
                        ))}
                    </nav>

                    <div className="space-y-6">
                    {profileLoading && (
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">Loading profile...</CardContent>
                        </Card>
                    )}
                    {!profileLoading && !profileDetails && (
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">Profile details are not available.</CardContent>
                        </Card>
                    )}
                    <Card id="basic-info">
                        <CardContent className="p-6">
                            <h2 className="mb-6 text-lg font-semibold">Basic Info</h2>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full name</p>
                                    <p className="mt-1 font-medium">{profileDetails?.fullName || studentInfo.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="mt-1 font-medium">{profileDetails?.email || studentInfo.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="mt-1 font-medium">{profileDetails?.phoneNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                                    <p className="mt-1 font-medium text-green-800 dark:text-green-300">{profileDetails?.linkedinProfile || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Career status</p>
                                    <Badge className="mt-1">{profileDetails?.currentStatus || 'Not provided'}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card id="skills-projects">
                        <CardContent className="p-6">
                            <h2 className="mb-6 text-lg font-semibold">Skills & Projects</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="mb-3 text-sm text-muted-foreground">Technical skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profileDetails?.technicalSkills?.length ? profileDetails.technicalSkills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70">{skill}</Badge>
                                        )) : <p className="font-medium">Not provided</p>}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-3 text-sm text-muted-foreground">Projects</p>
                                    {profileDetails?.projects?.length ? profileDetails.projects.map((project, index) => (
                                        <div key={`${project.title || 'project'}-${index}`} className="mb-4 space-y-2 last:mb-0">
                                            <p className="font-medium">{project.title || 'Untitled project'}</p>
                                            <p className="text-sm text-muted-foreground">{project.description || 'No description provided'}</p>
                                            <p className="text-sm">{project.techStack?.join(', ') || 'No tech stack provided'}</p>
                                        </div>
                                    )) : <p className="font-medium">Not provided</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card id="education">
                        <CardContent className="p-6">
                            <h2 className="mb-6 text-lg font-semibold">Education</h2>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div><p className="text-sm text-muted-foreground">College</p><p className="mt-1 font-medium">{profileDetails?.collegeName || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Degree</p><p className="mt-1 font-medium">{profileDetails?.degree || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Branch</p><p className="mt-1 font-medium">{profileDetails?.branch || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Year of study</p><p className="mt-1 font-medium">{profileDetails?.yearOfStudy || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Graduating</p><p className="mt-1 font-medium">{graduationDate}</p></div>
                                <div><p className="text-sm text-muted-foreground">College score</p><p className="mt-1 font-medium">{profileDetails?.collegeScore ? `${profileDetails.collegeScore}${profileDetails.collegeScoreType || ''}` : 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Class 12</p><p className="mt-1 font-medium">{profileDetails?.class12Score ? `${profileDetails.class12Score}${profileDetails.class12ScoreType || ''} (${profileDetails.class12Board || 'Board not provided'})` : 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Class 10</p><p className="mt-1 font-medium">{profileDetails?.class10Score ? `${profileDetails.class10Score}${profileDetails.class10ScoreType || ''} (${profileDetails.class10Board || 'Board not provided'})` : 'Not provided'}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card id="career-goals">
                        <CardContent className="p-6">
                            <h2 className="mb-6 text-lg font-semibold">Career goals</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div><p className="text-sm text-muted-foreground">Target roles</p><p className="mt-1 font-medium">{profileDetails?.targetRoles?.join(', ') || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Preferred locations</p><p className="mt-1 font-medium">{profileDetails?.preferredLocations?.join(', ') || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Internship stipend</p><p className="mt-1 font-medium">{profileDetails?.internshipStipend || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Full-time CTC</p><p className="mt-1 font-medium">{profileDetails?.fullTimeCtc || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Preferred contact</p><p className="mt-1 font-medium">{profileDetails?.preferredContactMethods?.join(', ') || 'Not provided'}</p></div>
                                <div><p className="text-sm text-muted-foreground">Open to remote</p><p className="mt-1 font-medium">{profileDetails?.openToRemote ? 'Yes' : 'No'}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            ) : (
                <>

            {/* Filters Row - All 4 filters in one line - Left aligned */}
            <div className="flex items-center gap-4 flex-wrap justify-start">
                <div className="relative w-[300px]">
                    <SearchBox
                        placeholder="Search by class name..."
                        fetchSuggestionsApi={fetchSuggestionsApi}
                        fetchSearchResultsApi={fetchSearchResultsApi}
                        defaultFetchApi={defaultFetchApi}
                        getSuggestionLabel={(s) => (
                            <div>
                                <div className="font-medium">{s.title}</div>
                            </div>
                        )}
                        inputWidth=""
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

                {/* From Date Filter with Error */}
                <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                        <p className='text-foreground'>From:</p>
                        <Popover open={isFromCalendarOpen} onOpenChange={setFromCalendarOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative w-[150px]">
                                    <Input
                                        value={fromDate ? format(new Date(fromDate), "dd-MM-yyyy") : ""}
                                        placeholder="From Date"
                                        readOnly
                                        className={`cursor-pointer pr-10 ${dateErrors.fromDate ? "border-red-500" : ""
                                            }`}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={fromDate ? new Date(fromDate) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            handleFromDateChange(date.toISOString().split("T")[0])
                                            setFromCalendarOpen(false)
                                        }
                                    }}
                                    disabled={(date) => {
                                        // Disable dates after `toDate`
                                        if (toDate) {
                                            return date > new Date(toDate)
                                        }
                                        return false
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {dateErrors.fromDate && (
                        <p className="text-xs text-red-500 ml-14">{dateErrors.fromDate}</p>
                    )}
                </div>

                {/* To Date Filter with Error */}
                <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                        <p className='text-foreground'>To:</p>
                        <Popover open={isToCalendarOpen} onOpenChange={setToCalendarOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative w-[150px]">
                                    <Input
                                        value={toDate ? format(new Date(toDate), "dd-MM-yyyy") : ""}
                                        placeholder="To Date"
                                        readOnly
                                        className={`cursor-pointer pr-10 ${dateErrors.toDate ? "border-red-500" : ""
                                            }`}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={toDate ? new Date(toDate) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            handleToDateChange(date.toISOString().split("T")[0])
                                            setToCalendarOpen(false)
                                        }
                                    }}
                                    disabled={(date) => {
                                        // Disable dates after `toDate`
                                        if (toDate) {
                                            return date > new Date(toDate)
                                        }
                                        return false
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {dateErrors.toDate && (
                        <p className="text-xs text-red-500 ml-8">{dateErrors.toDate}</p>
                    )}
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
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
                            <p className="text-destructive">Student is not assigned to any batch yet</p>
                            <Button onClick={() => fetchCompletedClasses(searchTerm)} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data Table */}
            {!loading && !error && (
                <div className="space-y-4">
                    {completedClasses.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No records found.</p>
                            </CardContent>
                        </Card>
                    )}
                    {completedClasses.length > 0 && (
                        <DataTable
                            columns={attendanceColumns}
                            data={completedClasses}
                        />
                    )}
                </div>
            )}
                </>
            )}
        </div>
    )
}

export default StudentDetailsView