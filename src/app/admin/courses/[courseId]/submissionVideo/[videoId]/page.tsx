'use client'

// External imports
import React, { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'

// Internal imports
import { Input } from '@/components/ui/input'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import useDebounce from '@/hooks/useDebounce'

type Props = {}

const Page = ({ params }: any) => {
    const [videoData, setVideoData] = useState<any>()
    const [searchStudentAssessment, setSearchStudentAssessment] =
        useState<any>('')
    const debouncedSearch = useDebounce(searchStudentAssessment, 400)
    const [dataTableVideo, setDataTableVideo] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()

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
            crumb: 'Video Chapter Completed',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: videoData?.title,
            // href: '',
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

    const getStudentVideoDataHandler = useCallback(async () => {
        try {
            const endpoint = debouncedSearch
                ? `admin/moduleChapter/students/chapter_id${params.videoId}?searchStudent=${debouncedSearch}`
                : `admin/moduleChapter/students/chapter_id${params.videoId}`

            const res = await api.get(endpoint)
            setVideoData(res.data.moduleVideochapter)
            setDataTableVideo(res.data.submittedStudents)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.videoId, debouncedSearch])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getStudentVideoDataHandler(),
                    getBootcampHandler(),
                ])
            } catch (error) {
                console.error('Error in fetching data:', error)
            }
        }

        fetchData()
    }, [getStudentVideoDataHandler, getBootcampHandler])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {videoData?.title}
                    </h1>

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {videoData?.totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {videoData?.totalSubmittedStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Watched Entire Video
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {(
                                    videoData?.totalStudents -
                                    videoData?.totalSubmittedStudents
                                ).toString()}
                            </h1>
                            <p className="text-gray-500 ">Not Yet Watched</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Input
                            placeholder="Search for Student"
                            className="w-1/3 my-6 input-with-icon pl-8"
                            value={searchStudentAssessment}
                            onChange={(e) =>
                                setSearchStudentAssessment(e.target.value)
                            }
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                    </div>
                    <DataTable data={dataTableVideo} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
