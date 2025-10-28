'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Plus,
    FileSpreadsheet,
    UserPlus,
} from 'lucide-react'
import { getUser } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '../../../../../_components/datatable/data-table'
import { ROWS_PER_PAGE } from '@/utils/constant'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { columns } from './columns'
import { getBatchData } from '@/store/store'
import { useStudentData } from './components/useStudentData'
import { ComboboxStudent } from './components/comboboxStudentDataTable'
import { api } from '@/utils/axios.config'
import AlertDialogDemo from './components/deleteModalNew'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { SearchBox } from '@/utils/searchBox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {StudentPageSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'

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

interface Student {
    email: string
    name: string
}

type StudentDataState = Student[]

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
        fetchStudentData,
    } = useStudentData(params.courseId)
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
  const { batchData } = getBatchData()
  const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
  const [studentData, setStudentData] = useState<StudentDataState | any>({})
  const [isOpen, setIsOpen] = useState(false)
  const [isSingleStudentOpen, setIsSingleStudentOpen] = useState(false)
  const [lastActiveFilter, setLastActiveFilter] = useState<string>('all')
  const [enrolledDateFilter, setEnrolledDateFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [batchFilter, setBatchFilter] = useState<string>('all')
  const [attendanceFilter, setAttendanceFilter] = useState<string>('') // Add this
    const [loading, setLoading] = useState(true)


  // Fetch data with filters
  const fetchFilteredData = useCallback(async () => {
    try {
      let url = `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
      
      // Add enrolled date filter if not 'all'
      if (enrolledDateFilter && enrolledDateFilter !== 'all') {
        const enrolledDate = convertEnrolledDateFilterToDate(enrolledDateFilter)
        if (enrolledDate) url += `&enrolledDate=${enrolledDate}`
      }
      
      // Add status filter if not 'all'
      if (statusFilter && statusFilter !== 'all') url += `&status=${statusFilter}`

      // Add batch filter if not 'all'
      if (batchFilter && batchFilter !== 'all') url += `&batch_id=${batchFilter}`

      // Add last active filter if not 'all'
      // if (lastActiveFilter && lastActiveFilter !== 'all') {
      // const lastActiveDate = convertLastActiveFilterToDate(lastActiveFilter)
      // if (lastActiveDate) {
      // url += `&lastActiveDate=${lastActiveDate}`
      // }
      // }
      
      // Add attendance filter if not empty
      if (attendanceFilter && attendanceFilter.trim() !== '') url += `&attendance=${attendanceFilter.trim()}`
      
      // Add search if exists
      const urlSearchParams = new URLSearchParams(window.location.search)
      const searchQuery = urlSearchParams.get("search")
      if (searchQuery) url += `&searchTerm=${searchQuery}`
      
      const response = await api.get(url)
      setStudents(response.data.modifiedStudentInfo || [])
      setSelectedRows([])
      
    } catch (error) {
      console.error('Error fetching filtered data:', error)
      toast.error({ title: 'Error', description: 'Failed to fetch student data' })
    }
  }, [params.courseId, limit, offset, enrolledDateFilter, statusFilter, batchFilter, lastActiveFilter, attendanceFilter, setStudents])

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
    const formatDate = (date: Date) => date.toISOString().split('T')[0] // YYYY-MM-DD format
    
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

  // Apply filters when they change
  useEffect(() => { fetchFilteredData() }, [enrolledDateFilter, statusFilter, batchFilter, lastActiveFilter, attendanceFilter, fetchFilteredData])

  // Update fetchSuggestionsApi to include attendance filter
  const fetchSuggestionsApi = useCallback(async (query: string) => {
    let url = `/bootcamp/students/${params.courseId}?searchTerm=${query}`
    
    // Add current filters to suggestions
    if (enrolledDateFilter && enrolledDateFilter !== 'all') {
      const enrolledDate = convertEnrolledDateFilterToDate(enrolledDateFilter)
      if (enrolledDate) url += `&enrolledDate=${enrolledDate}`
    }
    if (statusFilter && statusFilter !== 'all') url += `&status=${statusFilter}`
    if (batchFilter && batchFilter !== 'all') url += `&batch_id=${batchFilter}`
    // if (lastActiveFilter && lastActiveFilter !== 'all') {
    // const lastActiveDate = convertLastActiveFilterToDate(lastActiveFilter)
    // if (lastActiveDate) {
    // url += `&lastActiveDate=${lastActiveDate}`
    // }
    // }
    if (attendanceFilter && attendanceFilter.trim() !== '') url += `&attendance=${attendanceFilter.trim()}`
    
    const response = await api.get(url)
    const suggestions = (response.data.modifiedStudentInfo || []).map((student: StudentData) => ({ ...student, id: student.userId }));
    return suggestions;
  }, [params.courseId, enrolledDateFilter, statusFilter, batchFilter, lastActiveFilter, attendanceFilter]);

  // Keep fetchSearchResultsApi with current offset for proper search functionality
  const fetchSearchResultsApi = useCallback(async (query: string) => {
    let url = `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}&searchTerm=${query}`
    
    // Add current filters to search
    if (enrolledDateFilter && enrolledDateFilter !== 'all') {
      const enrolledDate = convertEnrolledDateFilterToDate(enrolledDateFilter)
      if (enrolledDate) url += `&enrolledDate=${enrolledDate}`
    }
    if (statusFilter && statusFilter !== 'all') url += `&status=${statusFilter}`
    if (batchFilter && batchFilter !== 'all') url += `&batch_id=${batchFilter}`
    // if (lastActiveFilter && lastActiveFilter !== 'all') {
    // const lastActiveDate = convertLastActiveFilterToDate(lastActiveFilter)
    // if (lastActiveDate) {
    // url += `&lastActiveDate=${lastActiveDate}`
    // }
    // }
    if (attendanceFilter && attendanceFilter.trim() !== '') url += `&attendance=${attendanceFilter.trim()}`
    
    const response = await api.get(url)
    setStudents(response.data.modifiedStudentInfo || [])
    setSelectedRows([])
    return response.data
  }, [params.courseId, limit, offset, setStudents, enrolledDateFilter, statusFilter, batchFilter, lastActiveFilter, attendanceFilter]);
  
  const defaultFetchApi = useCallback(async () => {
    await fetchFilteredData()
    return { modifiedStudentInfo: students }
  }, [fetchFilteredData, students]);

  // Reset selectedRows when course changes
  useEffect(() => { setSelectedRows([]) }, [params.courseId])

  const newBatchData = batchData?.map((data) => ({ value: data.id, label: data.name }))

  const fetchStudentDataForBatch = useCallback(async (offsetValue: number) => {
    try {
      const res = await api.get(`/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`)
      setSelectedRows([])
      setStudents(res.data.modifiedStudentInfo)
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.data.message === 'Bootcamp not found!') {
          router.push(`/${userRole}/courses`)
          toast.info({ title: 'Caution', description: 'The Course has been deleted by another Admin' })
        }
      }
      console.error(error)
    }
  }, [params.courseId, limit, setStudents])

  const userIds = selectedRows.map((item: any) => item.userId)

  // Handle enrolled date filter change
  const handleEnrolledDateFilterChange = (value: string) => {
    setEnrolledDateFilter(value)
    // Reset to first page when filter changes
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.delete('page')
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`
    window.history.replaceState({}, '', newUrl)
  }

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    // Reset to first page when filter changes
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.delete('page')
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`
    window.history.replaceState({}, '', newUrl)
  }

  // add handler for batch filter change
  const handleBatchFilterChange = (value: string) => {
    setBatchFilter(value)
    const urlParams = new URLSearchParams(window.location.search)
    // persist selected batch in URL under batch_id so share/bookmark works
    if (value && value !== 'all') urlParams.set('batch_id', value)
    else urlParams.delete('batch_id')
    urlParams.delete('page')
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`
    window.history.replaceState({}, '', newUrl)
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

  // Add handler for attendance filter change
  const handleAttendanceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setAttendanceFilter(value)
      // Reset to first page when filter changes
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.delete('page')
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }

  // Add this useEffect to listen for refresh events
  useEffect(() => {
    const handleRefresh = () => { fetchFilteredData() }
    window.addEventListener('refreshStudentData', handleRefresh)
    return () => { window.removeEventListener('refreshStudentData', handleRefresh) }
  }, [fetchFilteredData])


  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])
  if (loading) {
    return <StudentPageSkeleton />
  }
    // Normal table view (no conditional rendering needed)
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
                    <div className="relative w-full md:w-1/2 lg:w-1/4">
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
                                <Button className="flex-1 text-gray-800 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
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

                <div className='flex flex-row justify-end mt-6'>
                    {selectedRows.length > 0 && (
                        <>
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
                        </>
                    )}
                </div>

        {/* Filters Row (on mobile both in one row) */}
        <div className="flex flex-col md:flex-row items-center gap-y-4 md:gap-x-4 md:gap-y-0 mt-10">
          {/* Status Filter */}
          <div className="w-full sm:w-[160px] mt-2">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="text-sm w-full"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="dropout">Dropout</SelectItem><SelectItem value="graduate">Graduate</SelectItem></SelectContent>
            </Select>
          </div>

          {/* Batch Filter (placed after Status) */}
          <div className="w-full sm:w-[160px] mt-2">
            <Select value={batchFilter} onValueChange={handleBatchFilterChange}>
              <SelectTrigger className="text-sm w-full"><SelectValue placeholder="All Batches" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Batches</SelectItem>{(newBatchData || []).map((b) => (<SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>

                    {/* Enrolled Date filter */}
                    <div className="w-full sm:w-[160px] mt-2">
                        <Select value={enrolledDateFilter} onValueChange={handleEnrolledDateFilterChange}>
                            <SelectTrigger className="text-sm w-full">
                                <SelectValue placeholder="Enrolled Dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Enrolled</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="thisWeek">This Week</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="last3months">Last 3 Months</SelectItem>
                                <SelectItem value="last6months">Last 6 Months</SelectItem>
                                <SelectItem value="lastyear">Last Year</SelectItem>
                                <SelectItem value="older">Older</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Last Active Filter */}
                    {/* <div className="w-full sm:w-[160px] mt-2">
                        <Select
                            value={lastActiveFilter}
                            onValueChange={handleLastActiveFilterChange}
                        >
                            <SelectTrigger className="text-sm w-full">
                                <SelectValue placeholder="Last Active" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Active</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="thisWeek">This Week</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="last3months">Last 3 Months</SelectItem>
                                <SelectItem value="last6months">Last 6 Months</SelectItem>
                                <SelectItem value="lastyear">Last Year</SelectItem>
                                <SelectItem value="older">Older</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    {/* Attendance Filter - NEW */}
                    <div className="w-full sm:w-[160px]">
                        <Input
                            type="text"
                            placeholder="Attendance number"
                            value={attendanceFilter}
                            onChange={handleAttendanceFilterChange}
                            className="text-sm w-full"
                        />
                    </div>
                </div>

                <div>
                    <div className="mt-5">
                        <DataTable
                            data={students}
                            columns={columns}
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
