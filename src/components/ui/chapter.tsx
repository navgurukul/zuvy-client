'use client'
import { useCallback, useEffect, useState, useRef } from 'react'
import { api } from '@/utils/axios.config'
import { useParams, useRouter } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Reorder } from 'framer-motion'
import ChapterItem from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/ChapterItem'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ChapterModal from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/ChapterModal'
import {
    getChapterContentState,
    getChapterDataState,
    getModuleData,
    getTopicId,
    getCurrentModuleName,
    getChapterUpdateStatus,
    getCourseData,
    getUser,
} from '@/store/store'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { useModuleChapters } from '@/hooks/useModuleChapters'
import { ModuleContentSkeletons } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'

type Chapter = {
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order: number
}

function Chapter() {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const { organization, courseId, moduleId, chapterID } = useParams()
    
    const chapter_id = Array.isArray(chapterID) ? Number(chapterID[0]) : Number(chapterID)
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const courseID = Array.isArray(courseId) ? parseInt(courseId[0]) : parseInt(courseId)
    
    const { chapterData, setChapterData } = getChapterDataState()
    const { chapterContent, setChapterContent } = getChapterContentState()
    const { setModuleData } = getModuleData()
    const { setTopicId } = getTopicId()
    const { setModuleName } = getCurrentModuleName((state) => state)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { courseData, fetchCourseDetails } = getCourseData()
    
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const [open, setOpen] = useState(false)
    const [originalChapterData, setOriginalChapterData] = useState<any[]>([])
    const [flashingChapterId, setFlashingChapterId] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    
    const scrollAreaRef = useRef<HTMLDivElement | null>(null)
    const activeChapterRef = useRef<HTMLDivElement | null>(null)
    const isChapterClickedRef = useRef(false)
    const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const borderFlashTimeout = useRef<NodeJS.Timeout | null>(null)
    const lastOrderRef = useRef<number[]>([])
    const isDragActiveRef = useRef(false)
    const draggedChapterRef = useRef<number | null>(null)

    const {
        moduleName: fetchedModuleName,
        chapters: moduleChapters,
        permissions,
        loading: moduleLoading,
        refetch,
    } = useModuleChapters(moduleID)

    // Fetch course details on mount
    useEffect(() => {
        if (courseData?.name === '') {
            fetchCourseDetails(courseID)
        }
    }, [courseData, fetchCourseDetails, courseID])

    // Border flash animation
    const triggerBorderFlash = useCallback((chapterId: number) => {
        setFlashingChapterId(chapterId)

        if (borderFlashTimeout.current) {
            clearTimeout(borderFlashTimeout.current)
        }

        borderFlashTimeout.current = setTimeout(() => {
            setFlashingChapterId(null)
        }, 600)
    }, [])

    // Refresh chapters data
    const refreshChapters = useCallback(async () => {
        try {
            await refetch()
        } catch (error) {
            console.error('Error fetching chapters:', error)
            router.replace(`/${userRole}/${organization}/courses/${courseId}/curriculum`)
            toast.info({
                title: 'Caution',
                description: 'The Module has been deleted by another Admin',
            })
        }
    }, [refetch, router, userRole, courseId])

    // Handle chapter updates
    useEffect(() => {
        if (isChapterUpdated) {
            refreshChapters()
            setIsChapterUpdated(false)
        }
    }, [isChapterUpdated, refreshChapters, setIsChapterUpdated])

    // Initialize chapter data
    useEffect(() => {
        if (moduleLoading) return

        setModuleName(fetchedModuleName)

        if (!permissions?.viewChapter) {
            // Clear all data if no view permission
            setChapterData([])
            setModuleData([])
            setOriginalChapterData([])
            setTopicId(0)
            setChapterContent([])
            setActiveChapter(0)
            return
        }

        setChapterData(moduleChapters)
        setModuleData(moduleChapters)
        
        const clickedChapter = moduleChapters.find(
            (item: any) => item.chapterId === chapter_id
        )

        if (clickedChapter?.topicId) {
            setTopicId(clickedChapter.topicId)
        }

        setOriginalChapterData(moduleChapters.map((item: any) => ({ ...item })))
        lastOrderRef.current = moduleChapters.map((item: any) => item.chapterId)
    }, [moduleLoading, fetchedModuleName, permissions, moduleChapters, chapter_id, setModuleName, setChapterData, setModuleData, setTopicId, setChapterContent, setActiveChapter])

    // Update active chapter when chapter data changes
    useEffect(() => {
        if (chapterData.length > 0) {
            setActiveChapter(chapter_id)
        } else {
            setActiveChapter(0)
            setChapterContent([])
        }
    }, [chapterData, chapter_id, setChapterContent])

    // Scroll to active chapter
    useEffect(() => {
        if (!activeChapterRef.current || !scrollAreaRef.current) return

        const scrollArea = scrollAreaRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
        )

        if (scrollArea && activeChapterRef.current) {
            const elementOffset = activeChapterRef.current.offsetTop
            scrollArea.scrollTop = elementOffset - 100
        }
    }, [activeChapter])

    // Drag handlers
    const handleReorderWithDebounce = useCallback(
        (newOrderChapters: any[]) => {
            setChapterData(newOrderChapters)

            if (dragTimeoutRef.current) {
                clearTimeout(dragTimeoutRef.current)
            }

            if (!isDragActiveRef.current) {
                dragTimeoutRef.current = setTimeout(() => {
                    const draggedId = draggedChapterRef.current
                    if (!draggedId) return

                    const newIndex = newOrderChapters.findIndex(
                        (c) => c.chapterId === draggedId
                    )
                    const originalIndex = originalChapterData.findIndex(
                        (c) => c.chapterId === draggedId
                    )

                    if (newIndex !== originalIndex && newIndex !== -1) {
                        updateChapterOrder(draggedId, newIndex + 1)
                    }
                }, 300)
            }
        },
        [originalChapterData]
    )

    const handleDragStart = (chapterId: number) => {
        draggedChapterRef.current = chapterId
        isDragActiveRef.current = true
        setIsDragging(true)
    }

    const handleDragEnd = (newOrderChapters: any[]) => {
        isDragActiveRef.current = false
        setIsDragging(false)
        
        const draggedId = draggedChapterRef.current
        if (!draggedId) return

        const newIndex = newOrderChapters.findIndex(
            (c) => c.chapterId === draggedId
        )
        const originalIndex = originalChapterData.findIndex(
            (c) => c.chapterId === draggedId
        )

        if (newIndex !== originalIndex && newIndex !== -1) {
            setTimeout(() => {
                updateChapterOrder(draggedId, newIndex + 1)
            }, 100)
        }

        draggedChapterRef.current = null
    }

    // Update chapter order via API
    const updateChapterOrder = async (
        chapterId: number,
        newPosition: number
    ) => {
        const originalPosition =
            originalChapterData.findIndex((c) => c.chapterId === chapterId) + 1
        
        if (originalPosition === newPosition) {
            return // No change, skip API call
        }

        try {
            await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${chapterId}`,
                { newOrder: newPosition }
            )

            toast.success({
                title: 'Success',
                description: 'Chapter order updated successfully',
            })

            triggerBorderFlash(chapterId)

            // Update reference data
            const updatedOriginalData = chapterData.map((item, index) => ({
                ...item,
                order: index + 1,
            }))
            setOriginalChapterData(updatedOriginalData)
            lastOrderRef.current = chapterData.map((c) => c.chapterId)
        } catch (error: any) {
            console.error('Reorder error:', error)

            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'Failed to update chapter order',
            })

            setChapterData([...originalChapterData])
        }
    }

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (dragTimeoutRef.current) {
                clearTimeout(dragTimeoutRef.current)
            }
            if (borderFlashTimeout.current) {
                clearTimeout(borderFlashTimeout.current)
            }
        }
    }, [])

    // Helper to scroll to last chapter
    const scrollToBottom = () => {
        const lastChapterElement = document.getElementById('last-chapter')
        if (lastChapterElement) {
            lastChapterElement.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const canCreateChapter = permissions?.createChapter ?? false
    const canDeleteChapter = permissions?.deleteChapter ?? false

    if (moduleLoading) {
        return <ModuleContentSkeletons />
    }

    return (
        <div className="flex flex-col h-screen pb-20 bg-card pl-4 pt-2">
            <Link
                href={`/${userRole}/${organization}/courses/${courseId}/curriculum`}
                className="flex space-x-2 w-[180px] text-foreground mt-3 mb-6 hover:text-primary"
            >
                <ArrowLeft size={20} />
                <p className="ml-1 inline-flex text-sm font-medium md:ml-2">
                    Back to Curriculum
                </p>
            </Link>
            
            <h1 className="font-heading text-start font-bold text-lg text-foreground">
                Module Content
            </h1>
            <p className="font-heading text-start font-bold text-sm text-muted-foreground mb-4">
                {fetchedModuleName}
            </p>
            
            <div className="flex flex-col overflow-hidden">
                {canCreateChapter && (
                    <div className="flex">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <div className="w-full mb-4 pb-4 pr-4 border-b border-muted-light">
                                    <Button
                                        variant="outline"
                                        className="py-2 px-2 h-full w-full mr-4"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Chapter
                                    </Button>
                                </div>
                            </DialogTrigger>
                            <DialogOverlay />
                            <DialogContent>
                                <ChapterModal
                                    courseId={courseId}
                                    moduleId={moduleId}
                                    fetchChapters={refreshChapters}
                                    newChapterOrder={chapterData.length}
                                    scrollToBottom={scrollToBottom}
                                    onClose={() => setOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                
                <ScrollArea
                    ref={scrollAreaRef}
                    className="h-screen pr-4 w-full mr-16 mt-2"
                    type="hover"
                >
                    <Reorder.Group
                        values={chapterData}
                        onReorder={handleReorderWithDebounce}
                        style={{
                            pointerEvents: 'auto',
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                        }}
                    >
                        {chapterData.map((item: any, index: number) => {
                            const isLastItem = index === chapterData.length - 1

                            return (
                                <ChapterItem
                                    key={item.chapterId}
                                    chapterId={item.chapterId}
                                    title={item.chapterTitle}
                                    topicId={item.topicId}
                                    topicName={item.topicName}
                                    fetchChapters={refreshChapters}
                                    setActiveChapter={setActiveChapter}
                                    activeChapter={activeChapter}
                                    moduleId={moduleID}
                                    isChapterClickedRef={isChapterClickedRef}
                                    activeChapterRef={activeChapterRef}
                                    chapterData={chapterData}
                                    isLastItem={isLastItem}
                                    isDragging={isDragging}
                                    onDragStart={() => handleDragStart(item.chapterId)}
                                    onDragEnd={() => handleDragEnd(chapterData)}
                                    showBorderFlash={flashingChapterId === item.chapterId}
                                    canDeleteChapter={canDeleteChapter}
                                />
                            )
                        })}
                    </Reorder.Group>
                </ScrollArea>
            </div>
        </div>
    )
}

export default Chapter
