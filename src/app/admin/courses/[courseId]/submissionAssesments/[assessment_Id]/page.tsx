'use client'

// External imports
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'

// Internal imports
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { getIsReattemptApproved, getOffset } from '@/store/store'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { POSITION } from '@/utils/constant'
import { SearchBox } from '@/utils/searchBox'

type Props = {}

interface PageParams {
    courseId: string
    assessment_Id: string
}

interface Suggestion {
    id: string;
    name: string;
    email: string;
}

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
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [assesmentData, setAssessmentData] = useState<any>()
    const [dataTableAssesment, setDataTableAssessments] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [passPercentage, setPassPercentage] = useState<number>(0)
    const [selectedBatch, setSelectedBatch] = useState<string>('all')
    const [batches, setBatches] = useState<Batch[]>([])
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)
    const [sortField, setSortField] = useState<string>('submittedDate')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const { isReattemptApproved } = getIsReattemptApproved()
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
    const { offset, setOffset } = getOffset()
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalStudents, setTotalStudents] = useState(0)

    // Fetch batches from API
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

    // Fetch student assessments with sorting, batch filter and search
    const fetchStudentAssessmentsWithBatch = useCallback(async (
        assessmentId: string,
        courseId: string,
        offset: number,
        limit: number | string,
        searchQuery: string,
        batchId?: string,
        orderBy?: string,
        orderDirection?: 'asc' | 'desc'
    ) => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams()
            
            if (batchId && batchId !== 'all') {
                queryParams.append('batchId', batchId)
            }
            
            if (searchQuery) {
                queryParams.append('searchStudent', searchQuery)
            }
            
            if (orderBy) {
                queryParams.append('orderBy', orderBy)
            }
            
            if (orderDirection) {
                queryParams.append('orderDirection', orderDirection)
            }
            
            queryParams.append('offset', offset.toString())
            queryParams.append('limit', limit.toString())

            const res = await api.get(
                `/admin/assessment/students/assessment_id${assessmentId}?${queryParams.toString()}`
            )

            const data = res.data
            const assessments = data.submitedOutsourseAssessments || []
            const moduleAssessment = data.ModuleAssessment || {}
            
            // Calculate total pages
            const totalStudents = moduleAssessment.totalSubmitedStudents || 0
            const calculatedTotalPages = Math.ceil(totalStudents / Number(limit))
            
            setTotalPages(calculatedTotalPages)
            setLastPage(calculatedTotalPages)
            
            return {
                assessments,
                moduleAssessment,
                passPercentage: moduleAssessment.passPercentage || 0
            }
        } catch (error) {
            console.error('Error fetching student assessments:', error)
            return {
                assessments: [],
                moduleAssessment: {},
                passPercentage: 0
            }
        }
    }, [])

    // API functions for the hook
    const fetchSuggestionsApi = useCallback(async (query: string): Promise<Suggestion[]> => {
        const { assessments } = await fetchStudentAssessmentsWithBatch(
            params?.assessment_Id,
            params?.courseId,
            0,
            5,
            query,
            selectedBatch !== 'all' ? selectedBatch : undefined,
            sortField,
            sortDirection
        )

        return assessments
            .map((student: any) => ({
                id: student.id || student.studentId || student.student?.id || Math.random().toString(),
                name: student.name || student.studentName || student.student?.name || '',
                email: student.email || student.studentEmail || student.student?.email || ''
            }))
            .filter((suggestion: Suggestion) => suggestion.name && suggestion.email)
    }, [params.assessment_Id, params.courseId, selectedBatch, sortField, sortDirection, fetchStudentAssessmentsWithBatch])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessmentsWithBatch(
            params?.assessment_Id,
            params?.courseId,
            offset,
            position,
            query,
            selectedBatch !== 'all' ? selectedBatch : undefined,
            sortField,
            sortDirection
        )
        setDataTableAssessments(assessments)
        setAssessmentData(moduleAssessment)
        setPassPercentage(passPercentage)
        setTotalStudents(moduleAssessment?.totalSubmitedStudents || 0)
        return assessments
    }, [params.assessment_Id, params.courseId, offset, position, selectedBatch, sortField, sortDirection, fetchStudentAssessmentsWithBatch])

    const defaultFetchApi = useCallback(async () => {
        const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessmentsWithBatch(
            params?.assessment_Id,
            params?.courseId,
            offset,
            position,
            '',
            selectedBatch !== 'all' ? selectedBatch : undefined,
            sortField,
            sortDirection
        )
        setDataTableAssessments(assessments)
        setAssessmentData(moduleAssessment)
        setPassPercentage(passPercentage)
        setTotalStudents(moduleAssessment?.totalSubmitedStudents || 0)
        return assessments
    }, [params.assessment_Id, params.courseId, offset, position, selectedBatch, sortField, sortDirection, fetchStudentAssessmentsWithBatch])

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
            crumb: 'Submission - Assesments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assesmentData?.title,
            isLast: false,
        },
    ]

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getStudentAssesmentDataHandler = useCallback(
        async (offset: number) => {
            if (offset >= 0) {
                const currentSearchQuery = searchParams.get('search') || ''
                const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessmentsWithBatch(
                    params?.assessment_Id,
                    params?.courseId,
                    offset,
                    position,
                    currentSearchQuery,
                    selectedBatch !== 'all' ? selectedBatch : undefined,
                    sortField,
                    sortDirection
                )
                setDataTableAssessments(assessments)
                setAssessmentData(moduleAssessment)
                setPassPercentage(passPercentage)
                setTotalStudents(moduleAssessment?.totalSubmitedStudents || 0)
            }
        },
        [params.assessment_Id, params.courseId, position, searchParams, selectedBatch, sortField, sortDirection, fetchStudentAssessmentsWithBatch]
    )

    // Handle batch change
    const handleBatchChange = useCallback((value: string) => {
        setSelectedBatch(value)
        setOffset(0)
    }, [setOffset])

    // Handle sorting change
    const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
        setOffset(0)
    }, [setOffset])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getBootcampHandler(),
                    fetchBatches()
                ])
            } catch (error) {
                console.error('Error in fetching data:', error)
            }
        }

        fetchData()
    }, [isReattemptApproved, getBootcampHandler, fetchBatches])

    useEffect(() => {
        getStudentAssesmentDataHandler(offset)
    }, [
        offset,
        getStudentAssesmentDataHandler,
        position,
        setLastPage,
        setTotalPages,
        searchParams.get('search'),
        selectedBatch,
        sortField,
        sortDirection
    ])

    return (
        <>
        <div className="min-h-screen flex justify-center">
            <MaxWidthWrapper className="p-6 max-w-7xl">
                {/* Header */}
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

                {/* Assessment Info Card */}
                <Card className="mb-8 border border-gray-200 shadow-sm bg-muted">
                    <CardHeader className="bg-muted">
                        <CardTitle className="text-2xl text-gray-800 text-left">
                            {assesmentData?.title || 'Loading...'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="bg-muted">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div className="text-left">
                                <div className="font-medium text-muted-foreground">Total Submissions:</div>
                                <div className="text-lg font-semibold">{assesmentData?.totalSubmitedStudents || 0}</div>
                            </div>
                            <div className="text-left">
                                <div className="text-sm text-gray-600 mb-1">Submission Type:</div>
                                <div className="text-xl font-semibold text-gray-900">Assessments</div>
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
                                    disabled={isLoadingBatches}
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="All Batches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        {batches.map((batch) => (
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
                        <DataTable 
                            data={dataTableAssesment} 
                            columns={columns}
                            onSortingChange={handleSortingChange}
                        />
                    </CardContent>
                </Card>
                <div className="p-6 border-t">
                    <DataTablePagination
                        totalStudents={totalStudents}
                        pages={totalPages}
                        lastPage={lastPage}
                        fetchStudentData={getStudentAssesmentDataHandler}
                    />
                </div>
            </MaxWidthWrapper>
            </div>
        </>
    )
}

export default Page