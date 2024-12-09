'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { api } from '@/utils/axios.config'
import { useParams } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Reorder } from 'framer-motion'
import ChapterItem from '@/app/admin/courses/[courseId]/module/_components/ChapterItem'
import { toast } from '@/components/ui/use-toast'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ChapterModal from '@/app/admin/courses/[courseId]/module/_components/ChapterModal'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import {
    getChapterContentState,
    getChapterDataState,
    getModuleData,
    getTopicId,
    getCurrentModuleName,
    getChapterUpdateStatus,
} from '@/store/store'

type Chapter = {
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order: number
}

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

function Chapter() {
    const { courseId, moduleId, chapterID } = useParams()
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const { chapterData, setChapterData } = getChapterDataState()
    const { chapterContent, setChapterContent } = getChapterContentState()
    const [chapterId, setChapterId] = useState<number>(0)
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const { moduleData, setModuleData } = getModuleData()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const { topicId, setTopicId } = getTopicId()
    const moduleName = getCurrentModuleName((state) => state.moduleName)
    const setModuleName = getCurrentModuleName((state) => state.setModuleName)
    const [key, setKey] = useState(0)
    const [open, setOpen] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement | null>(null)
    const activeChapterRef = useRef<HTMLDivElement | null>(null)
    const [isNewChapterCreated, setIsNewChapterCreated] = useState(false)
    const [isChapterClicked, setIsChapterClicked] = useState(false)
    const isChapterClickedRef = useRef(false)
    const [currentChapter, setCurrentChapter] = useState<any>([])
    const {isChapterUpdated, setIsChapterUpdated} = getChapterUpdateStatus()

    const crumbs = [
        {
            crumb: 'Courses',
            href: '/admin/courses',
            isLast: false,
        },
        {
            crumb: 'Curriculum',
            href: `/admin/courses/${courseId}/curriculum`,
            isLast: false,
        },
        {
            crumb: moduleName,
            isLast: true,
        },
    ]

    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${moduleId}`
            )
            const clickedChapter = response.data.chapterWithTopic.find(
                (item: any) => item.chapterId === chapter_id
            )
            setCurrentChapter(clickedChapter)
            setChapterData(response.data.chapterWithTopic)
            setModuleName(response.data.moduleName)
            setModuleData(response.data.chapterWithTopic)
        } catch (error) {
            console.error('Error fetching chapters:', error)
        }
    }, [moduleId, chapter_id, isChapterUpdated])

    useEffect(() => {
        if (moduleId) {
            fetchChapters()
        }
    }, [courseId, moduleId, fetchChapters])

    useEffect(() => {
        if (chapterData.length > 0) {
            setActiveChapter(chapter_id)
            setChapterId(chapter_id)
        } else {
            setActiveChapter(0)
            setChapterContent([])
            setActiveChapterTitle('')
        }
    }, [chapterData])

    useEffect(() => {
        if (activeChapterRef.current && scrollAreaRef.current) {
            // Get the current scroll area
            const scrollArea = scrollAreaRef.current.querySelector(
                '[data-radix-scroll-area-viewport]'
            )

            if (scrollArea) {
                // Calculate the position of the active chapter
                const activeChapterElement = activeChapterRef.current

                // Get the offset of the active chapter within the scroll area
                const elementOffset = activeChapterElement.offsetTop

                // Set the scroll position to this offset
                scrollArea.scrollTop = elementOffset - 100 // Optional: slight offset from the top
            }
        }
    }, [activeChapter])

    async function handleReorder(newOrderChapters: any) {
        newOrderChapters = newOrderChapters.map((item: any, index: any) => ({
            ...item,
            order: index + 1,
        }))

        const oldOrder = chapterData.map((item: any) => item?.chapterId)
        const movedItem = newOrderChapters.find(
            (item: any, index: any) => item?.chapterId !== oldOrder[index]
        )
        if (!movedItem) return
        try {
            const response = await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${movedItem.chapterId}`,
                { newOrder: movedItem.order }
            )
            toast({
                title: 'Success',
                description: 'Content Edited Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            if (response.data) {
                setChapterData(newOrderChapters)
            }
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleAddChapter = () => {
        setOpen(true)
    }

    const scrollToBottom = () => {
        const lastChapterElement = document.getElementById('last-chapter')
        if (lastChapterElement) {
            lastChapterElement.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        if (currentChapter?.topicId) {
            setTopicId(currentChapter?.topicId)
        }
    }, [currentChapter])

    return (
        <div className="flex flex-col h-screen pb-20">
            <div className="mb-5">
                <BreadcrumbComponent crumbs={crumbs} />
            </div>
            <div className="flex flex-col overflow-hidden">
                <div className="flex">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="secondary"
                                className="py-2 px-2 h-full w-full mr-4"
                                onClick={handleAddChapter}
                            >
                                Add Chapter
                            </Button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <DialogContent>
                            <ChapterModal
                                courseId={courseId}
                                moduleId={moduleId}
                                fetchChapters={fetchChapters}
                                newChapterOrder={chapterData.length}
                                scrollToBottom={scrollToBottom}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <ScrollArea
                    ref={scrollAreaRef}
                    className="h-screen pr-4 w-full mr-16 mt-2"
                    type="hover"
                >
                    <Reorder.Group
                        values={chapterData}
                        onReorder={async (newOrderChapters: any) => {
                            handleReorder(newOrderChapters)
                        }}
                    >
                        {chapterData &&
                            chapterData?.map((item: any, index: any) => {
                                const isLastItem =
                                    index === chapterData.length - 1
                                return (
                                    <Reorder.Item
                                        value={item}
                                        key={item.chapterId}
                                        id={
                                            isLastItem
                                                ? 'last-chapter'
                                                : `chapter-${item.chapterId}`
                                        }
                                    >
                                        <ChapterItem
                                            key={item.chapterId}
                                            chapterId={item.chapterId}
                                            title={item.chapterTitle}
                                            topicId={item.topicId}
                                            topicName={item.topicName}
                                            fetchChapters={fetchChapters}
                                            setActiveChapter={setActiveChapter}
                                            activeChapter={activeChapter}
                                            moduleId={moduleID}
                                            isChapterClickedRef={
                                                isChapterClickedRef
                                            }
                                            activeChapterRef={activeChapterRef}
                                        />
                                    </Reorder.Item>
                                )
                            })}
                    </Reorder.Group>
                </ScrollArea>
            </div>
        </div>
    )
}

export default Chapter
