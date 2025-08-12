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
    getActiveChapter,
} from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import LiveClass from '../../../_components/liveClass/LiveClass'
import { useRouter } from 'next/navigation'
import {ChaptersQuizQuestionDetails} from "@/app/admin/courses/[courseId]/module/[moduleId]/chapters/chaptersCodingIdPageType"
export default function Page({
    params,
}: {
    params: { moduleId: string; courseId: string }
}) {
    const router = useRouter()
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
    // const { activeChapter, setActiveChapter } = getActiveChapter(chapter_id)()
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
                setLoading(false)
                setActiveChapter(chapterId)
                setKey((prevKey: any) => prevKey + 1)
                return response.data
            } catch (error) {
                console.error('Error fetching chapter content:', error)
                setLoading(false)
            }
        },
        [moduleData, courseId, moduleId]
    )

    useEffect(() => {
        if (chapterData.length > 0 && topicId != null && chapter_id > 0) {
            // Check if we actually need to fetch (chapter changed)
            if (chapterId !== chapter_id) {
                fetchChapterContent(chapter_id, topicId)
            }
        } else {
            if (moduleData.length > 0) {
                const firstChapterId = moduleData[0].chapterId
                router.replace(
                    `/admin/courses/${courseId}/module/${moduleId}/chapters/${firstChapterId}`
                )
            }
            setActiveChapter(0)
            setChapterContent([])
            setActiveChapterTitle('')
            setTimeout(() => {
                setLoading(false) // Set loading to false after the delay
            }, 1000)
        }
    }, [
        // chapterData,
        fetchChapterContent,
        articleUpdateOnPreview,
        assignmentUpdateOnPreview,
        topicId,
        chapter_id,
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
                        <AddVideo
                            key={chapterId}
                            moduleId={moduleID}
                            courseId={courseId}
                            content={chapterContent}
                            fetchChapterContent={fetchChapterContent}
                        />
                    )
                case 2:
                    return (
                        <AddArticle
                            key={chapterId}
                            content={chapterContent}
                            courseId={courseId}
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
                            courseId={courseId}
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
                            courseId={courseId}
                            content={chapterContent}
                            activeChapterTitle={activeChapterTitle}
                        />
                    )
                case 5:
                    return (
                        <Assignment
                            key={chapterId}
                            content={chapterContent}
                            courseId={courseId}
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
                            key={Number(chapterID)}
                            chapterData={currentChapter}
                            content={chapterContent}
                            fetchChapterContent={fetchChapterContent}
                            moduleId={moduleID}
                            topicId={topicId}
                            activeChapterTitle={activeChapterTitle}
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
                            courseId={courseId}
                        />
                    )

                case 8:
                    return (
                        <LiveClass
                            chapterData={currentChapter}
                            content={chapterContent}
                            // fetchChapterContent={fetchChapterContent}
                            moduleId={moduleID}
                            courseId={courseId}
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
                                    <Spinner className="text-[rgb(81,134,114)]" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[80vh] relative">
                            <div className="absolute left-1/2 -translate-x-1/2 md:left-[380px] md:translate-x-0">
                                <img
                                    src="/images/undraw.svg"
                                    alt="Create Chapter"
                                    className="lg:w-[280px] lg:h-[280px] md:w-[320px] md:h-[320px] object-contain mb-3 opacity-80"
                                />
                                <p className="absolute text-lg text-center lg:left-[45px]">
                                    Create New Chapter
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )
        }
    }

    return <div className="w-full">{renderChapterContent()}</div>
}