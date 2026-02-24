'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams ,useSearchParams} from 'next/navigation'
import { columns } from './columns'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { SearchBox } from '@/utils/searchBox'
import useDownloadCsv from '@/hooks/useDownloadCsv'
import { usePathname } from 'next/navigation'
import { getUser } from '@/store/store'

type Props = {}

interface BatchFilter {
    id: number
    name: string
}

const Page = ({ params }: any) => {
    const { organizationId } = useParams()
    const searchParams = useSearchParams()
    const { downloadCsv } = useDownloadCsv()
    const currentTab = searchParams.get('tab') || 'projects'
    const [data, setData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [projectStudentData, setProjectStudentData] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const [submitStudents, setSubmitStudents] = useState<number>(0)
    const [sortField, setSortField] = useState<string>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
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
        if (!query.trim()) return []

        // try {
        const res = await api.get(
            `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}&searchStudent=${encodeURIComponent(query)}&limit=10&offset=0`
        )
        return res.data.projectSubmissionData?.projectTrackingData?.map((student: any) => ({
            id: student.id,
            name: student.userName,
            email: student.userEmail,
            ...student
        })) || []
    }, [params.courseId, params.StudentsProjects])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setLoading(true)
    
        const queryParams = new URLSearchParams()
        queryParams.append('searchStudent', query)
        queryParams.append('limit', '10')
        queryParams.append('offset', '0')
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
        if (sortField) queryParams.append('orderBy', sortField)
        if (sortDirection) queryParams.append('orderDirection', sortDirection)
    
        const res = await api.get(
            `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}&${queryParams.toString()}`
        )
    
        const students = res.data.projectSubmissionData?.projectTrackingData || []
        setProjectStudentData(students)
        setLoading(false)
    }, [params.courseId, params.StudentsProjects, sortField, sortDirection,selectedBatch])
    

    const defaultFetchApi = useCallback(async () => {
        setLoading(true)
    
        const queryParams = new URLSearchParams()
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
        if (sortField) queryParams.append('orderBy', sortField)
        if (sortDirection) queryParams.append('orderDirection', sortDirection)
    
        const res = await api.get(
            `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}&${queryParams.toString()}`
        )
    
        const students = res.data.projectSubmissionData?.projectTrackingData || []
        setProjectStudentData(students)
        setLoading(false)
    }, [params.courseId, params.StudentsProjects, sortField, sortDirection,selectedBatch])
    

    const getProjectsData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfProjects/${params.courseId}`
            )
            setData(res.data.data.bootcampModules[0])
            setSubmitStudents(res.data.data.bootcampModules[0]?.projectData[0]?.submitStudents || 0)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error(error)
        }
    }, [params.courseId])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const handleVideoDownloadCsv = useCallback(() => {
        const queryParams = new URLSearchParams()
    
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
        if (sortField) queryParams.append('orderBy', sortField)
        if (sortDirection) queryParams.append('orderDirection', sortDirection)
    
        downloadCsv({
            endpoint: `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}&${queryParams.toString()}`,
    
            fileName: `project_submissions_${data?.projectData?.[0]?.title || 'project'}_${new Date()
                .toISOString()
                .split('T')[0]}`,
    
            dataPath: 'projectSubmissionData.projectTrackingData',
    
            columns: [
                { header: 'Student Name', key: 'name' },
                { header: 'Email', key: 'email' },
                { header: 'Batch', key: 'batchName' },
                { header: 'Project Link', key: 'projectLink' },
            ],
    
            mapData: (item: any) => ({
                name: item.name || '',
                email: item.email || '',
                batchName: item.batchName || '',
                projectLink: item.projectLink || '',

            }),
        })
    }, [params.courseId,params.StudentsProjects,selectedBatch,sortField,sortDirection,data])
    
    // Handle sorting change
    const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
    }, [])

    useEffect(() => {
        getProjectsData()
        getBootcampHandler()
    }, [getProjectsData, getBootcampHandler])
    useEffect(() => {
        fetchBatches()
    }, [fetchBatches])
    useEffect(() => {
        defaultFetchApi()
    }, [sortField, sortDirection, defaultFetchApi,selectedBatch])

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

            {/* Assessment Info Card */}
            <Card className="mb-8 border border-gray-200 shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-800 text-left">
                        {data?.projectData[0].title || 'Loading...'}
                    </CardTitle>

                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div className="text-left">
                            <div className="font-medium text-muted-foreground">Total Submissions:</div>
                            <div className="text-lg font-semibold">{submitStudents || 0}</div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-gray-600 mb-1">Submission Type:</div>
                            <div className="text-xl font-semibold text-gray-900">Project</div>
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
            <Card className='bg-card'>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-800">
                            Student Submissions
                        </CardTitle>
                        <Button
                            onClick={handleVideoDownloadCsv}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={projectStudentData.length === 0}
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
                                <div className="text-sm text-gray-500">{s.email}</div>
                            </div>
                        )}
                        inputWidth=""
                    />
                </div>
                <CardContent className="p-0">
                    <DataTable 
                        data={projectStudentData} 
                        columns={columns}
                        onSortingChange={handleSortingChange}
                    />
                </CardContent>
            </Card>
        </>
    )
}

export default Page