'use client'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'

type Props = {}

const Page = ({ params }: any) => {
    const [individualStudentData, setIndividualStudentData] = useState<any>({})
    const [url, setUrl] = useState<string>('')

    useEffect(() => {
        const fetchIndividualStudentStatus = async () => {
            try {
                await api
                    .get(
                        `/submission/getAssignmentDetailForAUser?chapterId=${params.assignmentData}&userId=${params.individualStatus}`
                    )
                    .then((res) => {
                        setIndividualStudentData(
                            res.data.data.chapterTrackingDetails[0]
                        )
                        setUrl(
                            res.data.data.chapterTrackingDetails[0].user
                                .studentAssignmentStatus.projectUrl
                        )
                    })
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Error fetching in Student Details',
                })
            }
        }
        fetchIndividualStudentStatus()
    }, [params.assignmentData, params.individualStatus])

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
    // console.log(url)

    return (
        <MaxWidthWrapper className="flex flex-col gap-5">
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
                            <h1 className="text-left font-semibold text-lg">
                                {individualStudentData
                                    ? individualStudentData?.user?.name
                                    : ''}{' '}
                                : Submission Report
                            </h1>
                            <h1 className="text-left font-semibold text-lg">
                                Email:{' '}
                                {individualStudentData
                                    ? individualStudentData?.user?.email
                                    : ''}{' '}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className="text-left font-semibold text-[20px]">Overview</h1>

            <div className="text-left flex font-semibold gap-x-2">
                <h1>Assignment Link:-</h1>
                <Link href={url}>Project Link</Link>
            </div>

            <div className="my-5 flex flex-col gap-y-3 text-left ">
                <h1 className="text-left font-semibold">
                    Completed At: {formattedDate}
                </h1>

                <div>
                    <div
                        className="flex gap-x-3
                                "
                    >
                        <h1 className="text-left font-semibold capitalize ">
                            {/* "{index + 1}. {question}" */}
                        </h1>
                        <h1 className={`text-left font-semibold capitalize `}>
                            {/* {difficulty} */}
                        </h1>
                    </div>
                    <div className="flex gap-x-3">
                        <h1 className="font-semibold">
                            Status: {individualStudentData?.status}
                        </h1>
                    </div>
                </div>
            </div>
        </MaxWidthWrapper>
    )
}

export default Page
