'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import {PageParams,BootcampData,IndividualStudentData} from "@/app/admin/courses/[courseId]/submissionProjects/[StudentsProjects]/IndividualReport/IndividualReportPageType"
const Page = ({ params }: PageParams) => {
    const [indiviDualStudentData, setIndividualStudentData] = useState<IndividualStudentData | null>(null)
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [submittedDate, setSubmittedDate] = useState<string | undefined>()
    const [initialContent, setInitialContent] = useState()

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
            crumb: indiviDualStudentData?.projectSubmissionDetails?.title,
            href: `/admin/courses/${params.courseId}/submissionProjects/${params.StudentsProjects}`,
            isLast: false,
        },
        {
            crumb: indiviDualStudentData?.projectSubmissionDetails
                ?.projectTrackingData[0].userDetails.name,
            isLast: true,
        },
    ]

    const getIndividualStudentData = useCallback(async () => {
        await api
            .get(
                `/submission/projectDetail/${params.individualReport}?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}`
            )
            .then((res) => {
                setIndividualStudentData(res?.data)
                const projectDetail =
                    res?.data?.projectSubmissionDetails?.instruction
                        ?.description
                if (projectDetail) {
                    setInitialContent(JSON.parse(projectDetail))
                }
                setSubmittedDate(
                    res?.data.projectSubmissionDetails?.projectTrackingData[0]
                        ?.updatedAt
                )
            })
    }, [params.individualReport, params.courseId, params.StudentsProjects])
    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    useEffect(() => {
        getIndividualStudentData()
        getBootcampHandler()
    }, [getIndividualStudentData, getBootcampHandler])

    const dateString = submittedDate
    const date = new Date((dateString ?? "").toString())
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

    if (indiviDualStudentData) {
        return (
            <>
                <BreadcrumbComponent crumbs={crumbs} />
                <MaxWidthWrapper>
                    <div className="flex text-gray-600 items-center gap-x-3">
                        <div className="flex flex-col gap-x-2">
                            <div className="flex gap-x-4 my-4">
                                <Avatar>
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <h1 className="text-left font-semibold text-lg">
                                        {
                                            indiviDualStudentData
                                                ?.projectSubmissionDetails
                                                ?.projectTrackingData[0]
                                                .userDetails.name
                                        }
                                    </h1>
                                    <h3 className="text-left font-semibold text-[15px]">
                                        Individual Report
                                    </h3>
                                    <h3 className="text-left font-semibold text-[15px]">
                                        Submitted on {formattedDate}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 text-gray-600">
                        <div className="p-4 bg-white rounded shadow">
                            <h2 className="text-lg text-left font-bold mb-2">
                                Title:-{' '}
                                {
                                    indiviDualStudentData
                                        ?.projectSubmissionDetails?.title
                                }
                            </h2>
                            <div></div>
                            <div className="w-full flex flex-col flex-start">
                                <h3 className="text-[15px]  font-semibold text-left  mb-2">
                                    Problem Description:
                                </h3>

                                <div className="mt-2 text-start">
                                    <RemirrorTextEditor
                                        initialContent={initialContent}
                                        setInitialContent={setInitialContent}
                                        preview={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col gap-y-1 bg-white rounded shadow">
                            <h2 className="text-[15px] text-left font-bold mb-2">
                                Project Link
                            </h2>
                            <Link
                                href={`${indiviDualStudentData?.projectSubmissionDetails?.projectTrackingData[0].projectLink}`}
                                className="text-blue-600 text-left hover:underline"
                                target="_blank"
                            >
                                <h2 className="text-left  text-[15px]">
                                    {
                                        indiviDualStudentData
                                            ?.projectSubmissionDetails
                                            ?.projectTrackingData[0].projectLink
                                    }
                                </h2>
                            </Link>
                        </div>
                    </div>
                </MaxWidthWrapper>
            </>
        )
    }
}
export default Page
