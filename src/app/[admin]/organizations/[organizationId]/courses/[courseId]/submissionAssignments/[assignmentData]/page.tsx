'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft,Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { SearchBox } from "@/utils/searchBox"
import useDownloadCsv from '@/hooks/useDownloadCsv'
import { getUser } from '@/store/store'

type Props = {}

interface BatchFilter {
    id: number
    name: string
}

const Page = ({ params }: { params: any }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { organizationId } = useParams()
    const { downloadCsv } = useDownloadCsv()
    const currentTab = searchParams.get('tab') || 'assignments'
    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>({})
    const [assignmentTitle, setAssignmentTitle] = useState<string>('')
    const [submittedStudents, setSubmittedStudents] = useState<number>(0)
    const [sortField, setSortField] = useState<string>('submittedDate')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [selectedBatch, setSelectedBatch] = useState<string>('all')
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)
    const [batches, setBatches] = useState<BatchFilter[]>([])
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 

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
    

    // API functions for the hook
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        // Using the same search API for suggestions with limit 5
        const res = await api.get(`/submission/assignmentStatus?chapterId=${params.assignmentData}&searchStudent=${encodeURIComponent(query)}`)
        const suggestions = res?.data?.data?.data?.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.emailId,
            emailId: student.emailId
        })) || []
        return suggestions
    }, [params.assignmentData])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        const queryParams = new URLSearchParams()
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
    
        const res = await api.get(
            `/submission/assignmentStatus?chapterId=${params.assignmentData}&${queryParams.toString()}`
        )
    
        const assignmentData = res?.data?.data
        if (assignmentData) {
            const chapterId = assignmentData?.chapterId
            assignmentData.data.forEach((data: any) => {
                data.chapterId = chapterId
            })
            setAssignmentData(assignmentData.data)
            setSubmittedStudents(assignmentData.data.length)
            if (assignmentData.chapterName) {
                setAssignmentTitle(assignmentData.chapterName)
            }
        }
    
        return assignmentData?.data || []
    }, [params.assignmentData, sortField, sortDirection,selectedBatch])
    

    const defaultFetchApi = useCallback(async () => {
        const queryParams = new URLSearchParams()
        queryParams.append('limit', '100')
        queryParams.append('offset', '0')
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
        if (sortField) {
            queryParams.append('orderBy', sortField)
        }
    
        if (sortDirection) {
            queryParams.append('orderDirection', sortDirection)
        }
    
        const res = await api.get(
            `/submission/assignmentStatus?chapterId=${params.assignmentData}&${queryParams.toString()}`
        )
    
        const assignmentData = res?.data?.data
        if (assignmentData) {
            const chapterId = assignmentData?.chapterId
            assignmentData.data.forEach((data: any) => {
                data.chapterId = chapterId
            })
            setAssignmentData(assignmentData.data)
            setSubmittedStudents(assignmentData.data.length)
            setAssignmentTitle(assignmentData.chapterName)
        }
    
        return assignmentData?.data || []
    }, [params.assignmentData, sortField, sortDirection,selectedBatch])
    
    useEffect(() => {
        defaultFetchApi();
    }, [defaultFetchApi, sortField, sortDirection]);
    
    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('Error fetching bootcamp data:', error)
        }
    }, [params.courseId])

    useEffect(() => {
        getBootcampHandler()
    }, [getBootcampHandler])

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
    }, [fetchBatches])
     // Handle sorting change
     const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
    }, [])
    const handleVideoDownloadCsv = useCallback(() => {
        const queryParams = new URLSearchParams()
    
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
    
        const currentSearchQuery = searchParams.get('search') || ''
        if (currentSearchQuery) {
            queryParams.append('searchStudent', currentSearchQuery)
        }
    
        if (sortField) queryParams.append('orderBy', sortField)
        if (sortDirection) queryParams.append('orderDirection', sortDirection)
    
        downloadCsv({
            endpoint: `/submission/assignmentStatus?chapterId=${params.assignmentData}&${queryParams.toString()}`,
    
            fileName: `assignment_${assignmentTitle || 'submissions'}_${new Date()
                .toISOString()
                .split('T')[0]}`,
    
            dataPath: 'data.data',
    
            columns: [
                { header: 'Student Name', key: 'name' },
                { header: 'Email', key: 'emailId' },
                { header: 'Batch', key: 'batchName' },
                { header: 'Submitted Status', key: 'status' },
                { header: 'Submitted Date', key: 'submitted_date' },
            ],
    
            mapData: (item: any) => ({
                name: item.name || '',
                emailId: item.emailId || '',
                batchName: item.batchName || '',
                status: item.status || '',
                submitted_date: item.submitted_date || '',
            }),
        })
    }, [params.assignmentData,selectedBatch,searchParams,sortField,sortDirection,assignmentTitle])
    
    const totalStudents = bootcampData?.students_in_bootcamp - bootcampData?.unassigned_students
    return (
        <>
            <div className="flex items-center gap-4 mb-8 mt-5">
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

            {/* Assessment Info Card */}
            <Card className="mb-8 border border-gray-200 shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-800 text-left">
                        {assignmentTitle || 'Loading...'}
                    </CardTitle>

                </CardHeader>
                <CardContent className="">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div className="text-left">
                            <div className="font-medium text-muted-foreground">Total Submissions:</div>
                            <div className="text-lg font-semibold">{totalStudents || 0}</div>
                        </div>

                        <div className="text-left">
                            <div className="text-sm text-gray-600 mb-1">Submission Type:</div>
                            <div className="text-xl font-semibold text-gray-900">Assignments</div>
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
                            disabled={assignmentData.length === 0}
                        >
                            <Download className="h-4 w-4" />
                            Download Report
                        </Button>
                    </div>
                </CardHeader>

                <div className="relative w-1/3 p-4">
                    <SearchBox
                        placeholder="Search for Name, Email..."
                        fetchSuggestionsApi={fetchSuggestionsApi}
                        fetchSearchResultsApi={fetchSearchResultsApi}
                        defaultFetchApi={defaultFetchApi}
                        getSuggestionLabel={(s) => (
                            <div>
                                <div className="font-medium">{s.name}</div>
                                <div className="font-medium text-sm text-gray-500">{s.email}</div>

                            </div>
                        )}
                        inputWidth=""
                    />
                </div>
                <CardContent className="p-0">
                    <DataTable data={assignmentData} columns={columns} onSortingChange={handleSortingChange}/>
                </CardContent>
            </Card>
        </>
    )
}
export default Page