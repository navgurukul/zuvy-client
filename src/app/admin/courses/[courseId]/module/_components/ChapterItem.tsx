import { cn } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import {
    BookOpenText,
    SquareCode,
    FileQuestion,
    PencilLine,
    StickyNote,
    Trash2,
    Video,
    GripVertical,
    BookOpenCheck,
    Play,
} from 'lucide-react'
import DeleteConfirmationModal from '../../_components/deleteModal'
import { useEffect, useState } from 'react'
import { DELETE_CHAPTER_CONFIRMATION } from '@/utils/constant'
import { toast } from '@/components/ui/use-toast'
import { useParams, useRouter } from 'next/navigation'
import { getTopicId } from '@/store/store'
import { Reorder, useDragControls } from 'framer-motion'
import {ChapterItems} from "@/app/admin/courses/[courseId]/module/_components/ModuleComponentType"

function ChapterItem({
    title,
    topicId,
    topicName,
    chapterId,
    activeChapter,
    setActiveChapter,
    fetchChapters,
    moduleId,
    activeChapterRef,
    isChapterClickedRef,
    chapterData,
    isLastItem,
    isDragging,
    onDragStart,
    onDragEnd,
    showBorderFlash,
}:ChapterItems) {
    // states and variables
    const { courseId } = useParams()
    const router = useRouter()
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const { setTopicId } = getTopicId()
    const dragControls = useDragControls()
    const [isBeingDragged, setIsBeingDragged] = useState(false)

    // functions
    const setTopicIcon = () => {
        switch (topicId) {
            case 1:
                return <Video />
            case 2:
                return <BookOpenText />
            case 3:
                return <SquareCode />
            case 4:
                return <FileQuestion />
            case 5:
                return <PencilLine />
            case 6:
                return <BookOpenCheck />
            case 8:
                return <Play />
            default:
                return <StickyNote />
        }
    }

    const setActiveChapterItem = () => {
        return activeChapter === chapterId
            ? 'bg-[rgb(81,134,114)]/50 text-gray-700'
            : 'text-black hover:bg-[rgb(81,134,114)]/20'
    }

    const handleClick = () => {
        // Prevent click during drag
        if (isBeingDragged || isDragging) {
            console.log('Click prevented during drag')
            return
        }

        setActiveChapter(chapterId)
        if (topicId) {
            setTopicId(topicId)
        }
        router.push(
            `/admin/courses/${courseId}/module/${moduleId}/chapters/${chapterId}`
        )
    }

    const handleDeleteChapter = async () => {
        try {
            await api
                .delete(
                    `/content/deleteChapter/${moduleId}?chapterId=${chapterId}`
                )
                .then((res) => {
                    toast.success({
                        title: res.data.title,
                        description: res.data.message,
                    })
                    fetchChapters()
                    console.log('chapterData', chapterData)
                    if (chapterData[0].chapterId === chapterId) {
                        console.log('Comes on if')
                        router.push(
                            `/admin/courses/${courseId}/module/${moduleId}/chapters/${chapterData[1].chapterId}`
                        )
                    } else if (chapterId === activeChapter) {
                        console.log('Comes on else')
                        router.push(
                            `/admin/courses/${courseId}/module/${moduleId}/chapters/${chapterData[0].chapterId}`
                        )
                    }
                })
                .catch((error) => {
                    toast.error({
                        title: error.data.title,
                        description: error.data.message,
                    })
                })
        } catch (error) {
            console.error('Error handling delete chapter:', error)
        }
    }

    const handleDeleteModal = () => {
        setDeleteModalOpen(true)
    }

    // const handleDragStart = () => {
    //     setIsBeingDragged(true)
    //     onDragStart()
    //     // Don't show any toast during drag
    // }

    // const handleDragEnd = () => {
    //     // Add small delay to prevent click after drag
    //     // setTimeout(() => {
    //     //     setIsBeingDragged(false)
    //     // }, 300)

    //     setIsBeingDragged(false)
    //     onDragEnd()
    // }

    return (
        <Reorder.Item
            value={chapterData.find((c: any) => c.chapterId === chapterId)}
            id={isLastItem ? 'last-chapter' : `chapter-${chapterId}`}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{
                scale: 1.02,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1000,
                cursor: 'grabbing',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            transition={{ 
                type: "spring",
                stiffness: 150,
                damping: 28,
                mass: 0.4,
            }}
            // Improved drag styling
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                marginBottom: '4px',
            }}
        >
            <div ref={chapterId === activeChapter ? activeChapterRef : null}>
                <div
                    className={cn(
                        'flex rounded-md p-3  my-1 cursor-pointer justify-between items-center select-none transition-all duration-200',
                        setActiveChapterItem(),
                        isBeingDragged
                            ? 'opacity-90 cursor-grabbing'
                            : 'opacity-100 cursor-pointer',
                        showBorderFlash 
                            ? 'border-2 border-green-400 shadow-lg shadow-green-300/50 animate-border-flash' 
                            : ''
                    )}
                    onClick={handleClick}
                    style={{
                        pointerEvents: isBeingDragged ? 'none' : 'auto',
                        userSelect: 'none', // Prevent text selection during drag
                        WebkitUserSelect: 'none',
                    }}
                >
                    <div className="flex gap-2 capitalize">
                        <p>{setTopicIcon()} </p>
                        <p>{title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Trash2
                            onClick={(e) => {
                                if (!isBeingDragged && !isDragging) {
                                    handleDeleteModal()
                                }
                            }}
                            className="hover:text-destructive cursor-pointer transition-colors"
                            size={15}
                            style={{
                                pointerEvents: isBeingDragged ? 'none' : 'auto',
                            }}
                        />
                        <GripVertical
                            style={{
                                cursor: isBeingDragged ? 'grabbing' : 'grab',
                                pointerEvents: 'auto',
                            }}
                            className="text-gray-600 hover:text-gray-600 transition-colors"
                            onPointerDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                dragControls.start(e)
                            }}
                            size={15}
                        />
                    </div>
                </div>
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={() => {
                        handleDeleteChapter()
                        setDeleteModalOpen(false)
                    }}
                    modalText={DELETE_CHAPTER_CONFIRMATION}
                    buttonText="Delete Chapter"
                    input={false}
                />
            </div>
        </Reorder.Item>
    )
}

export default ChapterItem
