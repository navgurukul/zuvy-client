'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import {BootcampData,PageParams,IndividualStudentData} from "@/app/admin/courses/[courseId]/submissionAssignments/[assignmentData]/individualStatus/IndividualStatusType"
const Page = ({ params }: PageParams) => {
    const [individualStudentData, setIndividualStudentData] = useState<IndividualStudentData | null>(null);
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [assignmentTitle, setAssignmentTItle] = useState<string>('')
    const [initialContent, setInitialContent] = useState()

    const [url, setUrl] = useState<string>('')
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
            href: `/admin/courses/${params.courseId}/submissionAssignments/${params.assignmentData}`,
            isLast: false,
        },
        {
            crumb: individualStudentData?.user?.name,
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

    useEffect(() => {
        const fetchIndividualStudentStatus = async () => {
            try {
                const res = await api.get(
                    `/submission/getAssignmentDetailForAUser?chapterId=${params.assignmentData}&userId=${params.individualStatus}`
                )

                const data = res?.data?.data
                if (data) {
                    const chapterTrackingDetails: IndividualStudentData =
                        data.chapterTrackingDetails?.[0]
                    const articleContent = data.articleContent?.[0]

                    if (chapterTrackingDetails && articleContent) {
                        setIndividualStudentData(chapterTrackingDetails)
                        setInitialContent(JSON.parse(articleContent))

                        const projectUrl =
                            chapterTrackingDetails.user?.studentAssignmentStatus
                                ?.projectUrl
                        if (projectUrl) {
                            setUrl(projectUrl)
                        }

                        setAssignmentTItle(data.title)
                    } else {
                        console.error('Incomplete data received')
                    }
                } else {
                    throw new Error('No data found')
                }
            } catch (error: any) {
                toast.error({
                    title: 'Error',
                    description:
                        error.message || 'Error fetching Student Details',
                })
            }
        }

        fetchIndividualStudentStatus()
        getBootcampHandler()
    }, [
        params.assignmentData,
        params.individualStatus,
        getBootcampHandler,
    ])

    const dateString = individualStudentData?.completedAt
    const date = new Date(dateString?.toString())
    const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]
    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ]

    const dayOfWeek = dayNames[date.getUTCDay()]
    const day = date.getUTCDate()
    const month = monthNames[date.getUTCMonth()]
    const year = date.getUTCFullYear()

    const formattedDate = `${dayOfWeek} ${day} ${month} ${year}`
    // const url = individualStudentData?.user?.studentAssignmentStatus?.projectUrl

    return (
        <>
            {individualStudentData ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    </div>
                </div>
            )}
            <MaxWidthWrapper className="flex flex-col gap-5 text-gray-600">
                <div className="flex  items-center gap-x-3">
                    <div className="flex flex-col gap-x-2">
                        <div className="flex gap-x-4 my-4 ">
                            <Avatar className="h-14 w-14">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-left font-semibold text-[15px]">
                                    Submission Report by :{' '}
                                    {individualStudentData
                                        ? individualStudentData?.user?.name
                                        : ''}{' '}
                                </h1>
                                <h1 className="text-left font-semibold text-[15px]">
                                    Email:{' '}
                                    {individualStudentData
                                        ? individualStudentData?.user?.email
                                        : ''}{' '}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-10 mx-8">
                    <h1 className="text-left font-semibold text-[19px]">
                        Overview
                    </h1>
                    <div>
                        <h1 className="text-left font-semibold text-[15px]">
                            Title: {assignmentTitle}
                        </h1>
                        <div className="flex flex-col ">
                            <div className="my-2 flex flex-col gap-y-2 text-left ">
                                <div className="flex gap-x-3">
                                    <h1 className="font-semibold text-[15px]">
                                        Status: {individualStudentData?.status}
                                    </h1>
                                </div>
                                <h1 className="text-left font-semibold text-[15px]">
                                    Completed At: {formattedDate}
                                </h1>
                            </div>
                            <div className="text-left flex font-semibold gap-x-2 text-[15px]">
                                <h1 className="text-[15px]">Assignment Link:</h1>
                                <Link
                                    target="_blank"
                                    className="hover:text-blue-400 hover:underline "
                                    href={url}
                                >
                                    {url}
                                </Link>
                            </div>
                            <h1 className="text-left my-2 font-semibold text-[15px]">
                                Assignment Description:
                            </h1>
                            <div className="mt-2 text-start">
                                <RemirrorTextEditor
                                    initialContent={initialContent}
                                    setInitialContent={setInitialContent}
                                    preview={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
