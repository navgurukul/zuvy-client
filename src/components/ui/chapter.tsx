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
    getActiveChapter,
    getCurrentModuleName,
    getChapterUpdateStatus,
    getCourseData,
} from '@/store/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

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
    const router = useRouter()
    const { courseId, moduleId, chapterID } = useParams()
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const courseID = Array.isArray(courseId)
        ? parseInt(courseId[0])
        : parseInt(courseId)
    const { chapterData, setChapterData } = getChapterDataState()
    const { chapterContent, setChapterContent } = getChapterContentState()
    const [chapterId, setChapterId] = useState<number>(0)
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const { moduleData, setModuleData } = getModuleData()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    // const { activeChapter, setActiveChapter } = getActiveChapter(chapter_id)()
    const { topicId, setTopicId } = getTopicId()
    const moduleName = getCurrentModuleName((state) => state.moduleName)
    const setModuleName = getCurrentModuleName((state) => state.setModuleName)
    const [key, setKey] = useState(0)
    const [open, setOpen] = useState(false)

     // Drag and drop states
    const [isDragging, setIsDragging] = useState(false)
    const [originalChapterData, setOriginalChapterData] = useState<any[]>([])
    const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastOrderRef = useRef<number[]>([]) // Track last processed order
    const isDragActiveRef = useRef(false) // Track if drag is currently active

    const [flashingChapterId, setFlashingChapterId] = useState<number | null>(null)
    const [borderFlashTimeout, setBorderFlashTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleAddChapter = () => {
        setOpen(true)
    }

    const scrollAreaRef = useRef<HTMLDivElement | null>(null)
    const activeChapterRef = useRef<HTMLDivElement | null>(null)
    const [isNewChapterCreated, setIsNewChapterCreated] = useState(false)
    const [isChapterClicked, setIsChapterClicked] = useState(false)
    const isChapterClickedRef = useRef(false)
    const [currentChapter, setCurrentChapter] = useState<any>([])
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { courseData, fetchCourseDetails } = getCourseData()
    const draggedChapterRef = useRef<number | null>(null)

    const crumbs = [
        {
            crumb: 'Courses',
            href: '/admin/courses',
            isLast: false,
        },
        {
            crumb: `${courseData?.name}-Curriculum`,
            href: `/admin/courses/${courseId}/curriculum`,
            isLast: false,
        },
        {
            crumb: moduleName,
            isLast: true,
        },
    ]

    useEffect(() => {
        if (courseData?.name === "") fetchCourseDetails(courseID)
    }, [courseData])

     const triggerBorderFlash = (chapterId: number) => {
        setFlashingChapterId(chapterId)
        
        // Clear existing timeout if any
        if (borderFlashTimeout) {
            clearTimeout(borderFlashTimeout)
        }
        
        // Set new timeout to hide border flash
        const timeout = setTimeout(() => {
            setFlashingChapterId(null)
        }, 600) // Flash duration - 600ms
        
        setBorderFlashTimeout(timeout)
    }

    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${moduleId}`
            )
            const clickedChapter = response.data.chapterWithTopic.find(
                (item: any) => item.chapterId === chapter_id
            )
            setTopicId(clickedChapter?.topicId)
            setCurrentChapter(clickedChapter)
            setChapterData(response.data.chapterWithTopic)
            setModuleName(response.data.moduleName)
            setModuleData(response.data.chapterWithTopic)

             // Store original data for comparison
            setOriginalChapterData([...response.data.chapterWithTopic.map((item: any) => ({ ...item }))])
            
            // Initialize last order reference
            lastOrderRef.current = response.data.chapterWithTopic.map((item: any) => item.chapterId)
        } catch (error) {
            router.replace(
                `/admin/courses/${courseId}/curriculum`
            )
            toast.info({
                title: 'Caution',
                description:
                    'The Module has been deleted by another Admin'            
            })
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

    // Handle reorder with proper debounce - Only update UI during drag
    const handleReorderWithDebounce = useCallback((newOrderChapters: any[]) => {
        // Update UI immediately
        setChapterData(newOrderChapters)
        
       // Clear existing timeout
        if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current)
        }

        // Only call API if drag is not active (i.e., drag has ended)
        if (!isDragActiveRef.current) {
            // dragTimeoutRef.current = setTimeout(async () => {
            //     // Call updateChapterOrder for each chapter in new order
            //     for (let i = 0; i < newOrderChapters.length; i++) {
            //         await updateChapterOrder(newOrderChapters[i].chapterId, i + 1)
            //     }
            // }, 1200) // Very short delay for final drop

             dragTimeoutRef.current = setTimeout(() => {
            // Get the dragged chapter ID
            const draggedId = draggedChapterRef.current
            if (!draggedId) return

            // Find new and original positions
            const newIndex = newOrderChapters.findIndex(c => c.chapterId === draggedId)
            const originalIndex = originalChapterData.findIndex(c => c.chapterId === draggedId)
            
            // Only make API call if position actually changed
            if (newIndex !== originalIndex && newIndex !== -1) {
                updateChapterOrder(draggedId, newIndex + 1)
            }
        }, 300)
    }
    }, [[originalChapterData]])

    const handleDragStart = (chapterId: number) => {
        draggedChapterRef.current = chapterId
        isDragActiveRef.current = true
        setIsDragging(true)
    }
    
    // Drag end par final position calculate karna
    const handleDragEnd = (newOrderChapters: any[]) => {
        isDragActiveRef.current = false
        setIsDragging(false)
        const draggedId = draggedChapterRef.current
        if (!draggedId) return

        const newIndex = newOrderChapters.findIndex(c => c.chapterId === draggedId)
        const originalIndex = originalChapterData.findIndex(c => c.chapterId === draggedId)
        // if (newIndex === -1) return

        if (newIndex !== originalIndex && newIndex !== -1) {
        // Small delay to ensure drag animation completes
        setTimeout(() => {
            updateChapterOrder(draggedId, newIndex + 1)
        }, 100)
    }

        // Call API with draggedId and new position
        // updateChapterOrder(draggedId, newIndex + 1)
        draggedChapterRef.current = null
    }

    // Actual API call function
    const updateChapterOrder = async (chapterId: number, newPosition: number) => {

        const originalPosition = originalChapterData.findIndex(c => c.chapterId === chapterId) + 1
        const hasActuallyChanged = originalPosition !== newPosition

        if (!hasActuallyChanged) {
        return // Early return - no API call, no toast, no flash
    }
        try {
            await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${chapterId}`,
                { newOrder: newPosition }
            )

            // Show success toast only once
            toast.success({
                title: 'Success',
                description: 'Chapter order updated successfully',
            })

            triggerBorderFlash(chapterId)

            // if (hasActuallyChanged) {
            //     triggerBorderFlash(chapterId)
            // }
            // Update local reference

             const updatedOriginalData = [...chapterData].map((item, index) => ({
            ...item,
            order: index + 1
        }))
        setOriginalChapterData(updatedOriginalData)
            lastOrderRef.current = chapterData.map(c => c.chapterId)
        } catch (error: any) {
            console.error('Reorder error:', error)

            toast.error({
                title: 'Failed',
                description: error.response?.data?.message || 'An error occurred.',
            })
            

            setChapterData([...originalChapterData]) // revert if failed
        }
    }


    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (dragTimeoutRef.current) {
                clearTimeout(dragTimeoutRef.current)
            }

            if (borderFlashTimeout) {
                clearTimeout(borderFlashTimeout)
            }
        }
    }, [borderFlashTimeout])

    const scrollToBottom = () => {
        const lastChapterElement = document.getElementById('last-chapter')
        if (lastChapterElement) {
            lastChapterElement.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // useEffect(() => {
    //     if (currentChapter?.topicId) {
    //         setTopicId(currentChapter?.topicId)
    //     }
    // }, [currentChapter])

    return (
        <div className="flex flex-col h-screen pb-20 bg-card">
            {/* <div className="mb-5">
                <BreadcrumbComponent crumbs={crumbs} />
            </div> */}
            <Link
                href={'/admin/courses'}
                className="flex space-x-2 w-[180px] text-foreground mt-3 mb-6 hover:text-primary"
            >
                <ArrowLeft size={20} />
                <p className="ml-1 inline-flex text-sm font-medium md:ml-2">
                    Back to Course
                </p>
            </Link>
            <h1 className="font-heading text-start font-bold text-lg text-foreground">
                Module Content
            </h1>
            <p className="font-heading text-start font-bold text-sm text-muted-foreground mb-4">
                {moduleName}
            </p>
            <div className="flex flex-col overflow-hidden">
                <div className="flex">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <div className="w-full mb-4 pb-4 pr-4 border-b border-gray-200">
                                <Button variant="outline" className="py-2 px-2 h-full w-full mr-4">
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
                                fetchChapters={fetchChapters}
                                newChapterOrder={chapterData.length}
                                scrollToBottom={scrollToBottom}
                                onClose={() => setOpen(false)} // <-- Pass onClose prop
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
                        onReorder={handleReorderWithDebounce}
                        // onDragStart={handleDragStart}
                        // onDragEnd={handleDragEnd}
                        // Disable pointer events during drag to prevent intermediate updates
                        style={{ pointerEvents: 'auto',
                            listStyle: 'none',
                            padding: 0,
                            margin: 0}}
                    >
                        {chapterData.map((item: any, index: any) => {
                                const isLastItem =
                                    index === chapterData.length - 1

                                return (
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
                                        isChapterClickedRef={isChapterClickedRef}
                                        activeChapterRef={activeChapterRef}
                                        chapterData={chapterData}
                                        isLastItem={isLastItem}
                                        isDragging={isDragging}
                                        onDragStart={() => handleDragStart(item.chapterId)}
                                        onDragEnd={() => handleDragEnd(chapterData)}
                                        showBorderFlash={flashingChapterId === item.chapterId}
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
