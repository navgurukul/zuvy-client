'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Skeleton } from '@nextui-org/react'

type Props = {}

const Page = ({ params }: any) => {
    const [data, setData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [projectStudentData, setProjectStudentData] = useState<any>([])
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
            crumb: 'Submission - Projects',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: data?.projectData[0].title,
            isLast: true,
        },
    ]

    const getProjectsData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfProjects/${params.courseId}`
            )
            setData(res.data.data.bootcampModules[0])
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.log(error)
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

    const getProjectsStudentData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}`
            )
            setProjectStudentData(
                res.data.projectSubmissionData.projectTrackingData
            )
        } catch (error) {}
    }, [params.courseId, params.StudentsProjects])

    useEffect(() => {
        getProjectsData()
        getProjectsStudentData()
        getBootcampHandler()
    }, [getProjectsData, getProjectsStudentData, getBootcampHandler])
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
                        <h1 className="text-start text-xl font-bold capitalize text-primary">
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
                                {(
                                    totalStudents -
                                    data?.projectData[0].submitStudents
                                ).toString()}
                            </h1>
                            <p className="text-gray-500 ">Not Yet Submitted</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Input
                            placeholder="Search for Name, Email asdasdasd"
                            className="w-1/3 my-6 input-with-icon pl-8" // Add left padding for the icon
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                    </div>
                    <DataTable data={projectStudentData} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
