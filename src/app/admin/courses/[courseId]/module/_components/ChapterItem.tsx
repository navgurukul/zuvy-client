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
} from 'lucide-react'
import DeleteConfirmationModal from '../../_components/deleteModal'
import { useState } from 'react'
import { DELETE_CHAPTER_CONFIRMATION } from '@/utils/constant'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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
}: {
    title: string
    topicId: number
    topicName: string
    chapterId: number
    activeChapter: number
    setActiveChapter: any
    fetchChapters: () => void
    moduleId: string
    activeChapterRef: any
    isChapterClickedRef: any
}) {
    // states and variables
    const { courseId } = useParams()
    const router = useRouter()
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

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
            default:
                return <StickyNote />
        }
    }

    const setActiveChapterItem = () => {
        return activeChapter === chapterId
            ? 'bg-secondary/50 text-primary'
            : 'text-black hover:bg-secondary/20'
    }

    const handleClick = () => {
        setActiveChapter(chapterId) // Set the active chapter in the parent component
    }

    const handleDeleteChapter = async () => {
        try {
            await api
                .delete(
                    `/content/deleteChapter/${moduleId}?chapterId=${chapterId}`
                )
                .then((res) => {
                    toast({
                        title: res.data.title,
                        description: res.data.message,
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                    fetchChapters()
                })
                .catch((error) => {
                    toast({
                        title: error.data.title,
                        description: error.data.message,
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                    })
                })
        } catch (error) {
            console.error('Error handling delete chapter:', error)
        }
    }

    const handleDeleteModal = () => {
        setDeleteModalOpen(true)
    }

    return (
        <div ref={chapterId === activeChapter ? activeChapterRef : null}>
            <Link
                href={`/admin/courses/${courseId}/module/${moduleId}/chapters/${chapterId}`}
            >
                <div
                    className={cn(
                        'flex rounded-md p-3  my-1 cursor-pointer justify-between items-center',
                        setActiveChapterItem()
                    )}
                    onClick={() => {
                        handleClick()
                    }}
                >
                    <div className="flex gap-2 capitalize">
                        <p>{setTopicIcon()} </p>
                        <p>{title}</p>
                    </div>
                    <div className="flex">
                        <Trash2
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteModal()
                            }}
                            className="hover:text-destructive cursor-pointer"
                            size={15}
                        />
                        <GripVertical size={15} />
                    </div>
                </div>
            </Link>
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
    )
}

export default ChapterItem
