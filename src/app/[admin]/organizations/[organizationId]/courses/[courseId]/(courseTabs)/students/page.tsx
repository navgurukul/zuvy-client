'use client'
import React, { useState, useEffect, useCallback, useRef , useMemo} from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Plus,
    FileSpreadsheet,
    ListFilter,
    UserPlus,
    Search,
    Download,
} from 'lucide-react'
import { getUser, getBatchData } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '../../../../../../../_components/datatable/data-table'
import { ROWS_PER_PAGE } from '@/utils/constant'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { columns, getFilteredColumns } from './columns'
import { useStudentData } from './components/useStudentData'
import { ComboboxStudent } from './components/comboboxStudentDataTable'
import { useGetCourseStudents } from '@/app/[admin]/hooks/useGetCourseStudents'
import AlertDialogDemo from './components/deleteModalNew'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { SearchBox } from '@/utils/searchBox'
import useDebounce from '@/app/[admin]/hooks/useDebounce'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {StudentPageSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import { Student } from './studentComponentTypes'

export type StudentData = {
    email: string
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
    enrolledDate?: string | null
}

type StudentDataState = Student[]
type StudentDropdownOptions = {
    careerStatus?: string[]
    skills?: string[]
    openToRemote?: boolean[]
    education?: string[]
}

type FilterDraft = {
    status: string
    batch: string
    enrolledDate: string
    careerStatus: string
    skills: string
    education: string
    openToRemote: string
    attendance: string
}

type FilterPopoverProps = {
    statusFilter: string
    batchFilter: string
    enrolledDateFilter: string
    careerStatusFilter: string
    skillsFilter: string
    educationFilter: string
    openToRemoteFilter: string
    attendanceInput: string
    batchOptions: { id: number; name: string }[]
    dropdownOptions: StudentDropdownOptions
    onApply: (filters: FilterDraft) => void
}

const FilterPopover = ({
    statusFilter,
    batchFilter,
    enrolledDateFilter,
    careerStatusFilter,
    skillsFilter,
    educationFilter,
    openToRemoteFilter,
    attendanceInput,
    batchOptions,
    dropdownOptions,
    onApply,
}: FilterPopoverProps) => {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState<FilterDraft>({
        status: statusFilter,
        batch: batchFilter,
        enrolledDate: enrolledDateFilter,
        careerStatus: careerStatusFilter,
        skills: skillsFilter,
        education: educationFilter,
        openToRemote: openToRemoteFilter,
        attendance: attendanceInput,
    })
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        setDraft({
            status: statusFilter,
            batch: batchFilter,
            enrolledDate: enrolledDateFilter,
            careerStatus: careerStatusFilter,
            skills: skillsFilter,
            education: educationFilter,
            openToRemote: openToRemoteFilter,
            attendance: attendanceInput,
        })
    }, [open, statusFilter, batchFilter, enrolledDateFilter, careerStatusFilter, skillsFilter, educationFilter, openToRemoteFilter, attendanceInput])

    useEffect(() => {
        if (!open) return
        const handleOutsideClick = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [open])

    const activeFilterCount = [statusFilter, batchFilter, enrolledDateFilter, careerStatusFilter, skillsFilter, educationFilter, openToRemoteFilter]
        .filter((value) => value !== 'all').length + (attendanceInput ? 1 : 0)
    const updateDraft = (key: keyof FilterDraft, value: string) => {
        const nextDraft = { ...draft, [key]: value }
        setDraft(nextDraft)
        onApply(nextDraft)
    }

    const optionButton = (key: keyof FilterDraft, value: string, label: string) => {
        const selected = draft[key] === value
        return (
            <button
                key={`${key}-${value}`}
                type="button"
                onClick={() => updateDraft(key, selected ? (key === 'attendance' ? '' : 'all') : value)}
                className={`flex w-full items-start gap-2 break-words px-2 py-1.5 text-left text-sm whitespace-normal hover:bg-muted ${selected ? 'text-primary font-medium' : 'text-foreground'}`}
            >
                <span className={`h-3.5 w-3.5 shrink-0 rounded border ${selected ? 'border-primary bg-primary' : 'border-input'}`}>
                    {selected && <span className="block text-center text-[10px] leading-3 text-primary-foreground">✓</span>}
                </span>
                <span>{label}</span>
            </button>
        )
    }

    const resetDraft = () => setDraft({
        status: 'all',
        batch: 'all',
        enrolledDate: 'all',
        careerStatus: 'all',
        skills: 'all',
        education: 'all',
        openToRemote: 'all',
        attendance: '',
    })

    return (
        <div ref={popoverRef} className="relative">
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                className="gap-2"
            >
                <ListFilter className="h-4 w-4" />
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 flex max-h-[min(70vh,620px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg">
                    <div className="min-h-0 flex-1 overflow-y-auto p-2">
                        <details open className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Status</summary>
                            {optionButton('status', 'active', 'Active')}
                            {optionButton('status', 'dropout', 'Inactive')}
                            {optionButton('status', 'graduate', 'Graduate')}
                        </details>
                        <details className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Batches</summary>
                            {optionButton('batch', 'all', 'All batches')}
                            {batchOptions.map((batch) => optionButton('batch', String(batch.id), batch.name))}
                        </details>
                        <details className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Enrolled Date</summary>
                            {optionButton('enrolledDate', 'all', 'All enrolled dates')}
                            {optionButton('enrolledDate', 'today', 'Today')}
                            {optionButton('enrolledDate', 'yesterday', 'Yesterday')}
                            {optionButton('enrolledDate', 'thisWeek', 'This week')}
                            {optionButton('enrolledDate', 'thisMonth', 'This month')}
                            {optionButton('enrolledDate', 'last3months', 'Last 3 months')}
                            {optionButton('enrolledDate', 'last6months', 'Last 6 months')}
                            {optionButton('enrolledDate', 'lastyear', 'Last year')}
                            {optionButton('enrolledDate', 'older', 'Older')}
                        </details>
                        <details className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Career Status</summary>
                            {optionButton('careerStatus', 'all', 'All career statuses')}
                            {(dropdownOptions.careerStatus || []).map((option) => optionButton('careerStatus', option, option))}
                        </details>
                        <details className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Skills</summary>
                            {optionButton('skills', 'all', 'All skills')}
                            {(dropdownOptions.skills || []).map((option) => optionButton('skills', option, option))}
                        </details>
                        <details className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Graduating Year</summary>
                            {optionButton('education', 'all', 'All graduating years')}
                            {(dropdownOptions.education || []).map((option) => optionButton('education', option, option))}
                        </details>
                        <details className="border-b py-1">
                            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-medium">Remote Preference</summary>
                            {optionButton('openToRemote', 'all', 'All preferences')}
                            {optionButton('openToRemote', 'true', 'Remote Only')}
                            {optionButton('openToRemote', 'false', 'In-Office')}
                        </details>
                    </div>
                </div>
            )}
        </div>
    )
}

