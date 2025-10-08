'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'

import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { columns } from './columns'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBox } from '@/utils/searchBox'

const PracticeProblems = ({ params }: any) => {
    const router = useRouter()
    const [matchingData, setMatchingData] = useState<any>(null)
    const [bootcampData, setBootcampData] = useState<any>({})
    const [studentStatus, setStudentStatus] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [loading, setLoading] = useState(false)
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

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!query.trim()) return []

        const res = await api.get(
            `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}&searchStudent=${encodeURIComponent(query)}`
        )

        return res.data.data.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.emailId,
            ...student,
        })) || []
    }, [matchingData])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setLoading(true)

        const res = await api.get(
            `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}&searchStudent=${encodeURIComponent(query)}`
        )

        const students = res.data.data.map((student: any) => ({
            ...student,
            email: student.emailId,
            bootcampId: params.courseId,
            questionId: matchingData.moduleChapterData[0].codingQuestionDetails.id,
            moduleId: params.StudentProblemData,
        })) || []

        setStudentStatus(students)
        setLoading(false)
    }, [matchingData, params.courseId, params.StudentProblemData])

    const defaultFetchApi = useCallback(async () => {
        setLoading(true)

        const res = await api.get(
            `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}`
        )

        const students = res.data.data.map((student: any) => ({
            ...student,
            email: student.emailId,
            bootcampId: params.courseId,
            questionId: matchingData.moduleChapterData[0].codingQuestionDetails.id,
            moduleId: params.StudentProblemData,
        })) || []

        setStudentStatus(students)
        setLoading(false)
    }, [matchingData, params.courseId, params.StudentProblemData])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    // Store breadcrumb data in localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(
            'crumbData',
            JSON.stringify([
                bootcampData?.name,
                `${matchingData?.moduleChapterData[0]?.codingQuestionDetails
                    ?.title} - Submissions`,
            ])
        )
    }

    // Initial data fetch - exactly like projects code
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [submissionRes, bootcampRes] = await Promise.all([
                    api.get(
                        `/submission/submissionsOfPractiseProblems/${params.courseId}`
                    ),
                    api.get(`/bootcamp/${params.courseId}`),
                ])

                const submissions = submissionRes.data.trackingData
                setTotalStudents(submissionRes.data.totalStudents)
                setBootcampData(bootcampRes.data.bootcamp)

                if (submissions.length > 0 && params.StudentProblemData) {
                    const matchingModule = submissions.find(
                        (module: any) =>
                            module.id === +params.StudentProblemData
                    )
                    setMatchingData(matchingModule || null)
                } else {
                    setMatchingData(null)
                    setStudentStatus([])
                }
            } catch (error) {
                console.error('Error fetching initial data', error)
            }
        }

        fetchInitialData()
    }, [params.courseId, params.StudentProblemData])

    useEffect(() => {
        if (matchingData) {
            defaultFetchApi()
        }
    }, [matchingData])

    return (
        <>
        <div className="min-h-screen flex justify-center">
            <MaxWidthWrapper className="p-6 max-w-7xl">
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
                <Card className="mb-8 border border-gray-200 shadow-sm bg-muted">
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
                                        <SelectItem value="All Batches">All Batches</SelectItem>
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
                        <DataTable data={studentStatus} columns={columns} />
                    </CardContent>
                </Card>
            </MaxWidthWrapper >
        </div>
        </>
    )
}

export default PracticeProblems