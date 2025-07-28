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
            setOriginalChapterData([...response.data.chapterWithTopic])
            
            // Initialize last order reference
            lastOrderRef.current = response.data.chapterWithTopic.map((item: any) => item.chapterId)
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
            dragTimeoutRef.current = setTimeout(async () => {
                await handleReorder(newOrderChapters)
            }, 1200) // Very short delay for final drop


        // const currentOrder = newOrderChapters.map(item => item.chapterId)
        // const lastOrder = lastOrderRef.current

        // const orderChanged = !lastOrder.every((id, idx) => id === currentOrder[idx])

        // if (orderChanged) {
        //     dragTimeoutRef.current = setTimeout(() => {
        //         handleReorder(newOrderChapters)
        //     }, 1000)
        // }
    }
    }, [])

  // Handle actual reorder API call - Only called after drag ends
    const handleReorder = async (newOrderChapters: any[]) => {
        try {
            const currentOrder = newOrderChapters.map((item: any) => item?.chapterId)
            
            // Check if order actually changed compared to last processed order
            const orderChanged = !lastOrderRef.current.every((id, index) => id === currentOrder[index])
            
            if (!orderChanged) {
                return // No change, no API call
            }

            // Find the moved item and its new position
            const reorderedChapters = newOrderChapters.map((item: any, index: any) => ({
                ...item,
                order: index + 1,
            }))

            let movedItem = null
            let newPosition = -1

            // Find which item moved
            for (let i = 0; i < currentOrder.length; i++) {
                if (currentOrder[i] !== lastOrderRef.current[i]) {
                    movedItem = reorderedChapters.find(item => item.chapterId === currentOrder[i])
                    newPosition = i + 1
                    break
                }
            }

            if (!movedItem) {
                return // No moved item found
            }

            const response = await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${movedItem.chapterId}`,
                { newOrder: newPosition }
            )
            
            // Show success toast only once
            toast.success({
                title: 'Success',
                description: 'Chapter order updated successfully',
            })
            
            // Update references for next comparison
            lastOrderRef.current = [...currentOrder]
            setOriginalChapterData([...reorderedChapters])
            
        } catch (error: any) {
            console.error('Reorder error:', error)
            
            toast.error({
                title: 'Failed',
                description: error.response?.data?.message || 'An error occurred.',
            })
            
            // Revert to original order on error
            setChapterData([...originalChapterData])
            lastOrderRef.current = originalChapterData.map(item => item.chapterId)
        }
    }

    //    // Handle drag start
    // const handleDragStart = useCallback(() => {

    //     setIsDragging(true)
    //     isDragActiveRef.current = true
        
    //     // Clear any pending API calls
    //     if (dragTimeoutRef.current) {
    //         clearTimeout(dragTimeoutRef.current)
    //     }
    //     console.log("darg start")
    // }, [])

    // // Handle drag end - This is when we actually want to make the API call
    // const handleDragEnd = useCallback(() => {
    //     console.log("darg end")
    //     setIsDragging(false)
    //     isDragActiveRef.current = false
        
    //     // Now trigger the API call with current chapter data
    //     setTimeout(() => {
    //         handleReorder(chapterData)
    //     }, 1500) // Small delay to ensure state is updated
    // }, [])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (dragTimeoutRef.current) {
                clearTimeout(dragTimeoutRef.current)
            }
        }
    }, [])

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
        <div className="flex flex-col h-screen pb-20">
            <div className="mb-5">
                <BreadcrumbComponent crumbs={crumbs} />
            </div>
            <div className="flex flex-col overflow-hidden">
                <div className="flex">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="py-2 px-2 h-full w-full mr-4 bg-background text-[rgb(81,134,114)] border-[rgb(81,134,114)] border hover:bg-[rgb(81,134,114)] hover:text-white"
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
