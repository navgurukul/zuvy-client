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
import { toast } from '@/components/ui/use-toast'

type Props = {}

const Page = ({ params }: any) => {
    const moduleId =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('moduleId')
    const [assesmentData, setAssesmentData] = useState<any>()
    const [studentStatus, setStudentStatus] = useState<any>()
    const [totalSubmission, setTotalSubmission] = useState<any>()
    const [notSubmitted, setNotSubmitted] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
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

    const getStudentFormDataHandler = useCallback(async () => {
        await api
            .get(
                `submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}`
            )
            .then((res) => {
                const data = res.data.combinedData.map((student: any) => {
                    return {
                        ...student,
                        bootcampId: params.courseId,
                        moduleId: res.data.moduleId,
                        chapterId: res.data.chapterId,
                        userId: student.id,
                        email: student.emailId,
                    }
                })
                const submitted = res.data.combinedData.filter(
                    (student: any) => student.status === 'Submitted'
                )
                const notSubmitted = res.data.combinedData.filter(
                    (student: any) => student.status !== 'Submitted'
                )
                setStudentStatus(data)
                setTotalSubmission(submitted)
                setNotSubmitted(notSubmitted)
            })
            .catch((err) => {
                // toast({
                //     title: 'Error',
                //     description: 'Error fetching Submissions:',
                //     className:
                //         'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                // })
            })

        await api
            .get(`/tracking/getChapterDetailsWithStatus/${params.StudentForm}`)
            .then((res) => {
                setChapterDetails(res.data.trackingData)
            })
            .catch((err) => {
                toast.error({
                    title: 'Error',
                    description: 'Error fetching Chapter details:',
                })
            })
    }, [params.StudentAssesmentData, moduleId])

    useEffect(() => {
        getStudentFormDataHandler()
        getBootcampHandler()
    }, [getStudentFormDataHandler, getBootcampHandler])

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

                    {studentStatus ? (
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
                            className="w-1/3 my-6 input-with-icon pl-8" // Add left padding for the icon
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                    </div>
                    {studentStatus && (
                        <DataTable data={studentStatus} columns={columns} />
                    )}
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
