'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import AddVideo from '@/app/admin/courses/[courseId]/module/_components/video/AddVideo'
import AddArticle from '@/app/admin/courses/[courseId]/module/_components/Article/AddArticle'
import CodingChallenge from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingChallenge'
import Quiz from '@/app/admin/courses/[courseId]/module/_components/quiz/Quiz'
import Assignment from '@/app/admin/courses/[courseId]/module/_components/assignment/Assignment'
import AddAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/AddAssessment'
import AddForm from '@/app/admin/courses/[courseId]/module/_components/form/AddForm'
import {
    getChapterContentState,
    getChapterDataState,
    getModuleData,
    getCurrentChapterState,
    getTopicId,
} from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'

interface QuizOptions {
    option1: string
    option2: string
    option3: string
    option4: string
}

interface QuizQuestionDetails {
    id: number
    question: string
    options: QuizOptions
    correctOption: string
    marks: null | number
    difficulty: string
    tagId: number
}

export default function Page({
    params,
}: {
    params: { moduleId: any; courseId: any }
}) {
    const heightClass = useResponsiveHeight()
    const { courseId, moduleId, chapterID } = useParams()
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const { chapterData, setChapterData } = getChapterDataState()
    const { chapterContent, setChapterContent } = getChapterContentState()
    const { moduleData, setModuleData } = getModuleData()
    const [chapterId, setChapterId] = useState<number>(0)
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const { currentChapter, setCurrentChapter } = getCurrentChapterState()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const { topicId } = getTopicId()
    const [key, setKey] = useState(0)
    const [loading, setLoading] = useState(true)
    const [articleUpdateOnPreview, setArticleUpdateOnPreview] = useState(false)
    const [assignmentUpdateOnPreview, setAssignmentUpdateOnPreview] =
        useState(false)

    const fetchChapterContent = useCallback(
        async (chapterId: number, topicId: number) => {
            try {
                const response = await api.get(
                    `Content/chapterDetailsById/${chapterId}?bootcampId=${courseId}&moduleId=${moduleId}&topicId=${topicId}`
                )

                setChapterId(chapterId)
                const currentModule: any = moduleData.find(
                    (myModule: any) => myModule.chapterId === chapterId
                )

                if (currentModule) {
                    setActiveChapterTitle(currentModule?.chapterTitle)
                    setCurrentChapter(currentModule)
                }

                setChapterContent(response.data)

                setTimeout(() => {
                    setLoading(false) // Set loading to false after the delay
                }, 100)

                setActiveChapter(chapterId)
                setKey((prevKey: any) => prevKey + 1)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
                setTimeout(() => {
                    setLoading(false) // Set loading to false after the delay
                }, 100)
            }
        },
        [moduleData, courseId, moduleId]
    )

    useEffect(() => {
        if (chapterData.length > 0) {
            fetchChapterContent(chapter_id, topicId)
        } else {
            setActiveChapter(0)
            setChapterContent([])
            setActiveChapterTitle('')
            setTimeout(() => {
                setLoading(false) // Set loading to false after the delay
            }, 100)
        }
    }, [
        chapterData,
        fetchChapterContent,
        articleUpdateOnPreview,
        assignmentUpdateOnPreview,
        ,
        topicId,
    ])

    const renderChapterContent = () => {
        if (
            topicId &&
            chapterContent &&
            (chapterContent?.id === chapter_id ||
                chapterContent?.chapterId === chapter_id)
        ) {
            switch (topicId) {
                case 1:
                    return (
                        <ScrollArea
                            // className="h-[600px] lg:h-[600px] pr-4"
                            className={`${heightClass} pr-4`}
                            type="hover"
                            style={{
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none', // IE and Edge
                            }}
                        >
                            <AddVideo
                                key={chapterId}
                                moduleId={moduleID}
                                content={chapterContent}
                                fetchChapterContent={fetchChapterContent}
                            />
                        </ScrollArea>
                    )
                case 2:
                    return (
                        <AddArticle
                            key={chapterId}
                            content={chapterContent}
                            articleUpdateOnPreview={articleUpdateOnPreview}
                            setArticleUpdateOnPreview={
                                setArticleUpdateOnPreview
                            }
                        />
                    )
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
                    return (
                        <Assignment
                            key={chapterId}
                            content={chapterContent}
                            assignmentUpdateOnPreview={
                                assignmentUpdateOnPreview
                            }
                            setAssignmentUpdateOnPreview={
                                setAssignmentUpdateOnPreview
                            }
                        />
                    )
                case 6:
                    return (
                        <AddAssessment
                            key={chapterId}
                            chapterData={currentChapter}
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
                                chapterData={currentChapter}
                                content={chapterContent}
                                // fetchChapterContent={fetchChapterContent}
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

    return <div className="w-full">{renderChapterContent()}</div>
}
