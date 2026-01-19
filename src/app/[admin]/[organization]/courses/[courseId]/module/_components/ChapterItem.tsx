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
import { getUser, getTopicId } from '@/store/store'
import DeleteConfirmationModal from '../../_components/deleteModal'
import { useState } from 'react'
import { DELETE_CHAPTER_CONFIRMATION } from '@/utils/constant'
import { toast } from '@/components/ui/use-toast'
import { useParams, useRouter } from 'next/navigation'
import { Reorder, useDragControls } from 'framer-motion'
import { ChapterItems } from '@/app/[admin]/[organization]/courses/[courseId]/module/_components/ModuleComponentType'
import { LucideIcon } from 'lucide-react'

// Topic icon mapping
const TOPIC_ICONS: Record<number, LucideIcon> = {
    1: Video,
    2: BookOpenText,
    3: SquareCode,
    4: FileQuestion,
    5: PencilLine,
    6: BookOpenCheck,
    8: Play,
}

const getTopicIcon = (topicId: number) => {
    const IconComponent = TOPIC_ICONS[topicId] || StickyNote
    return <IconComponent size={20} />
}

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
    canDeleteChapter = true,
}: ChapterItems) {
    const { courseId } = useParams()
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const { setTopicId } = getTopicId()
    const dragControls = useDragControls()

    const isActive = activeChapter === chapterId
    const activeChapterClasses = isActive
        ? 'bg-primary-light border border-primary text-primary'
        : 'bg-white hover:bg-gray-50 border border-gray-200'

    const handleClick = () => {
        if (isDragging) return

        setActiveChapter(chapterId)
        setTopicId(topicId)
        router.push(
            `/${userRole}/courses/${courseId}/module/${moduleId}/chapters/${chapterId}`
        )
    }

    const handleDeleteChapter = async () => {
        try {
            const res = await api.delete(
                `/content/deleteChapter/${moduleId}?chapterId=${chapterId}`
            )
            
            toast.success({
                title: res.data.title,
                description: res.data.message,
            })
            
            fetchChapters()
            
            // Navigate to appropriate chapter after deletion
            const shouldNavigate = chapterId === activeChapter
            if (shouldNavigate && chapterData.length > 1) {
                const targetChapter = chapterData[0].chapterId === chapterId
                    ? chapterData[1].chapterId
                    : chapterData[0].chapterId
                    
                router.push(
                    `/${userRole}/courses/${courseId}/module/${moduleId}/chapters/${targetChapter}`
                )
            }
        } catch (error: any) {
            console.error('Error deleting chapter:', error)
            toast.error({
                title: error.data?.title || 'Error',
                description: error.data?.message || 'Failed to delete chapter',
            })
        }
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        if (!isDragging) {
            e.stopPropagation()
            setDeleteModalOpen(true)
        }
    }

    const handleDragStart = (e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragControls.start(e)
    }

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
                type: 'spring',
                stiffness: 150,
                damping: 28,
                mass: 0.4,
            }}
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                marginBottom: '4px',
            }}
        >
            <div ref={isActive ? activeChapterRef : null}>
                <div
                    className={cn(
                        'p-3 rounded-lg cursor-pointer transition-colors select-none',
                        activeChapterClasses,
                        showBorderFlash &&
                            'border-2 border-green-400 shadow-lg shadow-green-300/50 animate-border-flash'
                    )}
                    onClick={handleClick}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <span className="text-sm">{getTopicIcon(topicId)}</span>
                            <h5 className="font-medium text-sm">{title}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                            {canDeleteChapter && (
                                <Trash2
                                    onClick={handleDeleteClick}
                                    className="hover:text-destructive cursor-pointer transition-colors"
                                    size={15}
                                />
                            )}
                            <GripVertical
                                className="text-muted-dark hover:text-muted-dark transition-colors cursor-grab active:cursor-grabbing"
                                onPointerDown={handleDragStart}
                                size={15}
                            />
                        </div>
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


