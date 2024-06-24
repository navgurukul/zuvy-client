'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import ShowMore from '../../../../_components/descriptionHandler'

type Props = {}

const Page = ({ params }: any) => {
    const [indiviDualStudentData, setIndividualStudentData] = useState<any>([])
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
                setIndividualStudentData(res.data)
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

    if (indiviDualStudentData) {
        return (
            <>
                <BreadcrumbComponent crumbs={crumbs} />
                <MaxWidthWrapper>
                    <div className="flex  items-center gap-x-3">
                        <div className="flex flex-col gap-x-2">
                            <div className="flex gap-x-4 my-4 ">
                                <Avatar>
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <h1 className="text-left font-semibold text-lg">
                                    {
                                        indiviDualStudentData
                                            ?.projectSubmissionDetails
                                            ?.projectTrackingData[0].userDetails
                                            .name
                                    }
                                    - Individual Report
                                </h1>
                            </div>
                            <div>
                                <h3 className="text-left">
                                    Submitted on 12 April 2024
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                        <div className="p-4 bg-white rounded shadow">
                            <h2 className="text-xl text-left font-bold mb-2">
                                {
                                    indiviDualStudentData
                                        ?.projectSubmissionDetails?.title
                                }
                            </h2>
                            <h3 className="text-md text-left  mb-2">
                                Problem Statement:
                            </h3>
                            <div className="w-full flex flex-start">
                                <ShowMore
                                    description={
                                        indiviDualStudentData
                                            ? indiviDualStudentData
                                                  ?.projectSubmissionDetails
                                                  ?.instruction.description
                                            : ''
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-4 flex flex-col gap-y-3 bg-white rounded shadow">
                            <h2 className="text-lg text-left font-bold mb-2">
                                Github Link
                            </h2>
                            <Link
                                href={`${indiviDualStudentData?.projectSubmissionDetails?.projectTrackingData[0].projectLink}`}
                                className="text-blue-600 text-left"
                            >
                                <h2 className="text-left">
                                    {
                                        indiviDualStudentData
                                            ?.projectSubmissionDetails
                                            ?.projectTrackingData[0].projectLink
                                    }
                                </h2>
                            </Link>
                            <h2 className="text-lg text-left font-bold mb-2">
                                Video Walkthrough
                            </h2>
                            <div className="">
                                <p>Video Walk through</p>
                            </div>
                            <h2 className="text-lg text-left font-bold mb-2">
                                Grading
                            </h2>
                        </div>
                    </div>
                </MaxWidthWrapper>
            </>
        )
    }
}

export default Page
