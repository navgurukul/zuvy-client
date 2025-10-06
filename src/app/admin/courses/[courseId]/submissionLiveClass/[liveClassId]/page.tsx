'use client'

// External imports
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { SearchBox } from '@/utils/searchBox'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { getOffset } from '@/store/store'
import { POSITION } from '@/utils/constant'

type Props = {}

interface Suggestion {
    id: number;
    name: string;
    email: string;
}

const Page = ({ params }: any) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [liveClassData, setLiveClassData] = useState<any>()
    const [dataTableLiveClass, setDataTableLiveClass] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedBatch, setSelectedBatch] = useState('All Batches')
    
    // Pagination states
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
    const { offset, setOffset } = getOffset()
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalStudents, setTotalStudents] = useState(0)

    // Dummy batch data
    const batchOptions = [
        'All Batches',
        'Full Stack Batch 2024-A',
        'Full Stack Batch 2024-B',
        'Data Science Batch 2024-A',
        'UI/UX Design Batch 2024-A',
        'Mobile Development Batch 2024-A'
    ]

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
            crumb: liveClassData?.title || 'Loading...',
            isLast: true,
        },
    ]

    // Fetch live class data with pagination and search
    const fetchLiveClassData = useCallback(async (
        searchQuery: string = '',
        currentOffset: number = 0,
        limit: number = 10
    ) => {
        try {
            setLoading(true)
            
            // Build URL with pagination
            let url = `/submission/livesession/zuvy_livechapter_student_submission/${params.liveClassId}?limit=${limit}&offset=${currentOffset}`
            
            // Add both name and email parameters for search - API will handle the filtering
            if (searchQuery.trim()) {
                url += `&name=${encodeURIComponent(searchQuery)}&email=${encodeURIComponent(searchQuery)}`
            }

            const response = await api.get(url)
            const liveData = response.data.data?.[0] || {}
            
            // Map student records with additional info
            const students = liveData.studentAttendanceRecords?.map((record: any) => ({
                ...record,
                startTime: liveData.startTime,
                endTime: liveData.endTime,
                id: record.userId
            })) || []
            
            setDataTableLiveClass(students)
            setLiveClassData(liveData)
            
            // Calculate pagination
            const total = students.length
            setTotalStudents(total)
            const pages = Math.ceil(total / limit)
            setTotalPages(pages)
            setLastPage(pages)
            
            setLoading(false)
            return { students, liveData }
        } catch (error) {
            console.error('Error fetching live class data:', error)
            setLoading(false)
            return { students: [], liveData: null }
        }
    }, [params.liveClassId])

    // API functions for the SearchBox hook
    const fetchSuggestionsApi = useCallback(async (query: string): Promise<Suggestion[]> => {
        if (!query.trim()) return []

        try {
            // Use both name and email parameters 
            const url = `/submission/livesession/zuvy_livechapter_student_submission/${params.liveClassId}?limit=5&offset=0&name=${encodeURIComponent(query)}&email=${encodeURIComponent(query)}`
            const response = await api.get(url)
            
            const liveData = response.data.data?.[0] || {}
            
            return liveData.studentAttendanceRecords?.map((record: any) => ({
                id: record.userId,
                name: record.user?.name || '',
                email: record.user?.email || ''
            })).filter((s: Suggestion) => s.name && s.email) || []
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            return []
        }
    }, [params.liveClassId])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        await fetchLiveClassData(query, 0, Number(position))
    }, [fetchLiveClassData, position])

    const defaultFetchApi = useCallback(async () => {
        await fetchLiveClassData('', offset, Number(position))
    }, [fetchLiveClassData, offset, position])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('Error fetching bootcamp data:', error)
        }
    }, [params.courseId])

    // Handler for pagination
    const handlePaginationFetch = useCallback(async (newOffset: number) => {
        if (newOffset >= 0) {
            const currentSearchQuery = searchParams.get('search') || ''
            await fetchLiveClassData(currentSearchQuery, newOffset, Number(position))
        }
    }, [fetchLiveClassData, position, searchParams])

    useEffect(() => {
        getBootcampHandler()
    }, [getBootcampHandler])

    useEffect(() => {
        const currentSearchQuery = searchParams.get('search') || ''
        fetchLiveClassData(currentSearchQuery, offset, Number(position))
    }, [offset, position, searchParams.get('search')])
    
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

                <Card className="mb-8 border border-gray-200 shadow-sm bg-muted">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-800 text-left">
                            {liveClassData?.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="bg-muted">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div className="text-left">
                                <div className="font-medium text-muted-foreground">Total Submissions:</div>
                                <div className="text-lg font-semibold">
                                    {totalStudents || 0}
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="text-sm text-gray-600 mb-1">Submission Type:</div>
                                <div className="text-xl font-semibold text-gray-900">Live Class</div>
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
                    <DataTable data={dataTableLiveClass} columns={columns} />
                </CardContent>
            </Card>

                {/* Pagination */}
                <div className="p-6 border-t">
                    <DataTablePagination
                        totalStudents={totalStudents}
                        pages={totalPages}
                        lastPage={lastPage}
                        fetchStudentData={handlePaginationFetch}
                    />
                </div>
            </MaxWidthWrapper>
        </div>
        </>
    )
}

export default Page