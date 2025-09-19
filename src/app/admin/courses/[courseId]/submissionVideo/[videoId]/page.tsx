'use client'

// External imports
import React, { useCallback, useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { SearchBox } from '@/utils/searchBox' 

type Props = {}

const Page = ({ params }: any) => {
    const [videoData, setVideoData] = useState<any>()
    const [dataTableVideo, setDataTableVideo] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)

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
            crumb: videoData?.title || 'Loading...',
            // href: '',
            isLast: true,
        },
    ]

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

        const url = `/admin/moduleChapter/students/chapter_id${params.videoId}?searchStudent=${encodeURIComponent(query)}&limit=10&offset=0`
        const response = await api.get(url)

        const students = response.data.submittedStudents || []
        setDataTableVideo(students)
        setVideoData(response.data.moduleVideochapter)

        setLoading(false)
    }, [params.videoId])

    const defaultFetchApi = useCallback(async () => {
        setLoading(true)

        const url = `/admin/moduleChapter/students/chapter_id${params.videoId}`
        const response = await api.get(url)

        const students = response.data.submittedStudents || []
        setDataTableVideo(students)
        setVideoData(response.data.moduleVideochapter)

        setLoading(false)
    }, [params.videoId])

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
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {videoData?.title || 'Loading...'}
                    </h1>

                    {/* Stats cards */}
                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {videoData?.totalStudents || 0}
                            </h1>
                            <p className="text-gray-500">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {videoData?.totalSubmittedStudents || 0}
                            </h1>
                            <p className="text-gray-500">Watched Entire Video</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {((videoData?.totalStudents || 0) - (videoData?.totalSubmittedStudents || 0)).toString()}
                            </h1>
                            <p className="text-gray-500">Not Yet Watched</p>
                        </div>
                    </div>
                    <div className="relative w-1/3" >
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

                    <DataTable data={dataTableVideo} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
