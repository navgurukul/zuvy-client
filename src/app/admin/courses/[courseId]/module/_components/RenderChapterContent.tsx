// renderChapterContent.tsx
import React from 'react'
import AddVideo from '@/app/admin/courses/[courseId]/module/_components/video/AddVideo'
import AddArticle from '@/app/admin/courses/[courseId]/module/_components/Article/AddArticle'
import CodingChallenge from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingChallenge'
import Quiz from '@/app/admin/courses/[courseId]/module/_components/quiz/Quiz'
import Assignment from '@/app/admin/courses/[courseId]/module/_components/assignment/Assignment'
import AddAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/AddAssessment'
import AddForm from '@/app/admin/courses/[courseId]/module/_components/form/AddForm'
import { Spinner } from '@/components/ui/spinner'

interface RenderChapterContentProps {
    topicId: number
    chapterId: number
    chapterContent: any
    moduleID: any
    activeChapterTitle: string
    loading: boolean
    fetchChapterContent: (chapterId: number, topicId: number) => any
}

export const renderChapterContent = ({
    topicId,
    chapterId,
    chapterContent,
    moduleID,
    activeChapterTitle,
    loading,
    fetchChapterContent,
}: RenderChapterContentProps) => {
    if (
        topicId &&
        chapterContent &&
        (chapterContent?.id === chapterId ||
            chapterContent?.chapterId === chapterId)
    ) {
        switch (topicId) {
            case 1:
                return (
                    <AddVideo
                        key={chapterId}
                        moduleId={moduleID}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                    />
                )
            case 2:
                return <AddArticle key={chapterId} content={chapterContent} />
            case 3:
                return (
                    <CodingChallenge
                        key={chapterId}
                        moduleId={moduleID}
                        content={chapterContent}
                        activeChapterTitle={activeChapterTitle}
                    />
                )
            case 4:
                return (
                    <Quiz
                        key={chapterId}
                        chapterId={chapterId}
                        moduleId={moduleID}
                        content={chapterContent}
                    />
                )
            case 5:
                return <Assignment key={chapterId} content={chapterContent} />
            case 6:
                return (
                    <AddAssessment
                        key={chapterId}
                        chapterData={chapterContent}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                        moduleId={moduleID}
                        topicId={topicId}
                    />
                )
            case 7:
                return (
                    <AddForm
                        key={chapterId}
                        chapterData={chapterContent}
                        content={chapterContent}
                        moduleId={moduleID}
                    />
                )
            default:
                return <h1>Create New Chapter</h1>
        }
    } else {
        return (
            <>
                {loading ? (
                    <div className="my-5 flex justify-center items-center">
                        <div className="absolute h-screen">
                            <div className="relative top-[70%]">
                                <Spinner className="text-secondary" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <h1>Create New Chapter</h1>
                )}
            </>
        )
    }
}
