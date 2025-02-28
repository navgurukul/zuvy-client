'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fetchPreviewData } from '@/utils/admin'
import { ChevronRight, Clock, DoorClosed, Timer, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/utils/axios.config'
import { difficultyColor, cn, difficultyBgColor } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export type Tag = {
    id: number
    tagName: string
}

function AllQuestions({ params }: { params: any }) {
    const [assessmentPreviewContent, setAssessmentPreviewContent] =
        useState<any>([])
    const [assessmentPreviewCodingContent, setAssessmentPreviewCodingContent] =
        useState<any>([])
    const [allTags, setAllTags] = useState<Tag[]>([])
    const router = useRouter()

    useEffect(() => {
        fetchPreviewData(
            params,
            setAssessmentPreviewContent,
            setAssessmentPreviewCodingContent
        )
        fetchAllTags() // Fetch all tags when the component mounts
    }, [params.chapterId, fetchPreviewData])

    // Fetch all tags from the API
    async function fetchAllTags() {
        const response = await api.get('Content/allTags')
        if (response?.data?.allTags) {
            setAllTags(response.data.allTags)
        }
    }

    // Get the tag name by tag ID
    function getTagNameById(tagId: number | undefined) {
        const tag = allTags.find((tag) => tag.id === tagId)
        return tag ? tag.tagName : 'No Tag'
    }

    function solveCodingQuestion(codingQuestionId: any) {
        router.push(
            `/admin/courses/${params.courseId}/module/${params.moduleId}/chapter/${params.chapterId}/assessment/${params.topicId}/preview/allquestions/coding/${codingQuestionId}`
        )
    }

    function attemptQuizPreview() {
        router.push(
            `/admin/courses/${params.courseId}/module/${params.moduleId}/chapter/${params.chapterId}/assessment/${params.topicId}/preview/allquestions/mcq`
        )
    }

    function attemptOpenEndedPreview() {
        router.push(
            `/admin/courses/${params.courseId}/module/${params.moduleId}/chapter/${params.chapterId}/assessment/${params.topicId}/preview/allquestions/openended`
        )
    }

    return (
        <div className="h-auto mb-24">
            <>
                <div className="flex items-center justify-between gap-2">
                    <div
                        onClick={router.back}
                        className="font-bold text-sm cursor-pointer"
                    >
                        <X />
                    </div>
                    <div className="font-bold text-sm flex items-center gap-2">
                        <Timer /> Timer Not Started
                    </div>
                </div>
                <Separator className="my-6" />
            </>

            <div className="flex justify-center">
                <div className="flex flex-col gap-5 w-1/2 text-left">
                    <div className="flex justify-between">
                        <h2 className="font-bold">Testing Your Knowledge</h2>
                        {/* <Button onClick={shuffleQuestions}>
                            Shuffle Coding Qs
                        </Button> */}
                    </div>
                    <p className="deadline flex items-center gap-2">
                        <Clock size={18} />
                        Deadline:{' '}
                        {assessmentPreviewContent.deadline ||
                            'No Deadline For This Assessment'}
                    </p>
                    <p className="testTime flex items-center gap-2">
                        <Timer size={18} />
                        Test Time:{' '}
                        {Math.floor(
                            assessmentPreviewContent.timeLimit / 3600
                        )}{' '}
                        Hours{' '}
                        {Math.floor(
                            (assessmentPreviewContent.timeLimit % 3600) / 60
                        )}{' '}
                        Minutes
                    </p>
                    <p className="description">
                        All the problems i.e. coding challenges, MCQs, and
                        open-ended questions can be submitted only once.
                    </p>
                    <p className="description">
                        These questions will change for every user depending on
                        the randomization settings set by you
                    </p>
                </div>
            </div>

            {/* Coding Challenges Section */}
            {assessmentPreviewCodingContent?.length > 0 && (
                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                        <h2 className="font-bold">Coding Challenges</h2>
                        {assessmentPreviewCodingContent?.map(
                            (codingQuestion: any, index: number) => (
                                <div
                                    key={index}
                                    className="p-6 bg-white rounded-xl shadow-md"
                                >
                                    <div className="flex justify-between">
                                        <h3 className="font-bold capitalize">
                                            {codingQuestion.title}
                                        </h3>
                                        <span
                                            className={cn(
                                                `font-semibold text-secondary text-sm p-2 rounded-full`,
                                                difficultyColor(
                                                    codingQuestion.difficulty
                                                ),
                                                difficultyBgColor(
                                                    codingQuestion.difficulty
                                                )
                                            )}
                                        >
                                            {codingQuestion.difficulty}
                                        </span>
                                    </div>
                                    <p className="mt-2">
                                        {codingQuestion.description}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Tag:{' '}
                                        {getTagNameById(codingQuestion.tagId)}
                                    </p>
                                    <div
                                        onClick={() =>
                                            solveCodingQuestion(
                                                codingQuestion.id
                                            )
                                        }
                                        className="text-secondary justify-end flex items-center"
                                    >
                                        <p className="cursor-pointer">
                                            Solve Challenge
                                        </p>
                                        <ChevronRight
                                            className="cursor-pointer"
                                            size={18}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Quizzes Section */}
            {assessmentPreviewContent.Quizzes?.length > 0 && (
                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                        <h2 className="font-bold">MCQs</h2>
                        <div className="p-6 bg-white rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-bold capitalize">
                                    Multiple-Choice Questions (MCQs).
                                </h3>
                                <span className="bg-[#FFC374] text-sm p-2 rounded-full">
                                    {' '}
                                    {
                                        assessmentPreviewContent?.Quizzes
                                            ?.length
                                    }{' '}
                                    Questions
                                </span>
                            </div>
                            <div
                                onClick={attemptQuizPreview}
                                className="text-secondary justify-end flex items-center cursor-pointer"
                            >
                                <p>Attempt Quiz</p>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Open-Ended Questions Section */}
            {assessmentPreviewContent.OpenEndedQuestions?.length > 0 && (
                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                        <h2 className="font-bold">Open-Ended Questions</h2>
                        <div className="p-6 bg-white rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-bold capitalize">
                                    Open-Ended Questions.
                                </h3>
                                <span className="bg-[#FFC374] text-sm p-2 rounded-full">
                                    {
                                        assessmentPreviewContent
                                            .OpenEndedQuestions.length
                                    }{' '}
                                    Questions
                                </span>
                            </div>

                            <div
                                onClick={attemptOpenEndedPreview}
                                className="text-secondary justify-end flex items-center cursor-pointer"
                            >
                                <p>Attempt Questions</p>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AllQuestions
