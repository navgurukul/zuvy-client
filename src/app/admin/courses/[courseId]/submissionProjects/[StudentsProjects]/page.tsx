'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Skeleton } from '@nextui-org/react'
import { SearchBox } from '@/utils/searchBox' // Import your SearchBox component

type Props = {}

const Page = ({ params }: any) => {
    const [data, setData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [projectStudentData, setProjectStudentData] = useState<any[]>([])
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
            crumb: 'Submission - Projects',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: data?.projectData[0]?.title,
            isLast: true,
        },
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
            {data ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    {data ? (
                        <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                            {data?.projectData[0].title}
                        </h1>
                    ) : (
                        <Skeleton className="h-4 w-full" />
                    )}

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {data?.projectData[0].submitStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {data?.projectData[0]?.submitStudents ?
                                    (totalStudents - data.projectData[0].submitStudents).toString() :
                                    totalStudents.toString()
                                }
                            </h1>
                            <p className="text-gray-500 ">Not Yet Submitted</p>
                        </div>
                    </div>
                    <div className="relative w-1/3">
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
                    
                    <DataTable data={projectStudentData} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page