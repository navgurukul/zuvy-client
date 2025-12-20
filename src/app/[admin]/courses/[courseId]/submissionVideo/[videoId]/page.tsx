'use client'

// External imports
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { SearchBox } from '@/utils/searchBox'

type Props = {}
interface BatchFilter {
    id: number
    name: string
  }

const Page = ({ params }: any) => {
    const router = useRouter()
    const [videoData, setVideoData] = useState<any>()
    const [dataTableVideo, setDataTableVideo] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedBatch, setSelectedBatch] = useState<string>('all')
    const [batches, setBatches] = useState<BatchFilter[]>([])


    useEffect(() => {
        if (!dataTableVideo?.length) return
    
        const map = new Map<number, BatchFilter>()
    
        dataTableVideo.forEach((student: any) => {
            if (student.batchId && student.batchName) {
                map.set(student.batchId, {
                    id: student.batchId,
                    name: student.batchName,
                })
            }
        })
    
        setBatches(Array.from(map.values()))
    }, [dataTableVideo])
    
    // API functions for the hook - exactly like your pattern
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!query.trim()) return []

        const url = `/admin/moduleChapter/students/chapter_id${params.videoId}?searchStudent=${encodeURIComponent(query)}&limit=5&offset=0`
        const response = await api.get(url)
        return response.data.submittedStudents?.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            ...student
        })) || []
    }, [params.videoId])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setLoading(true)
    
        const queryParams = new URLSearchParams()
        queryParams.append('searchStudent', query)
        queryParams.append('limit', '10')
        queryParams.append('offset', '0')
    
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
    
        const url = `/admin/moduleChapter/students/chapter_id${params.videoId}?${queryParams.toString()}`
        const response = await api.get(url)
    
        setDataTableVideo(response.data.submittedStudents || [])
        setVideoData(response.data.moduleVideochapter)
    
        setLoading(false)
    }, [params.videoId, selectedBatch])
    

    const defaultFetchApi = useCallback(async () => {
        setLoading(true)
    
        const queryParams = new URLSearchParams()
    
        if (selectedBatch !== 'all') {
            queryParams.append('batchId', selectedBatch)
        }
    
        const url = queryParams.toString()
            ? `/admin/moduleChapter/students/chapter_id${params.videoId}?${queryParams.toString()}`
            : `/admin/moduleChapter/students/chapter_id${params.videoId}`
    
        const response = await api.get(url)
    
        const students = response.data.submittedStudents || []
        setDataTableVideo(students)
        setVideoData(response.data.moduleVideochapter)
    
        setLoading(false)
    }, [params.videoId, selectedBatch])
    useEffect(() => {
        defaultFetchApi()
    }, [selectedBatch])
    

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
                        {videoData?.title || 'Loading...'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div className="text-left">
                                <div className="font-medium text-muted-foreground">Total Submissions:</div>
                                <div className="text-lg font-semibold">{videoData?.totalStudents || 0}</div>
                            </div>
                            <div className="text-left">
                                <div className="text-sm text-gray-600 mb-1">Submission Type:</div>
                                <div className="text-xl font-semibold text-gray-900">Video</div>
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
                    <DataTable data={dataTableVideo} columns={columns} />
                </CardContent>
            </Card>
        </>
    )
}

export default Page
