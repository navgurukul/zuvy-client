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
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Button } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { getIsReattemptApproved, getOffset } from '@/store/store'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { fetchStudentAssessments } from '@/utils/admin'
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

const Page = ({ params }: any) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [assesmentData, setAssessmentData] = useState<any>()
    const [dataTableAssesment, setDataTableAssessments] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [passPercentage, setPassPercentage] = useState<number>(0)
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

    // API functions for the hook
    const fetchSuggestionsApi = useCallback(async (query: string): Promise<Suggestion[]> => {
        // if (!query.trim() || query.length < 2) {
        //     return []
        // }
        const { assessments } = await fetchStudentAssessments(
            params?.assessment_Id,
            params?.courseId,
            0, // Start from first page for suggestions
            5, // Limit to 5 results for suggestions
            query, // Use the search query
            () => { }, // Empty function for setTotalPages
            () => { }  // Empty function for setLastPage
        )

        return assessments
            .map((student: any) => ({
                id: student.id || student.studentId || student.student?.id || Math.random().toString(),
                name: student.name || student.studentName || student.student?.name || '',
                email: student.email || student.studentEmail || student.student?.email || ''
            }))
            .filter((suggestion: Suggestion) => suggestion.name && suggestion.email)
    }, [params.assessment_Id, params.courseId])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
            params?.assessment_Id,
            params?.courseId,
            offset,
            position,
            query,
            setTotalPages,
            setLastPage
        )
        setDataTableAssessments(assessments)
        setAssessmentData(moduleAssessment)
        setPassPercentage(passPercentage)
        setTotalStudents(moduleAssessment?.totalStudents)
        return assessments
    }, [params.assessment_Id, params.courseId, offset, position])

    const defaultFetchApi = useCallback(async () => {
        const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
            params?.assessment_Id,
            params?.courseId,
            offset,
            position,
            '', // Empty search query
            setTotalPages,
            setLastPage
        )
        setDataTableAssessments(assessments)
        setAssessmentData(moduleAssessment)
        setPassPercentage(passPercentage)
        setTotalStudents(moduleAssessment?.totalStudents)
        return assessments
    }, [params.assessment_Id, params.courseId, offset, position])

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
                const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
                    params?.assessment_Id,
                    params?.courseId,
                    offset,
                    position,
                    currentSearchQuery,
                    setTotalPages,
                    setLastPage
                )
                setDataTableAssessments(assessments)
                setAssessmentData(moduleAssessment)
                setPassPercentage(passPercentage)
                setTotalStudents(moduleAssessment?.totalStudents)
            }
        },
        [params.assessment_Id, params.courseId, position, searchParams]
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getBootcampHandler(),
                ])
            } catch (error) {
                console.error('Error in fetching data:', error)
            }
        }

        fetchData()
    }, [isReattemptApproved, getBootcampHandler])

    useEffect(() => {
        getStudentAssesmentDataHandler(offset)
    }, [
        offset,
        getStudentAssesmentDataHandler,
        position,
        setLastPage,
        setTotalPages,
        searchParams.get('search')])
    return (
        <>
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
                    <DataTable data={dataTableAssesment} columns={columns} />
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
        </>
    )
}

export default Page