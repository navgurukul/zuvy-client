'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {}

const Page = ({ params }: any) => {
    const [assesmentData, setAssesmentData] = useState<any>()

    // const [dataTableAssesment, setDataTableAssesments] = useState<any>([])
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
            crumb: 'Submission - Assesments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assesmentData?.title,
            // href: '',
            isLast: false,
        },
    ]

    const dataTableAssesment = [
        {
            email: 'poonambagh@gmail.com',
            name: 'Poonam Bagh',
            userId: 1,
            batchId: 101,
            bootcampId: 202,
            profilePicture: null, // or a valid URL string
            progress: 75,
            batchName: 'Batch A',
            attendance: 85,
            status: 'Active',
            noOfAttempts: 3,
            isChecked: true,
            userEmail: 'poonambagh@gmail.com',
            projectId: 303,
            id: 404,
            userName: 'Poonam Bagh',
            newId: 505,
        },
        {
            email: 'johndoe@example.com',
            name: 'John Doe',
            userId: 2,
            batchId: 102,
            bootcampId: 203,
            profilePicture: 'https://example.com/profile.jpg',
            progress: 50,
            batchName: 'Batch B',
            attendance: 90,
            status: 'Pending',
            noOfAttempts: 2,
            isChecked: false,
            userEmail: 'johndoe@example.com',
            projectId: 304,
            id: 405,
            userName: 'John Doe',
            newId: 506,
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
    const getStudentAssesmentDataHandler = useCallback(async () => {
        await api
            .get(
                `/admin/assessment/students/assessment_id${params.StudentAssesmentData}`
            )
            .then((res) => {
                setAssesmentData(res.data.ModuleAssessment)
                const data = res.data
                data.submitedOutsourseAssessments =
                    data.submitedOutsourseAssessments.map((assessment: any) => {
                        return {
                            ...assessment,
                            bootcampId: data.bootcampId,
                            newId: data.id,
                        }
                    })
                // setDataTableAssesments(data.submitedOutsourseAssessments)
            })
    }, [params.StudentAssesmentData])

    useEffect(() => {
        getStudentAssesmentDataHandler()
        getBootcampHandler()
    }, [getStudentAssesmentDataHandler, getBootcampHandler])

    // console.log(dataTableAssesment)
    return (
        <>
            {assesmentData ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-primary">
                        {assesmentData?.title}
                    </h1>

                    {assesmentData ? (
                        <div className="text-start flex gap-x-3">
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalStudents}
                                </h1>
                                <p className="text-gray-500 ">Total Students</p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalSubmitedStudents}
                                </h1>
                                <p className="text-gray-500 ">
                                    Submissions Received YEEESSSS
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {(
                                        assesmentData?.totalStudents -
                                        assesmentData?.totalSubmitedStudents
                                    ).toString()}
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
                    <DataTable data={dataTableAssesment} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
