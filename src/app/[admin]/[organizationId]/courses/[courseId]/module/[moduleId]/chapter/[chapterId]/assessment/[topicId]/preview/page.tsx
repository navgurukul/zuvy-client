'use client'

import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { getUser } from '@/store/store'
import { getAssessmentPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { api } from '@/utils/axios.config'
import { AlertOctagon, ArrowLeft } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
    PriviewTag,
    Params,
} from '@/app/[admin]/[organizationId]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/assessment/[topicId]/preview/allquestions/PreviewPageType'

const PreviewAssessment = ({ params }: { params: Params }) => {
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]
    const { assessmentPreviewContent, setAssessmentPreviewContent } =
        getAssessmentPreviewStore()

    const router = useRouter()

    useEffect(() => {
        fetchPreviewData(params, setAssessmentPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    // Checking if there are any questions by their lengths
    const hasQuestions =
        assessmentPreviewContent?.CodingQuestions?.length > 0 ||
        assessmentPreviewContent?.Quizzes?.length > 0 ||
        assessmentPreviewContent?.OpenEndedQuestions?.length > 0

    function startPreviewAssessment() {
        router.push(
            `/${userRole}/${orgName}/courses/${params.courseId}/module/${params.moduleId}/chapter/${params.chapterId}/assessment/${params.topicId}/preview/allquestions`
        )
    }

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-[#FFFFFF]">
                    You are in the Admin Preview Mode. The questions cannot be
                    interacted with.
                </h1>
            </div>

            {/* Adjusted padding to align the content */}
            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                {/* "Go Back" button placed at the far left */}
                <Link
                    href={`/${userRole}/${orgName}/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                    className="absolute left-0 top-0 flex items-center space-x-2 p-4"
                >
                    {' '}
                    {/* Absolute positioning */}
                    <ArrowLeft size={20} />
                    <p className="ml-1 text-sm font-medium text-gray-800">
                        Go back
                    </p>
                </Link>
                <div className="flex flex-col gap-4 text-left w-full max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {assessmentPreviewContent?.ModuleAssessment?.title}
                    </h1>
                    {hasQuestions ? (
                        <div className="flex gap-6">
                            {assessmentPreviewContent?.CodingQuestions?.length >
                                0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {
                                            assessmentPreviewContent
                                                ?.CodingQuestions.length
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Coding Challenges
                                    </p>
                                </div>
                            )}
                            {assessmentPreviewContent?.Quizzes?.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {
                                            assessmentPreviewContent?.Quizzes
                                                .length
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        MCQs
                                    </p>
                                </div>
                            )}
                            {assessmentPreviewContent?.OpenEndedQuestions
                                ?.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {
                                            assessmentPreviewContent
                                                ?.OpenEndedQuestions.length
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Open-Ended
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {
                        <div className="my-2 w-full max-w-2xl mx-auto text-gray-600">
                            {!hasQuestions && (
                                <p className="mb-2 font-medium">
                                    No Questions Available. Assessment will
                                    appear soon!
                                </p>
                            )}

                            <div>
                                <div className="flex items-center gap-2">
                                    <AlertOctagon
                                        size={16}
                                        className="text-destructive"
                                    />
                                    <p className="text-[16px]">
                                        Do not change tabs or assessment will
                                        get submitted automatically.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertOctagon
                                        size={16}
                                        className="text-destructive"
                                    />
                                    <p className="text-[16px]">
                                        Do not close the browser during the
                                        assessment or it will get submitted
                                        automatically.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertOctagon
                                        size={16}
                                        className="text-destructive"
                                    />
                                    <p className="text-[16px]">
                                        MCQs & Open-ended Questions can be
                                        submitted only once.
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center">
                {
                    <>
                        {hasQuestions && (
                            <Button onClick={startPreviewAssessment}>
                                Start Preview Assessment
                            </Button>
                        )}
                    </>
                }
            </div>
        </>
    )
}

export default PreviewAssessment
