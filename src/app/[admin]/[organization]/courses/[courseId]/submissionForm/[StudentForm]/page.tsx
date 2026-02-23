'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'
import {
    BootcampData,
    Params,
    StudentPage,
    Chapter,
    APIResponse,
} from '@/app/[admin]/[organization]/courses/[courseId]/submissionForm/[StudentForm]/IndividualReport/studentFormIndividualReportType'
import { SearchBox } from '@/utils/searchBox'
import useDownloadCsv from '@/hooks/useDownloadCsv'
import { getUser } from '@/store/store'

type Props = {}
interface Batch {
    id: number;
    name: string;
    bootcampId: number;
    instructorId: number;
    capEnrollment: number;
    createdAt: string;
    updatedAt: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    students_enrolled: number;
    instructorEmail: string;
}

const Page = ({ params }: any) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const moduleId = searchParams.get('moduleId')
    const currentTab = searchParams.get('tab') || 'form'
    const { downloadCsv } = useDownloadCsv()
    const [studentStatus, setStudentStatus] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState<string>('all')
    const [batches, setBatches] = useState<Batch[]>([])
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)
    const [sortField, setSortField] = useState<string>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    // Separate state for overall statistics (NEVER changes during search)
    const [overallStats, setOverallStats] = useState({
        totalStudents: 0,
        totalSubmissions: 0,
        notSubmitted: 0,
        isInitialized: false, // Flag to track if stats are loaded
    })

    // Get pagination params from URL
    const currentPage = useMemo(
        () => parseInt(searchParams.get('page') || '1'),
        [searchParams]
    )
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
    const offset = useMemo(
        () => (currentPage - 1) * +position,
        [currentPage, position]
    )

    // Fetch batches from API
    const fetchBatches = useCallback(async () => {
        setIsLoadingBatches(true)
        try {
            const res = await api.get(`/bootcamp/batches/${params.courseId}`)
            setBatches(res.data.data || [])
        } catch (error) {
            console.error('Error fetching batches:', error)
            toast({
                title: 'Error',
                description: 'Error fetching batches',
                variant: 'destructive',
            })
        } finally {
            setIsLoadingBatches(false)
        }
    }, [params.courseId])

    // Fetch overall statistics ONCE when component mounts
    const fetchOverallStats = useCallback(async () => {
        if (!moduleId || overallStats.isInitialized) return

        try {
            // Fetch ALL data to get correct overall statistics
            const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&limit=10&offset=0`
            const response = await api.get(url)

            const allStudents = response.data.combinedData || []
            const submitted = allStudents.filter(
                (student: any) => student.status === 'Submitted'
            )
            const notSubmittedData = allStudents.filter(
                (student: any) => student.status !== 'Submitted'
            )

            setOverallStats({
                totalStudents:
                    response.data.totalAllStudents || allStudents.length,
                totalSubmissions: submitted.length,
                notSubmitted: notSubmittedData.length,
                isInitialized: true,
            })
        } catch (error) {
            console.error('Error fetching overall stats:', error)
            // Fallback: Set as initialized to prevent infinite retries
            setOverallStats((prev) => ({ ...prev, isInitialized: true }))
        }
    }, [
        moduleId,
        params.courseId,
        params.StudentForm,
        overallStats.isInitialized,
    ])

    const fetchSuggestionsApi = useCallback(
        async (query: string) => {
            if (!moduleId || !query.trim()) return []

            const queryParams = new URLSearchParams()
            queryParams.append('limit', '5')
            queryParams.append('offset', '0')
            queryParams.append('searchStudent', query)
            
            if (selectedBatch !== 'all') {
                queryParams.append('batchId', selectedBatch)
            }

            const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&${queryParams.toString()}`
            const response = await api.get(url)
            return (
                response.data.combinedData?.map((student: any) => ({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    ...student,
                })) || []
            )
        },
        [params.courseId, params.StudentForm, moduleId, selectedBatch]
    )

    const fetchSearchResultsApi = useCallback(
        async (query: string) => {
            if (!moduleId) return []
            setLoading(true)
            
            const queryParams = new URLSearchParams()
            queryParams.append('limit', position.toString())
            queryParams.append('offset', offset.toString())
            queryParams.append('searchStudent', query)
            
            if (selectedBatch !== 'all') {
                queryParams.append('batchId', selectedBatch)
            }
            
            if (sortField) {
                queryParams.append('orderBy', sortField)
            }
            
            if (sortDirection) {
                queryParams.append('orderDirection', sortDirection)
            }

            const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&${queryParams.toString()}`
            const response = await api.get(url)

            const data =
                response.data.combinedData?.map((student: any) => ({
                    ...student,
                    bootcampId: params.courseId,
                    moduleId: response.data.moduleId,
                    chapterId: response.data.chapterId,
                    userId: student.id,
                    email: student.email,
                })) || []
            // Only update table-related state, NOT overallStats
            setStudentStatus(data)
            setTotalStudents(response.data.totalStudentsCount || 0)
            setPages(response.data.totalPages || 0)
            setLastPage(response.data.totalPages || 0)
            setLoading(false)
            return data
        },
        [params.courseId, params.StudentForm, moduleId, position, offset, selectedBatch, sortField, sortDirection]
    )

    const defaultFetchApi = useCallback(async () => {
        if (!moduleId) return []
        setLoading(true)
        
        const queryParams = new URLSearchParams()
        queryParams.append('limit', position.toString())
        queryParams.append('offset', offset.toString())
        
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
        
        if (sortField) {
            queryParams.append('orderBy', sortField)
        }
        
        if (sortDirection) {
            queryParams.append('orderDirection', sortDirection)
        }

        const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&${queryParams.toString()}`
        const response = await api.get(url)

        const data =
            response.data.combinedData?.map((student: any) => ({
                ...student,
                bootcampId: params.courseId,
                moduleId: response.data.moduleId,
                chapterId: response.data.chapterId,
                userId: student.id,
                email: student.email,
            })) || []

        setStudentStatus(data)
        setTotalStudents(response.data.totalStudentsCount || 0)
        setPages(response.data.totalPages || 0)
        setLastPage(response.data.totalPages || 0)
        setLoading(false)
        return data
    }, [params.courseId, params.StudentForm, moduleId, position, offset, selectedBatch, sortField, sortDirection])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error fetching bootcamps',
                variant: 'destructive',
            })
        }
    }, [params.courseId])

    const getChapterDetails = useCallback(async () => {
        try {
            const res = await api.get(
                `/tracking/getChapterDetailsWithStatus/${params.StudentForm}`
            )
            setChapterDetails(res.data.trackingData)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error fetching Chapter details',
                variant: 'destructive',
            })
        }
    }, [params.StudentForm])

    const handleVideoDownloadCsv = useCallback(() => {
        if (!moduleId) return
    
        const queryParams = new URLSearchParams()
    
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
    
        const currentSearchQuery = searchParams.get('search')
        if (currentSearchQuery) {
            queryParams.append('searchStudent', currentSearchQuery)
        }
    
        if (sortField) queryParams.append('orderBy', sortField)
        if (sortDirection) queryParams.append('orderDirection', sortDirection)
    
        downloadCsv({
            endpoint: `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&${queryParams.toString()}`,
    
            fileName: `feedback_${chapterDetails?.title || 'submissions'}_${new Date()
                .toISOString()
                .split('T')[0]}`,
    
            dataPath: 'combinedData',
    
            columns: [
                { header: 'Student Name', key: 'name' },
                { header: 'Email', key: 'email' },
                { header: 'Batch', key: 'batchName' },
                { header: 'Status', key: 'status' },
            ],
    
            mapData: (item: any) => ({
                name: item.name || '',
                email: item.email || '',
                batchName: item.batchName || '',
                status: item.status || '',
            }),
        })
    }, [moduleId,params.courseId,params.StudentForm,selectedBatch,searchParams,sortField,sortDirection,chapterDetails,])
    
    const handleBatchChange = useCallback((value: string) => {
        setSelectedBatch(value)
    }, [])

    // Handle sorting change
    const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
    }, [])

    const getStudentFormDataHandler = useCallback(
        async (customOffset?: number) => {
            const searchTerm = searchParams.get('search')

            if (searchTerm) {
                // If there's a search term, use search API
                await fetchSearchResultsApi(searchTerm)
            } else {
                // Otherwise use default API
                await defaultFetchApi()
            }
        },
        [searchParams, fetchSearchResultsApi, defaultFetchApi]
    )

    // Initial data fetch - fetch stats ONCE
    useEffect(() => {
        const initializeData = async () => {
            if (!moduleId) return

            await Promise.all([
                getBootcampHandler(), 
                getChapterDetails(),
                fetchBatches()
            ])

            await fetchOverallStats()
        }

        initializeData()
    }, [moduleId, getBootcampHandler, getChapterDetails, fetchBatches, fetchOverallStats])

    // Pagination effect - this will handle data fetching based on search state
    useEffect(() => {
        if (moduleId && overallStats.isInitialized) {
            getStudentFormDataHandler()
        }
    }, [
        currentPage,
        position,
        moduleId,
        overallStats.isInitialized,
        selectedBatch,
        sortField,
        sortDirection,
        getStudentFormDataHandler,
    ])

    return (
        <>
            <div className="flex items-center gap-4 mb-8 mt-6">
                <Link href={`/${userRole}/${orgName}/courses/${params.courseId}/submissions?tab=${currentTab}`}>
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Submissions
                    </Button>
                </Link>
            </div>

            {overallStats.isInitialized ? (
                <Card className="mb-8 border border-gray-200 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-800 text-left">
                            {chapterDetails?.title || 'Loading...'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div className="text-left">
                                <div className="font-medium text-muted-foreground">
                                    Total Submissions:
                                </div>
                                <div className="text-lg font-semibold">
                                    {overallStats.totalStudents || 0}
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="text-sm text-gray-600 mb-1">
                                    Submission Type:
                                </div>
                                <div className="text-xl font-semibold text-gray-900">
                                    Feedback
                                </div>
                            </div>

                            <div className="text-left">
                                <div className="text-sm text-gray-600 mb-1">
                                    Course ID:
                                </div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {params.courseId}
                                </div>
                            </div>
                            <div className="text-left">
                                <label className="font-medium text-muted-foreground">
                                    Batch Filter
                                </label>
                                <Select
                                    value={selectedBatch}
                                    onValueChange={handleBatchChange}
                                    disabled={isLoadingBatches}
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="All Batches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Batches
                                        </SelectItem>
                                        {batches.map((batch) => (
                                            <SelectItem
                                                key={batch.id}
                                                value={batch.id.toString()}
                                            >
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex gap-x-3 mb-8">
                    <Skeleton className="h-[85px] w-[200px] rounded-lg" />
                    <Skeleton className="h-[85px] w-[200px] rounded-lg" />
                    <Skeleton className="h-[85px] w-[200px] rounded-lg" />
                </div>
            )}
            <Card className="bg-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-800">
                            Student Submissions
                        </CardTitle>
                        <Button
                            onClick={handleVideoDownloadCsv}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={!studentStatus || studentStatus.length === 0}

                        >
                            <Download className="h-4 w-4" />
                            Download Report
                        </Button>
                    </div>
                </CardHeader>

                <div className="relative w-1/3 p-4">
                    <SearchBox
                        placeholder="Search by name or email"
                        fetchSuggestionsApi={fetchSuggestionsApi}
                        fetchSearchResultsApi={fetchSearchResultsApi}
                        defaultFetchApi={defaultFetchApi}
                        getSuggestionLabel={(s) => (
                            <div>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-sm text-gray-500">
                                    {s.email}
                                </div>
                            </div>
                        )}
                        inputWidth=""
                    />
                </div>
                <CardContent className="p-0">
                    <DataTable 
                        data={studentStatus || []} 
                        columns={columns}
                        onSortingChange={handleSortingChange}
                    />
                </CardContent>
            </Card>
            {/* Show pagination only when data is loaded */}
            {studentStatus && studentStatus.length > 0 && (
                <DataTablePagination
                    totalStudents={totalStudents}
                    lastPage={lastPage}
                    pages={pages}
                    fetchStudentData={getStudentFormDataHandler}
                />
            )}
        </>
    )
}

export default Page