const StudentsPage = ({ params }: { params: any }) => {
    const searchParams = useSearchParams()
    const router = useRouter()

    const {
        students,
        totalPages,
        currentPage,
        limit,
        offset,
        search,
        totalStudents,
        setStudents,
        setTotalStudents,
        setTotalPages,
        setOffset,
        setCurrentPage,
        fetchStudentData,
    } = useStudentData(params.courseId)
    const { getCourseStudents } = useGetCourseStudents()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId;
    const { batchData } = getBatchData()
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const [isOpen, setIsOpen] = useState(false)
    const [isSingleStudentOpen, setIsSingleStudentOpen] = useState(false)
    const [lastActiveFilter, setLastActiveFilter] = useState<string>('all')
    const [enrolledDateFilter, setEnrolledDateFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [batchFilter, setBatchFilter] = useState<string>('all')
    const [careerStatusFilter, setCareerStatusFilter] = useState('all')
    const [skillsFilter, setSkillsFilter] = useState('all')
    const [educationFilter, setEducationFilter] = useState('all')
    const [openToRemoteFilter, setOpenToRemoteFilter] = useState('all')
    const [dropdownOptions, setDropdownOptions] = useState<StudentDropdownOptions>({})
    const [attendanceInput, setAttendanceInput] = useState('')
    const [loading, setLoading] = useState(true)
    // Use debounce hook for attendance input
    const debouncedAttendance = useDebounce(attendanceInput, 500)
    const debouncedCareerStatus = useDebounce(careerStatusFilter === 'all' ? '' : careerStatusFilter, 500)
    const debouncedSkills = useDebounce(skillsFilter === 'all' ? '' : skillsFilter, 500)
    const debouncedEducation = useDebounce(educationFilter === 'all' ? '' : educationFilter, 500)

    
    // Add refs to track initialization and prevent duplicate calls
    const hasInitialized = useRef(false)
    const isFetching = useRef(false)
    
    // Update filterState to use debouncedAttendance instead of attendanceFilter
    const filterState = useMemo(() => ({
        enrolledDateFilter,
        statusFilter,
        batchFilter,
        attendanceFilter: debouncedAttendance,
        careerStatus: debouncedCareerStatus,
        skills: debouncedSkills,
        education: debouncedEducation,
        openToRemote: openToRemoteFilter,
    }), [enrolledDateFilter, statusFilter, batchFilter, debouncedAttendance, debouncedCareerStatus, debouncedSkills, debouncedEducation, openToRemoteFilter])
    
    const fetchFilteredData = useCallback(async (customOffset?: number) => {
        if (isFetching.current) return
    
        try {
            isFetching.current = true
            const currentOffset = customOffset !== undefined ? customOffset : offset
    
            let queryStr = `?limit=${limit}&offset=${currentOffset}`
    
            if (enrolledDateFilter !== 'all') {
                const enrolledDate = convertEnrolledDateFilterToDate(enrolledDateFilter)
                if (enrolledDate) queryStr += `&enrolledDate=${enrolledDate}`
            }
            if (statusFilter !== 'all') queryStr += `&status=${statusFilter}`
            if (batchFilter !== 'all') queryStr += `&batch_id=${batchFilter}`
            
            // Use debouncedAttendance here
            if (debouncedAttendance.trim() !== '') {
                queryStr += `&attendance=${debouncedAttendance.trim()}`
            }
            if (debouncedCareerStatus) queryStr += `&careerStatus=${encodeURIComponent(debouncedCareerStatus)}`
            if (debouncedSkills) queryStr += `&skills=${encodeURIComponent(debouncedSkills)}`
            if (debouncedEducation) queryStr += `&education=${encodeURIComponent(debouncedEducation)}`
            if (openToRemoteFilter !== 'all') queryStr += `&openToRemote=${openToRemoteFilter}`
    
            const searchQuery = new URLSearchParams(window.location.search).get("search")
            if (searchQuery) queryStr += `&searchTerm=${searchQuery}`
    
            const response = await getCourseStudents(params.courseId, queryStr)
    
            if (response.data.dropdownOptions) setDropdownOptions(response.data.dropdownOptions)
            setStudents(response.data.modifiedStudentInfo || [])
            setTotalStudents(response.data.totalStudents || 0)
            setTotalPages(response.data.totalPages || 1)
            setSelectedRows([])
    
            setLoading(false)
    
        } catch (error) {
            console.error('Error fetching filtered data:', error)
            toast.error({ title: 'Error', description: 'Failed to fetch student data' })
        } finally {
            setTimeout(() => {
                isFetching.current = false
            }, 100) }
    }, [params.courseId,limit,offset,enrolledDateFilter,statusFilter,batchFilter,debouncedAttendance,debouncedCareerStatus,debouncedSkills,debouncedEducation,openToRemoteFilter,setStudents,setTotalStudents,setTotalPages,getCourseStudents])
     // Update this helper function to handle new options
    // const convertLastActiveFilterToDate = (filter: string): string | null => {
    // const today = new Date()
    // const formatDate = (date: Date) => date.toISOString().split('T')[0] // YYYY-MM-DD format
    
    // switch (filter) {
    // case 'today':
    // return formatDate(today)
    
    // case 'yesterday':
    // const yesterday = new Date(today)
    // yesterday.setDate(today.getDate() - 1)
    // return formatDate(yesterday)
    
    // case 'thisWeek':
    // const startOfWeek = new Date(today)
    // startOfWeek.setDate(today.getDate() - today.getDay()) // Start of current week (Sunday)
    // return formatDate(startOfWeek)
    
    // case 'thisMonth':
    // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    // return formatDate(startOfMonth)
    
    // case 'last3months':
    // const last3Months = new Date(today)
    // last3Months.setMonth(today.getMonth() - 3)
    // return formatDate(last3Months)
    
    // case 'last6months':
    // const last6Months = new Date(today)
    // last6Months.setMonth(today.getMonth() - 6)
    // return formatDate(last6Months)
    
    // case 'lastyear':
    // const lastYear = new Date(today)
    // lastYear.setFullYear(today.getFullYear() - 1)
    // return formatDate(lastYear)
    
    // case 'older':
    // const twoYearsAgo = new Date(today)
    // twoYearsAgo.setFullYear(today.getFullYear() - 2)
    // return formatDate(twoYearsAgo)
    
    // default:
    // return null
    // }
    // }

    // Add this helper function alongside convertLastActiveFilterToDate

    const convertEnrolledDateFilterToDate = (filter: string): string | null => {
        const today = new Date()
        const formatDate = (date: Date) => date.toISOString().split('T')[0]
        
        switch (filter) {
            case 'today': return formatDate(today)
            case 'yesterday': const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); return formatDate(yesterday)
            case 'thisWeek': const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay()); return formatDate(startOfWeek)
            case 'thisMonth': const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); return formatDate(startOfMonth)
            case 'last3months': const last3Months = new Date(today); last3Months.setMonth(today.getMonth() - 3); return formatDate(last3Months)
            case 'last6months': const last6Months = new Date(today); last6Months.setMonth(today.getMonth() - 6); return formatDate(last6Months)
            case 'lastyear': const lastYear = new Date(today); lastYear.setFullYear(today.getFullYear() - 1); return formatDate(lastYear)
            case 'older': const twoYearsAgo = new Date(today); twoYearsAgo.setFullYear(today.getFullYear() - 2); return formatDate(twoYearsAgo)
            default: return null
        }
    }

    // Initial load - only runs once
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true
            fetchFilteredData()
        }
    }, [])

    // Apply filters when they change - but only after initialization
    useEffect(() => {
        if (hasInitialized.current && !isFetching.current) {
            fetchFilteredData()
        }
    }, [filterState])
    
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        // If query is empty, return empty suggestions and trigger default fetch
        if (!query || query.trim() === '') {
            return [];
        }
        
        let queryStr = `?searchTerm=${query}`
        
        if (enrolledDateFilter && enrolledDateFilter !== 'all') {
            const enrolledDate = convertEnrolledDateFilterToDate(enrolledDateFilter)
            if (enrolledDate) queryStr += `&enrolledDate=${enrolledDate}`
        }
        if (statusFilter && statusFilter !== 'all') queryStr += `&status=${statusFilter}`
        if (batchFilter && batchFilter !== 'all') queryStr += `&batch_id=${batchFilter}`
        // if (lastActiveFilter && lastActiveFilter !== 'all') {
        // const lastActiveDate = convertLastActiveFilterToDate(lastActiveFilter)
        // if (lastActiveDate) {
        // url += `&lastActiveDate=${lastActiveDate}`
        // }
        // }
        if (debouncedAttendance && debouncedAttendance.trim() !== '') {
            queryStr += `&attendance=${debouncedAttendance.trim()}`
        }
        if (debouncedCareerStatus) queryStr += `&careerStatus=${encodeURIComponent(debouncedCareerStatus)}`
        if (debouncedSkills) queryStr += `&skills=${encodeURIComponent(debouncedSkills)}`
        if (debouncedEducation) queryStr += `&education=${encodeURIComponent(debouncedEducation)}`
        if (openToRemoteFilter !== 'all') queryStr += `&openToRemote=${openToRemoteFilter}`
        
        const response = await getCourseStudents(params.courseId, queryStr)
        const suggestions = (response.data.modifiedStudentInfo || []).map((student: StudentData) => ({ ...student, id: student.userId }));
        return suggestions;
    }, [params.courseId, enrolledDateFilter, statusFilter, batchFilter, debouncedAttendance, debouncedCareerStatus, debouncedSkills, debouncedEducation, openToRemoteFilter, getCourseStudents]);

    // Keep fetchSearchResultsApi with current offset for proper search functionality
    const fetchSearchResultsApi = useCallback(async (query: string) => {
        // If query is empty → reset search
        if (!query || query.trim() === '') {
            const urlParams = new URLSearchParams(window.location.search)
            urlParams.delete('search')
            urlParams.delete('page')
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`
            window.history.replaceState({}, '', newUrl)
    
            await fetchFilteredData(0)
            return { modifiedStudentInfo: students }
        }
    
        let queryStr = `?limit=${limit}&offset=${offset}&searchTerm=${query}`
    
        if (enrolledDateFilter !== 'all') {
            const enrolledDate = convertEnrolledDateFilterToDate(enrolledDateFilter)
            if (enrolledDate) queryStr += `&enrolledDate=${enrolledDate}`
        }
        if (statusFilter !== 'all') queryStr += `&status=${statusFilter}`
        if (batchFilter !== 'all') queryStr += `&batch_id=${batchFilter}`
        if (debouncedAttendance.trim() !== '') {
            queryStr += `&attendance=${debouncedAttendance.trim()}`
        }
        if (debouncedCareerStatus) queryStr += `&careerStatus=${encodeURIComponent(debouncedCareerStatus)}`
        if (debouncedSkills) queryStr += `&skills=${encodeURIComponent(debouncedSkills)}`
        if (debouncedEducation) queryStr += `&education=${encodeURIComponent(debouncedEducation)}`
        if (openToRemoteFilter !== 'all') queryStr += `&openToRemote=${openToRemoteFilter}`
    
        const response = await getCourseStudents(params.courseId, queryStr)
        if (response.data.dropdownOptions) setDropdownOptions(response.data.dropdownOptions)
    
        setStudents(response.data.modifiedStudentInfo || [])
        setTotalStudents(response.data.totalStudents || 0)
        setTotalPages(response.data.totalPages || 1)
        setCurrentPage(response.data.currentPage || 1)
        setOffset(response.data.offset || 0)
        setSelectedRows([])
    
        return response.data
    
    }, [params.courseId, limit, offset, setStudents, setTotalStudents, setTotalPages, setCurrentPage, setOffset, enrolledDateFilter, statusFilter,batchFilter, debouncedAttendance, debouncedCareerStatus, debouncedSkills, debouncedEducation, openToRemoteFilter,fetchFilteredData,students,getCourseStudents])
    
    const defaultFetchApi = useCallback(async () => {
        // Clear search from URL when input is cleared
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('search')
        urlParams.delete('page')
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState({}, '', newUrl)
        
        // Fetch all data with current filters
        await fetchFilteredData(0)
        return { modifiedStudentInfo: students }
    }, [fetchFilteredData, students]);

    // Reset selectedRows when course changes
    useEffect(() => { setSelectedRows([]) }, [params.courseId])

    const newBatchData = batchData?.map((data) => ({ value: data.id, label: data.name }))

    const fetchStudentDataForBatch = useCallback(async (offsetValue: number) => {
        try {
            const res = await getCourseStudents(params.courseId, `?limit=${limit}&offset=${offset}`)
            setSelectedRows([])
            setStudents(res.data.modifiedStudentInfo)
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data.message === 'Bootcamp not found!') {
                    router.push(`/${userRole}/organizations/${orgId}/courses`)
                    toast.info({ title: 'Caution', description: 'The Course has been deleted by another Admin' })
                }
            }
            console.error(error)
        }
    }, [params.courseId, limit, offset, setStudents, router, userRole, orgId, getCourseStudents])

    const userIds = selectedRows.map((item: any) => item.userId)

    // Handle enrolled date filter change
    const handleEnrolledDateFilterChange = (value: string) => {
        setEnrolledDateFilter(value)
        setOffset(0)
        setCurrentPage(1)
        // Reset to first page when filter changes
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('page')
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState({}, '', newUrl)
    }

    // Handle status filter change
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setOffset(0)
        setCurrentPage(1)
        // Reset to first page when filter changes
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('page')
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState({}, '', newUrl)
    }

    // add handler for batch filter change
    const handleBatchFilterChange = (value: string) => {
        setBatchFilter(value)
        setOffset(0)
        setCurrentPage(1)
        const urlParams = new URLSearchParams(window.location.search)
        // persist selected batch in URL under batch_id so share/bookmark works
        if (value && value !== 'all') urlParams.set('batch_id', value)
        else urlParams.delete('batch_id')
        urlParams.delete('page')
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState({}, '', newUrl)
    }

    const handleProfileFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value)
        setOffset(0)
        setCurrentPage(1)
        setSelectedRows([])

        // The current offset is read from the URL page parameter in useStudentData.
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('page')
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
    }

    // Handle last active filter change
    // const handleLastActiveFilterChange = (value: string) => {
    // setLastActiveFilter(value)
    // // Reset to first page when filter changes
    // const urlParams = new URLSearchParams(window.location.search)
    // urlParams.delete('page')
    // const newUrl = `${window.location.pathname}?${urlParams.toString()}`
    // window.history.replaceState({}, '', newUrl)
    // }

    const handleAttendanceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d+$/.test(value)) {
            setAttendanceInput(value)
            const urlParams = new URLSearchParams(window.location.search)
            urlParams.delete('page')
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`
            window.history.replaceState({}, '', newUrl)
        }
    }

    const handleApplyFilters = (filters: FilterDraft) => {
        setStatusFilter(filters.status)
        setBatchFilter(filters.batch)
        setEnrolledDateFilter(filters.enrolledDate)
        setCareerStatusFilter(filters.careerStatus)
        setSkillsFilter(filters.skills)
        setEducationFilter(filters.education)
        setOpenToRemoteFilter(filters.openToRemote)
        setAttendanceInput(filters.attendance)
        setOffset(0)
        setCurrentPage(1)
        setSelectedRows([])

        const urlParams = new URLSearchParams(window.location.search)
        if (filters.batch !== 'all') urlParams.set('batch_id', filters.batch)
        else urlParams.delete('batch_id')
        urlParams.delete('page')
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
    }

    useEffect(() => {
        const handleRefresh = () => { 
            if (!isFetching.current) {
                fetchFilteredData() 
            }
        }
        window.addEventListener('refreshStudentData', handleRefresh)
        return () => { window.removeEventListener('refreshStudentData', handleRefresh) }
    }, [fetchFilteredData])

    if (loading) {
        return <StudentPageSkeleton />
    }

    // Get bootcamp ID from the first student (all students in this view belong to the same bootcamp)
    // Career Tour Course Bootcamp IDs: [136, 135, 134, 133, 132, 131, 130, 129]
    // Hide attendance column for these specific bootcamp IDs
    const bootcampId = students.length > 0 ? students[0].bootcampId : undefined
    const filteredColumns = getFilteredColumns(bootcampId)

    const downloadReportAsCSV = () => {
        if (!students || students.length === 0) {
            toast.info({ title: 'No Data', description: 'No student data available to download.' })
            return
        }

        const CAREER_TOUR_BOOTCAMP_IDS = [136, 135, 134, 133, 132, 131, 130, 129]
        const isCareerTour = bootcampId !== undefined && CAREER_TOUR_BOOTCAMP_IDS.includes(bootcampId)

        const headers = [
            'Name',
            'Email',
            'Batch',
            'Career Status',
            'Graduating',
            'Top Skills',
            'Enrolled Date',
            'Progress (%)',
            ...(!isCareerTour ? ['Attendance', 'Status'] : []),
        ]

        const rows = students.map((student: any) => {
            const graduating =
                student.graduationDate ||
                (student.graduationMonth && student.graduationYear
                    ? `${student.graduationMonth} ${student.graduationYear}`
                    : '')
            const skills = Array.isArray(student.skills)
                ? student.skills.join('; ')
                : student.skills || ''

            const row = [
                student.name || '',
                student.email || '',
                student.batchName || '',
                student.careerStatus || '',
                graduating,
                skills,
                student.enrolledDate || '',
                student.progress ?? '',
                ...(!isCareerTour
                    ? [student.attendance ?? '', student.status || '']
                    : []),
            ]
            // Wrap fields in quotes to handle commas inside values
            return row.map((field) => `"${String(field).replace(/"/g, '""')}"`)
        })

        const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `students_report_${params.courseId}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
    
    return (
        <div className="text-foreground">
            <div className="text-start mt-6">
                <h2 className="font-heading text-xl font-semibold">Students</h2>
                <p className="text-muted-foreground">
                    Manage student enrollments and track their progress
                </p>
            </div>
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
                    <div className="relative w-full md:w-1/2 lg:w-1/4 [&_input]:pl-10 mt-4">
                        <SearchBox
                            placeholder="Search students..."
                            fetchSuggestionsApi={fetchSuggestionsApi}
                            fetchSearchResultsApi={fetchSearchResultsApi}
                            defaultFetchApi={defaultFetchApi}
                            getSuggestionLabel={(student) => (
                                <div>
                                    <div className="font-medium">
                                        {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {student.email}
                                    </div>
                                </div>
                            )}
                            inputWidth="w-full"
                        />
                    </div>

                    {/* Action Buttons Row (on mobile both in one row) */}
                    <div className="flex w-full flex-row mt-2 md:flex-row items-center gap-x-4 gap-y-2 md:w-auto">
                        {/* Download Report Button */}
                        <Button
                            variant="outline"
                            onClick={downloadReportAsCSV}
                            className=""
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                        </Button>

                        {/* Add Single Student Button */}
                        <Dialog
                            open={isSingleStudentOpen}
                            onOpenChange={(open) => {
                                setIsSingleStudentOpen(open)
                                if (!open) {
                                    setStudentData({ name: '', email: '' })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Single Student
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                                batch={false}
                                batchId={0}
                                setStudentData={setStudentData}
                                studentData={studentData}
                                modalType="single"
                            />
                        </Dialog>

                        {/* Bulk Upload Button */}
                        <Dialog
                            open={isOpen}
                            onOpenChange={(open) => {
                                setIsOpen(open)
                                if (!open) {
                                    setStudentData({ name: '', email: '' })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="flex-1 bg-primary hover:bg-primary-dark shadow-4dp">
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Bulk Upload
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                                batch={false}
                                batchId={0}
                                setStudentData={setStudentData}
                                studentData={studentData}
                                modalType="bulk"
                            />
                        </Dialog>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                    <FilterPopover
                        statusFilter={statusFilter}
                        batchFilter={batchFilter}
                        enrolledDateFilter={enrolledDateFilter}
                        careerStatusFilter={careerStatusFilter}
                        skillsFilter={skillsFilter}
                        educationFilter={educationFilter}
                        openToRemoteFilter={openToRemoteFilter}
                        attendanceInput={attendanceInput}
                        batchOptions={(batchData || []).map((batch) => ({ id: batch.id, name: batch.name }))}
                        dropdownOptions={dropdownOptions}
                        onApply={handleApplyFilters}
                    />
                    <div className="w-full sm:w-[160px]">
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Attendance number"
                            value={attendanceInput}
                            onChange={handleAttendanceFilterChange}
                            className="text-sm w-full"
                        />
                    </div>
                </div>

                {selectedRows.length > 0 && (
                    <div className='flex flex-row mt-3'>
                        <AlertDialogDemo
                            setSelectedRows={setSelectedRows}
                            userId={userIds}
                            bootcampId={batchData && params.courseId}
                            title="Are you absolutely sure?"
                            description={`This action cannot be undone. This will permanently remove the ${selectedRows.length > 1 ? 'students' : 'student'} from the bootcamp`}
                        />
                        <ComboboxStudent
                            batchData={newBatchData || []}
                            bootcampId={batchData && params.courseId}
                            selectedRows={selectedRows}
                            fetchStudentData={fetchStudentDataForBatch}
                        />
                    </div>
                )}

                <div>
                    <div className="mt-5">
                        <DataTable
                            data={students}
                            columns={filteredColumns}
                            setSelectedRows={setSelectedRows}
                        />
                    </div>

                    {/* Use the imported DataTablePagination component */}
                    <DataTablePagination
                        totalStudents={totalStudents}
                        lastPage={totalPages}
                        pages={totalPages}
                        fetchStudentData={fetchFilteredData} // Use filtered fetch function
                    />
                </div>
            </div>
        </div>
    )
}
export default StudentsPage
