'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import {PageParams,BootcampData,IndividualStudentData,ProjectSubmissionDetails} from "@/app/admin/courses/[courseId]/submissionProjects/[StudentsProjects]/IndividualReport/IndividualReportPageType"

const Page = ({ params }: PageParams) => {
    const router = useRouter()
    const [indiviDualStudentData, setIndividualStudentData] = useState<IndividualStudentData | null>(null)
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [submittedDate, setSubmittedDate] = useState<string>('')
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
            .get<ProjectSubmissionDetails>(
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
            const res = await api.get<{ bootcamp: BootcampData}>(`/bootcamp/${params.courseId}`)
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

    if (indiviDualStudentData) {
        return (
            <div className="min-h-screen font-semibold bg-background">
                <BreadcrumbComponent crumbs={crumbs} />
                
                {/* Back Button */}
                <MaxWidthWrapper>
                   <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}                        
                            className="hover:underline text-primary hover:text-primary hover:bg-transparent transition-colors"
                            >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span  className="font-semibold" >Back to Projects Submission</span>
                        </Button>
                     </div>
                </MaxWidthWrapper>
                
                <MaxWidthWrapper>
                    <div className="space-y-8">
                        {/* Student Info Card */}
                        <div className="bg-card border border-border rounded-lg p-8">
                            <div className="flex items-start space-x-8">
                                <Avatar className="w-24 h-24 flex-shrink-0">
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="@shadcn"
                                    />
                                    <AvatarFallback className="text-xl font-semibold">CN</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h1 className="text-2xl text-left font-heading font-bold text-foreground">
                                            {indiviDualStudentData?.projectSubmissionDetails?.projectTrackingData[0].userDetails.name}
                                        </h1>
                                        <p className="text-left text-muted-foreground font-semibold text-lg mt-2">
                                            Individual Report
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-left text-muted-foreground">Project Title</p>
                                            <h2 className="text-left text-sm font-medium mt-1">
                                                {indiviDualStudentData?.projectSubmissionDetails?.title}
                                            </h2>
                                        </div>
                                        <div>
                                            <p className="text-sm text-left text-muted-foreground">Submitted Date</p>
                                            <p className="text-sm text-left font-medium mt-1">
                                                {formattedDate}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Content */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-heading text-left font-semibold">Problem Description</h3>
                            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                                <div className="prose prose-neutral max-w-none text-left">
                                    <div className="min-h-[200px]">
                                        <RemirrorTextEditor
                                            initialContent={initialContent}
                                            setInitialContent={setInitialContent}
                                            preview={true}
                                            hideBorder={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Link */}
                        <div className="space-y-6 pb-8">
                            <h3 className="text-xl font-heading text-left font-semibold">Project Link</h3>
                            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                                <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                                    <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    <Link
                                        href={`${indiviDualStudentData?.projectSubmissionDetails?.projectTrackingData[0].projectLink}`}
                                        className="text-primary text-left hover:underline font-semibold break-all text-base"
                                        target="_blank"
                                    >
                                        {indiviDualStudentData?.projectSubmissionDetails?.projectTrackingData[0].projectLink}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </MaxWidthWrapper>
            </div>
        )
    }

    return null
}

export default Page