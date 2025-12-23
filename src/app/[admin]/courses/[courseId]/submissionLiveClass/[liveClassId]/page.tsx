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

interface Batch {
    id: number
    name: string
}

const Page = ({ params }: any) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [liveClassData, setLiveClassData] = useState<any>()
    const [dataTableLiveClass, setDataTableLiveClass] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
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
    const [sortField, setSortField] = useState<string>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [batches, setBatches] = useState<Batch[]>([])
    const [selectedBatch, setSelectedBatch] = useState<string>('all')
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)

    const fetchBatches = useCallback(async () => {
        setIsLoadingBatches(true)
        try {
            const res = await api.get(`/bootcamp/batches/${params.courseId}`)
            setBatches(res.data.data || [])
        } catch (error) {
            console.error('Error fetching batches:', error)
        } finally {
            setIsLoadingBatches(false)
        }
    }, [params.courseId])
    

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

    const fetchLiveClassData = useCallback(async (
        searchQuery: string = '',
        currentOffset: number = 0,
        limit: number = 10,
    ) => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams()
            queryParams.append('limit', limit.toString())
            queryParams.append('offset', currentOffset.toString())
            if (selectedBatch !== 'all') {
                console.log('Batch filter:', selectedBatch)
                queryParams.append('batchId', selectedBatch)
            }
            if (sortField) queryParams.append('orderBy', sortField)
            if (sortDirection) queryParams.append('orderDirection', sortDirection)
            if (searchQuery.trim()) {
                queryParams.append('name', searchQuery)
                queryParams.append('email', searchQuery)
            }
            const url = `/submission/livesession/zuvy_livechapter_student_submission/${params.liveClassId}?${queryParams.toString()}`
            const response = await api.get(url)
            const apiData = response.data.data
            
            const students = apiData?.data?.map((record: any) => ({									
            ...record,									
            id: record.userId,									
            name: record.user?.name,									
            email: record.user?.email									
            })) || []									
            setDataTableLiveClass(students)
            setTotalStudents(apiData?.totalCount || 0)
            setTotalPages(apiData?.totalPages || 0)
            setLastPage(apiData?.totalPages || 0)
        } catch (error) {
            console.error('Error fetching live class data:', error)
        } finally {
            setLoading(false)
        }
    }, [params.liveClassId, sortField, sortDirection, selectedBatch])
    // API functions for the SearchBox hook									
    const fetchSuggestionsApi = useCallback(
        async (query: string): Promise<Suggestion[]> => {
            if (!query.trim()) return []
            try {
                const res = await api.get(
                    `/submission/livesession/zuvy_livechapter_student_submission/${params.liveClassId}?limit=5&offset=0&name=${encodeURIComponent(query)}&email=${encodeURIComponent(query)}`
                )
                const students = res.data.data?.data || []
                return students
                    .map((record: any) => ({
                        id: record.userId,
                        name: record.user?.name ?? '',
                        email: record.user?.email ?? ''
                    }))
                    .filter((s: any) => s.name || s.email)
            } catch (error) {
                console.error('Suggestion API error:', error)
                return []
            }
        },
        [params.liveClassId]
    )


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
        fetchBatches()
    }, [fetchBatches])

    const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
    }, [])

    const handleBatchChange = useCallback((value: string) => {
        setSelectedBatch(value)
        setOffset(0)
      }, [setOffset])
      
    useEffect(() => {
        const currentSearchQuery = searchParams.get('search') || ''
        fetchLiveClassData(currentSearchQuery, offset, Number(position))
    }, [offset, position, searchParams, fetchLiveClassData])
            
      
    useEffect(() => {
        getBootcampHandler()
    }, [getBootcampHandler])
    return (
        <>
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course Submissions
                </Button>
            </div>
            <Card className="mb-8 border border-gray-200 shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-800 text-left">
                        {liveClassData?.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="bg-card">
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
                                onValueChange={handleBatchChange}
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="All Batches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Batches</SelectItem>
                                    {batches.map(batch => (
                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card">
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
                    <DataTable data={dataTableLiveClass} columns={columns} onSortingChange={handleSortingChange} />
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
        </>
    )
}

export default Page