'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { ArrowLeft, RefreshCw, Download } from 'lucide-react'
import Link from 'next/link'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { columns } from './columns'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBox } from '@/utils/searchBox'
import useDownloadCsv from '@/hooks/useDownloadCsv'
import { getUser } from '@/store/store'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import { usePracticeProblemSubmissions } from '@/hooks/usePracticeProblemSubmissions'
import { usePracticeProblemStatus } from '@/hooks/usePracticeProblemStatus'

interface BatchFilter {
    id: number
    name: string
}

const PracticeProblems = ({ params }: any) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { downloadCsv } = useDownloadCsv()
    const currentTab = searchParams.get('tab') || 'practice'
    const [matchingData, setMatchingData] = useState<any>(null)
    const { courseData: bootcampData } = useCourseExistenceCheck(params.courseId)
    const { trackingData, totalStudents } = usePracticeProblemSubmissions(params.courseId)
    const [crumbData, setCrumbData] = useState<string[]>([])
    const [sortField, setSortField] = useState<string>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [selectedBatch, setSelectedBatch] = useState<string>('all')
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)
    const [batches, setBatches] = useState<BatchFilter[]>([])
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId;

    const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
    const { studentDetails, loading: hookLoading, fetchStatus } = usePracticeProblemStatus(matchingData?.id, {
        chapterId: matchingData?.moduleChapterData?.[0]?.id,
        questionId: matchingData?.moduleChapterData?.[0]?.codingQuestionDetails?.id,
        searchStudent: appliedSearchQuery,
        batchId: selectedBatch,
        orderBy: sortField,
        orderDirection: sortDirection,
        enabled: !!matchingData,
    })

    const loading = hookLoading || !matchingData

    const studentStatus = useMemo(() => {
        if (!matchingData?.moduleChapterData?.[0]) return []
        return studentDetails.map((student: any) => ({
            ...student,
            bootcampId: params.courseId,
            questionId: matchingData.moduleChapterData[0].codingQuestionDetails.id,
            moduleId: params.StudentProblemData,
        }))
    }, [studentDetails, matchingData, params.courseId, params.StudentProblemData])

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

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!query.trim()) return []

        const res = await fetchStatus({ searchStudent: query })
        return res?.data?.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.emailId,
            ...student,
        })) || []
    }, [fetchStatus])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setAppliedSearchQuery(query)
    }, [])

    const defaultFetchApi = useCallback(async () => {
        setAppliedSearchQuery('')
    }, [])

    const handleVideoDownloadCsv = useCallback(() => {
        if (!matchingData) return

        const queryParams = new URLSearchParams()

        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }

        if (sortField) queryParams.append('orderBy', sortField)
        if (sortDirection) queryParams.append('orderDirection', sortDirection)

        downloadCsv({
            endpoint: `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}&${queryParams.toString()}`,

            fileName: `practice_problem_${matchingData.moduleChapterData[0].codingQuestionDetails?.title || 'submissions'}_${new Date()
                .toISOString()
                .split('T')[0]}`,

            dataPath: 'data',

            columns: [
                { header: 'Student Name', key: 'name' },
                { header: 'Email', key: 'email' },
                { header: 'Batch', key: 'batchName' },
                { header: 'Status', key: 'status' },
                { header: 'Completed At', key: 'completedAt' },
                { header: 'Attempts', key: 'noOfAttempts' },
            ],

            mapData: (item: any) => ({
                name: item.name || '',
                email: item.email || '',
                batchName: item.batchName || '',
                status: item.status || '',
                completedAt: item.completedAt || '',
                noOfAttempts: item.noOfAttempts ?? '',
            }),
        })
    }, [matchingData, selectedBatch, sortField, sortDirection])

    useEffect(() => {
        if (bootcampData?.name && matchingData?.moduleChapterData) {
            setCrumbData([
                bootcampData.name,
                `${matchingData.moduleChapterData[0].codingQuestionDetails?.title} - Submissions`
            ])
        }
    }, [bootcampData, matchingData])

    // Derive matchingData from hook's trackingData - preserving exact existing logic
    useEffect(() => {
        if (trackingData.length > 0 && params.StudentProblemData) {
            const matchingModule = trackingData.find(
                (module: any) =>
                    module.id === +params.StudentProblemData
            )
            setMatchingData(matchingModule || null)
        } else {
            setMatchingData(null)
        }
    }, [trackingData, params.StudentProblemData])

    // Handle sorting change
    const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
    }, [])

    useEffect(() => {
        fetchBatches()
    }, [fetchBatches])

    return (
        <>
            <div className="flex items-center gap-4 mb-8 mt-6">
                <Link href={`/${userRole}/organizations/${orgId}/courses/${params.courseId}/submissions?tab=${currentTab}`}>
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Submissions
                    </Button>
                </Link>
            </div>
            <Card className="mb-8 border border-gray-200 shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-800 text-left">
                        {matchingData?.moduleChapterData[0]?.codingQuestionDetails?.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div className='text-left'>
                            <div className="font-medium text-muted-foreground">Total Students</div>
                            <div className="text-lg font-semibold">{totalStudents}</div>
                        </div>
                        <div className='text-left'>
                            <div className="text-sm text-gray-600 mb-1">Submission Type</div>
                            <div className="text-xl font-semibold text-gray-900">Coding</div>
                        </div>

                        <div className='text-left'>
                            <div className="font-medium text-muted-foreground">Course ID</div>
                            <div className="text-lg font-semibold">{params.courseId}</div>
                        </div>
                        <div className='text-left'>
                            <label className="font-medium text-muted-foreground">Batch Filter</label>
                            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
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
                        <Button
                            onClick={handleVideoDownloadCsv}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={studentStatus.length === 0}
                        >
                            <Download className="h-4 w-4" />
                            Download Report
                        </Button>
                    </div>
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
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        data={studentStatus}
                        columns={columns}
                        onSortingChange={handleSortingChange}
                    />
                </CardContent>
            </Card>
        </>
    )
}

export default PracticeProblems
