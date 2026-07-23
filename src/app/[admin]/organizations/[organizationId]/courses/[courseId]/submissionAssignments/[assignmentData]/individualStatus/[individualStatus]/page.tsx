'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BookOpen,
    Clock,
    AlertCircle,
    Link as LinkIcon,
    FileText,
    ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import {
    PageParams,
    IndividualStudentData,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionAssignments/[assignmentData]/individualStatus/IndividualStatusType'
import { useCourseExistenceCheck } from '@/app/[admin]/hooks/useCourseExistenceCheck'
import useAssignmentDetailForAUser from '@/app/[admin]/hooks/useAssignmentDetailForAUser'
import { normalizeLinks } from '@/utils/admin'

const Page = ({ params }: PageParams) => {
    const router = useRouter()
    const [individualStudentData, setIndividualStudentData] =
        useState<IndividualStudentData | null>(null)
    useCourseExistenceCheck(params.courseId)
    const [assignmentTitle, setAssignmentTItle] = useState<string>('')
    const [initialContent, setInitialContent] = useState()

    const [urls, setUrls] = useState<string[]>([])
    const {
        data: assignmentDetail,
        loading,
        error,
    } = useAssignmentDetailForAUser({
        chapterId: params.assignmentData,
        userId: params.individualStatus,
    })

    useEffect(() => {
        if (error) {
            toast.error({
                title: 'Error',
                description: error,
            })
        }
    }, [error])

    useEffect(() => {
        if (!assignmentDetail) return

        try {
            const chapterTrackingDetails: IndividualStudentData =
                assignmentDetail.chapterTrackingDetails?.[0]
            const articleContent = assignmentDetail.articleContent?.[0]

            if (chapterTrackingDetails && articleContent) {
                setIndividualStudentData(chapterTrackingDetails)
                setInitialContent(JSON.parse(articleContent))

                const projectUrl =
                    chapterTrackingDetails.user?.studentAssignmentStatus
                        ?.projectUrl
                if (projectUrl) {
                    setUrls(normalizeLinks(projectUrl))
                }

                setAssignmentTItle(assignmentDetail.title)
            } else {
                console.error('Incomplete data received')
                toast.error({
                    title: 'Error',
                    description: 'Incomplete data received',
                })
            }
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description: error.message || 'Error fetching Student Details',
            })
        }
    }, [assignmentDetail])

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
            {loading && !individualStudentData && (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    </div>
                </div>
            )}
            <MaxWidthWrapper className="flex flex-col gap-5 text-gray-600">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Submissions
                    </Button>
                </div>
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-muted/20 dark:to-muted/10 border border-border rounded-2xl shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-x-4 p-6">
                        <Avatar className="h-14 w-14 shadow-md ring-2 ring-muted-foreground/20">
                            <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                            />
                            <AvatarFallback className="font-bold bg-muted text-lg">
                                CN
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <CardTitle className="text-2xl font-bold">
                                {' '}
                                {individualStudentData
                                    ? individualStudentData?.user?.name
                                    : ''}{' '}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                {' '}
                                {individualStudentData
                                    ? individualStudentData?.user?.email
                                    : ''}{' '}
                            </p>
                        </div>
                    </CardHeader>
                </Card>
                <h2 className="text-left text-lg font-semibold mt-6">
                    Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-0">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">
                                    Title
                                </h3>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {assignmentTitle || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2 uppercase tracking-wide">
                                    Status
                                </h3>
                                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                                    {individualStudentData?.status || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 uppercase tracking-wide">
                                    Completed At
                                </h3>
                                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                    {formattedDate || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                            <LinkIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2 uppercase tracking-wide">
                                Assignment Link
                            </h3>
                            {urls.length > 0 ? (
                                <div className="space-y-2">
                                    {urls.map((url, index) => (
                                        <Link
                                            key={`${url}-${index}`}
                                            href={url}
                                            target="_blank"
                                            className="block text-sm text-purple-900 dark:text-purple-100 hover:underline break-all font-medium"
                                        >
                                            {url}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-purple-900 dark:text-purple-100">
                                    N/A
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-muted/20 dark:to-muted/10 rounded-2xl p-6 border border-border mb-4 mt-4">
                    <div className="flex items-start gap-4">
                        <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />

                        <div className="flex-1 space-y-3 text-left">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                                Assignment Description
                            </h3>
                            <div className="bg-white rounded-md shadow-sm border border-border">
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

