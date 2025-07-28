'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'

type Props = {}

const Page = ({ params }: any) => {
    const searchParams = useSearchParams()
    const moduleId =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('moduleId')
    
    const [assesmentData, setAssesmentData] = useState<any>()
    const [studentStatus, setStudentStatus] = useState<any>()
    const [totalSubmission, setTotalSubmission] = useState<any>()
    const [notSubmitted, setNotSubmitted] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [loading, setLoading] = useState(false)

    // Get pagination params from URL
    const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams])
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const offset = useMemo(() => (currentPage - 1) * +position, [currentPage, position])

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
            crumb: 'Submission - Forms',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: chapterDetails?.title,
            href: '',
            isLast: true,
        },
    ]

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching bootcamps:',
            })
        }
    }, [params.courseId])

    const getChapterDetails = useCallback(async () => {
        try {
            const res = await api.get(`/tracking/getChapterDetailsWithStatus/${params.StudentForm}`)
            setChapterDetails(res.data.trackingData)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching Chapter details:',
            })
        }
    }, [params.StudentForm])

    const getStudentFormDataHandler = useCallback(async (customOffset?: number) => {
        if (!moduleId) return
        
        setLoading(true)
        const currentOffset = customOffset !== undefined ? customOffset : offset
        
        // Fix URL construction - remove the "1" before position
        let url = `/submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&limit=${position}&offset=${currentOffset}`
        
        try {
            const response = await api.get(url)
            const data = response.data.combinedData.map((student: any) => {
                return {
                    ...student,
                    bootcampId: params.courseId,
                    moduleId: response.data.moduleId,
                    chapterId: response.data.chapterId,
                    userId: student.id,
                    email: student.emailId,
                }
            })
            
            const submitted = response.data.combinedData.filter(
                (student: any) => student.status === 'Submitted'
            )
            const notSubmitted = response.data.combinedData.filter(
                (student: any) => student.status !== 'Submitted'
            )
            
            setStudentStatus(data)
            setTotalSubmission(submitted)
            setNotSubmitted(notSubmitted)
            setTotalStudents(response.data.totalStudentsCount)
            setPages(response.data.totalPages)
            setLastPage(response.data.totalPages)            
        } catch (error) {
            console.error('Error fetching courses:', error)
            toast.error({
                title: 'Error',
                description: 'Error fetching student data',
            })
        } finally {
            setLoading(false)
        }
    }, [params.courseId, params.StudentForm, moduleId, position, offset])

    // Separate useEffect for initial data that doesn't depend on pagination
    useEffect(() => {
        getBootcampHandler()
        getChapterDetails()
    }, [getBootcampHandler, getChapterDetails])

    // Separate useEffect for pagination-dependent data
    useEffect(() => {
        if (moduleId) {
            getStudentFormDataHandler()
        }
    }, [currentPage, position, moduleId]) // Remove getStudentFormDataHandler from deps

    return (
        <>
            {chapterDetails ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {chapterDetails?.title}
                    </h1>

                    {studentStatus && !loading ? (
                        <div className="text-start flex gap-x-3">
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {studentStatus?.length}
                                </h1>
                                <p className="text-gray-500 ">Total Students</p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {totalSubmission?.length}
                                </h1>
                                <p className="text-gray-500 ">
                                    Submissions Received
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {notSubmitted?.length}
                                </h1>
                                <p className="text-gray-500 ">
                                    Not Yet Submitted
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-x-20  ">
                            <div className="gap-y-4">
                                <Skeleton className="h-4 my-3 w-[300px]" />
                                <div className="space-y-2 ">
                                    <Skeleton className="h-[125px] w-[600px] rounded-xl" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        <Input
                            placeholder="Search for Name, Email"
                            className="w-1/3 my-6 input-with-icon pl-8"
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                    </div>
                    {studentStatus && (
                        <DataTable data={studentStatus} columns={columns} />
                    )}
                </div>
                <DataTablePagination
                    totalStudents={totalStudents}
                    lastPage={lastPage}
                    pages={pages}
                    fetchStudentData={getStudentFormDataHandler}
                />
            </MaxWidthWrapper>
        </>
    )
}

export default Page