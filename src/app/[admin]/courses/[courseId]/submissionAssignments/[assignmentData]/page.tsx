'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SearchBox } from "@/utils/searchBox"

type Props = {}

const Page = ({ params }: { params: any }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>({})
    const [assignmentTitle, setAssignmentTitle] = useState<string>('')
    const [submittedStudents, setSubmittedStudents] = useState<number>(0)
    const [sortField, setSortField] = useState<string>('submittedDate')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

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
    }, [params.assignmentData, sortField, sortDirection])
    

    const defaultFetchApi = useCallback(async () => {
        const queryParams = new URLSearchParams()
        queryParams.append('limit', '100')
        queryParams.append('offset', '0')
    
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
    }, [params.assignmentData, sortField, sortDirection])
    
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

     // Handle sorting change
     const handleSortingChange = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortField(field)
        setSortDirection(direction)
    }, [])

    const totalStudents = bootcampData?.students_in_bootcamp - bootcampData?.unassigned_students
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
                                    {batchOptions.map((batch, index) => (
                                        <SelectItem key={index} value={batch}>{batch}</SelectItem>
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