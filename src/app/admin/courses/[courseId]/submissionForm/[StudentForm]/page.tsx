'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
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
    const searchParams = useSearchParams()
    const moduleId = searchParams.get('moduleId')
    const [studentStatus, setStudentStatus] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [loading, setLoading] = useState(false)

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

    const crumbs = [
        {
            crumb: 'My Courses',
            href: `/admin/courses`,
            isLast: false,
        },
        {
            crumb: bootcampData?.name,
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: 'Submission - Forms',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: chapterDetails?.title,
            href: '',
            isLast: true,
        },
    ]

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
            {chapterDetails ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {chapterDetails?.title}
                    </h1>

                    {/* Statistics Cards - These NEVER change during search */}
                    {overallStats.isInitialized ? (
                        <div className="text-start flex gap-x-3">
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {overallStats.totalStudents}
                                </h1>
                                <p className="text-gray-500">Total Students</p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {overallStats.totalSubmissions}
                                </h1>
                                <p className="text-gray-500">
                                    Submissions Received
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {overallStats.notSubmitted}
                                </h1>
                                <p className="text-gray-500">
                                    Not Yet Submitted
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-x-3">
                            <Skeleton className="h-[85px] w-[200px] rounded-lg" />
                            <Skeleton className="h-[85px] w-[200px] rounded-lg" />
                            <Skeleton className="h-[85px] w-[200px] rounded-lg" />
                        </div>
                    )}
                    <div className="relative w-1/3 my-6">
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

                    <DataTable data={studentStatus || []} columns={columns} />
                </div>

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
        </>
    )
}

export default Page