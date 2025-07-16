'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { title } from 'process'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'

type Props = {}

const assesmentData = {
    title: 'Random Tile',
    totalStudents: 90,
    totalSubmitedStudents: 67,
}

const Page = ({ params }: { params: any }) => {
    const [assignmentData, setAssignmentData] = useState([])
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
            // href: '',
            isLast: true,
        },
    ]

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {}
    }, [params.courseId])

    const fetchAssignmentDataHandler = useCallback(async () => {
        try {
            await api
                .get(
                    `/submission/assignmentStatus?chapterId=${params.assignmentData}&limit=5&offset=0`
                )
                .then((res) => {
                    const assignmentData: any = res?.data?.data
                    const chapterId = assignmentData?.chapterId
                    assignmentData.data.forEach((data: any) => {
                        data.chapterId = chapterId
                    })
                    setAssignmentData(assignmentData.data)
                    setSubmittedStudents(res?.data?.data?.data.length)
                    setAssignmentTitle(res?.data?.data?.chapterName)
                })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error Fetching Assignment Data',
            })
        } finally {
        }
    }, [params.assignmentData])

    useEffect(() => {
        Promise.all([getBootcampHandler(), fetchAssignmentDataHandler()])
    }, [getBootcampHandler, fetchAssignmentDataHandler])

    const totalStudents =
        bootcampData?.students_in_bootcamp - bootcampData?.unassigned_students

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

                    {assesmentData ? (
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
                            className="w-1/3 my-6 input-with-icon pl-8" // Add left padding for the icon
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                    </div>
                    <DataTable data={assignmentData} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
