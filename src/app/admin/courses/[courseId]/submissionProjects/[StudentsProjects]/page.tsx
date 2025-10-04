'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { columns } from './columns'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@nextui-org/react'
import { SearchBox } from '@/utils/searchBox'

type Props = {}

const Page = ({ params }: any) => {
    const router = useRouter()
    const [data, setData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [projectStudentData, setProjectStudentData] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
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

    // API functions for the hook
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!query.trim()) return []

        // try {
        const res = await api.get(
            `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}&searchStudent=${encodeURIComponent(query)}&limit=5&offset=0`
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
        const res = await api.get(
            `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}&searchStudent=${encodeURIComponent(query)}&limit=100&offset=0`
        )
        const students = res.data.projectSubmissionData?.projectTrackingData || []
        setProjectStudentData(students)
    }, [params.courseId, params.StudentsProjects])

    const defaultFetchApi = useCallback(async () => {
        setLoading(true)
        const res = await api.get(
            `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}`
        )
        const students = res.data.projectSubmissionData?.projectTrackingData || []
        setProjectStudentData(students)
    }, [params.courseId, params.StudentsProjects])

    const getProjectsData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfProjects/${params.courseId}`
            )
            setData(res.data.data.bootcampModules[0])
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

    useEffect(() => {
        getProjectsData()
        getBootcampHandler()
    }, [getProjectsData, getBootcampHandler])

    return (
        <>
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

                {/* Assessment Info Card */}
                <Card className="mb-8 border border-gray-200 shadow-sm bg-muted">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-800 text-left">
                            {data?.projectData[0].title || 'Loading...'}
                        </CardTitle>

                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div className="text-left">
                                <div className="font-medium text-muted-foreground">Total Submissions:</div>
                                <div className="text-lg font-semibold">{totalStudents || 0}</div>
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
                                        {batchOptions.map((batch, index) => (
                                            <SelectItem key={index} value={batch}>{batch}</SelectItem>
                                        ))}
                                    </SelectContent>

                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className='bg-muted'>
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
                        <DataTable data={projectStudentData} columns={columns} />
                    </CardContent>
                </Card>
            </MaxWidthWrapper>
        </>
    )
}

export default Page