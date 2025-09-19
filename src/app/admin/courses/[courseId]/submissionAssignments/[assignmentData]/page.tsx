'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
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
            crumb: 'Submission - Assignments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assignmentTitle,
            isLast: true,
        },
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
        // try {
        const res = await api.get(`/submission/assignmentStatus?chapterId=${params.assignmentData}&searchStudent=${encodeURIComponent(query)}`)
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
    }, [params.assignmentData])

    const defaultFetchApi = useCallback(async () => {
        const res = await api.get(`/submission/assignmentStatus?chapterId=${params.assignmentData}&limit=100&offset=0`)
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
    }, [params.assignmentData])

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

    const totalStudents = bootcampData?.students_in_bootcamp - bootcampData?.unassigned_students

    return (
        <>
            {assignmentData ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {assignmentTitle}
                    </h1>

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {submittedStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received:
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents - submittedStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Not Yet Submitted
                            </p>
                        </div>
                    </div>
                    <div className="relative w-1/3">
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
                    <DataTable data={assignmentData} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page