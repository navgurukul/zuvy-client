'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'
import { BootcampData, Params, StudentPage, Chapter, APIResponse } from "@/app/admin/courses/[courseId]/submissionForm/[StudentForm]/IndividualReport/studentFormIndividualReportType"
import { SearchBox } from '@/utils/searchBox'
type Props = {}

const Page = ({ params }: any) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const moduleId = searchParams.get('moduleId')
    const [studentStatus, setStudentStatus] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState('All Batches')

    // Dummy batch data
    const batchOptions = [
        'All Batches',
        'Full Stack Batch 2024-A',
        'Full Stack Batch 2024-B',
        'Data Science Batch 2024-A',
        'UI/UX Design Batch 2024-A',
        'Mobile Development Batch 2024-A'
    ]
    // Separate state for overall statistics (NEVER changes during search)
    const [overallStats, setOverallStats] = useState({
        totalStudents: 0,
        totalSubmissions: 0,
        notSubmitted: 0,
        isInitialized: false // Flag to track if stats are loaded
    })

    // Get pagination params from URL
    const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams])
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const offset = useMemo(() => (currentPage - 1) * +position, [currentPage, position])

    // Fetch overall statistics ONCE when component mounts - Fixed version
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
                totalStudents: response.data.totalAllStudents || allStudents.length,
                totalSubmissions: submitted.length,
                notSubmitted: notSubmittedData.length,
                isInitialized: true
            })
        } catch (error) {
            console.error('Error fetching overall stats:', error)
            // Fallback: Set as initialized to prevent infinite retries
            setOverallStats(prev => ({ ...prev, isInitialized: true }))
        }
    }, [moduleId, params.courseId, params.StudentForm, overallStats.isInitialized])

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!moduleId || !query.trim()) return []

        const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&limit=5&offset=0&searchStudent=${encodeURIComponent(query)}`
        const response = await api.get(url)
        return (
            response.data.combinedData?.map((student: any) => ({
                id: student.id,
                name: student.name,
                email: student.emailId,
                ...student,
            })) || []
        )
    }, [params.courseId, params.StudentForm, moduleId])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        if (!moduleId) return []
        setLoading(true)
        const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&limit=${position}&offset=${offset}&searchStudent=${encodeURIComponent(query)}`
        const response = await api.get(url)

        const data = response.data.combinedData?.map((student: any) => ({
            ...student,
            bootcampId: params.courseId,
            moduleId: response.data.moduleId,
            chapterId: response.data.chapterId,
            userId: student.id,
            email: student.emailId,
        })) || []
        // Only update table-related state, NOT overallStats
        setStudentStatus(data)
        setTotalStudents(response.data.totalStudentsCount || 0)
        setPages(response.data.totalPages || 0)
        setLastPage(response.data.totalPages || 0)
        return data
    }, [params.courseId, params.StudentForm, moduleId, position, offset])

    const defaultFetchApi = useCallback(async () => {
        if (!moduleId) return []
        setLoading(true)
        const url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&limit=${position}&offset=${offset}`
        const response = await api.get(url)

        const data = response.data.combinedData?.map((student: any) => ({
            ...student,
            bootcampId: params.courseId,
            moduleId: response.data.moduleId,
            chapterId: response.data.chapterId,
            userId: student.id,
            email: student.emailId,
        })) || []

        setStudentStatus(data)
        setTotalStudents(response.data.totalStudentsCount || 0)
        setPages(response.data.totalPages || 0)
        setLastPage(response.data.totalPages || 0)
        return data
    }, [params.courseId, params.StudentForm, moduleId, position, offset])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error fetching bootcamps',
                variant: 'destructive'
            })
        }
    }, [params.courseId])

    const getChapterDetails = useCallback(async () => {
        try {
            const res = await api.get(`/tracking/getChapterDetailsWithStatus/${params.StudentForm}`)
            setChapterDetails(res.data.trackingData)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error fetching Chapter details',
                variant: 'destructive'
            })
        }
    }, [params.StudentForm])

    // For pagination - we need to modify this to work with search
    const getStudentFormDataHandler = useCallback(async (customOffset?: number) => {
        const searchTerm = searchParams.get('search')

        if (searchTerm) {
            // If there's a search term, use search API
            await fetchSearchResultsApi(searchTerm)
        } else {
            // Otherwise use default API
            await defaultFetchApi()
        }
    }, [searchParams, fetchSearchResultsApi, defaultFetchApi])

    // Initial data fetch - fetch stats ONCE
    useEffect(() => {
        const initializeData = async () => {
            if (!moduleId) return

            await Promise.all([
                getBootcampHandler(),
                getChapterDetails(),
            ])

            // Fetch overall stats only once, after other data is loaded
            await fetchOverallStats()
        }

        initializeData()
    }, [moduleId, getBootcampHandler, getChapterDetails, fetchOverallStats])

    // Pagination effect - this will handle data fetching based on search state
    useEffect(() => {
        if (moduleId && overallStats.isInitialized) {
            getStudentFormDataHandler()
        }
    }, [currentPage, position, moduleId, overallStats.isInitialized, getStudentFormDataHandler])
    return (
        <>
        <div className="min-h-screen flex justify-center">
            <MaxWidthWrapper className="p-6 max-w-7xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Submissions
                    </Button>
                </div>

                {overallStats.isInitialized ? (
                    <Card className="mb-8 border border-gray-200 shadow-sm bg-muted">
                        <CardHeader>
                            <CardTitle className="text-2xl text-gray-800 text-left">
                                {chapterDetails?.title || 'Loading...'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                <div className="text-left">
                                    <div className="font-medium text-muted-foreground">Total Submissions:</div>
                                    <div className="text-lg font-semibold">{overallStats.totalStudents || 0}</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm text-gray-600 mb-1">Submission Type:</div>
                                    <div className="text-xl font-semibold text-gray-900">Feedback</div>
                                </div>

                                <div className="text-left">
                                    <div className="text-sm text-gray-600 mb-1">Course ID:</div>
                                    <div className="text-xl font-semibold text-gray-900">{params.courseId}</div>
                                </div>
                                <div className="text-left">
                                    <label className="font-medium text-muted-foreground">Batch Filter</label>
                                    <Select
                                        value={selectedBatch}
                                        onValueChange={setSelectedBatch}
                                    >
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="All Batches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Batches</SelectItem>
                                            {batchOptions.map((batch, index) => (
                                                <SelectItem key={index} value={batch}>{batch}</SelectItem>
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
                <Card className="bg-muted">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-gray-800">
                                Student Submissions
                            </CardTitle>
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
                                    <div className="text-sm text-gray-500">{s.email}</div>
                                </div>

                            )}
                            inputWidth=""
                        />
                    </div>
                    <CardContent className="p-0">
                        <DataTable data={studentStatus || []} columns={columns} />
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
            </MaxWidthWrapper>
        </div>
        </>
    )
}

export default Page