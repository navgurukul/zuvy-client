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
} from 'lucide-react'
import DeleteConfirmationModal from '../../_components/deleteModal'
import { useState } from 'react'
import { DELETE_CHAPTER_CONFIRMATION } from '@/utils/constant'

function ChapterItem({
    title,
    topicId,
    topicName,
    chapterId,
    activeChapter,
    fetchChapterContent,
    fetchChapters,
    moduleId,
}: {
    title: string
    topicId: number
    topicName: string
    chapterId: number
    activeChapter: number
    fetchChapterContent: (chapterId: number) => void
    fetchChapters: () => void
    moduleId: string
}) {
    // states and variables
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
            default:
                return <StickyNote />
        }
    }

    const setActiveChapterItem = () => {
        return activeChapter === chapterId
            ? 'bg-secondary/50 text-primary'
            : 'text-black hover:bg-secondary/20'
    }

    const handleDeleteChapter = async () => {
        const response = await api.delete(
            `/content/deleteChapter/${moduleId}?chapterId=${chapterId}`
        )
        if (response.data) {
            fetchChapters()
        }
    }

    const handleDeleteModal = () => {
        setDeleteModalOpen(true)
    }

    return (
        <div>
            <div
                className={cn(
                    'flex rounded-md p-3  my-1 cursor-pointer justify-between items-center',
                    setActiveChapterItem()
                )}
                onClick={() => {
                    fetchChapterContent(chapterId)
                }}
            >
                <div className="flex gap-2 capitalize">
                    <p>{setTopicIcon()} </p>
                    <p>{title}</p>
                </div>
                <Trash2
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteModal()
                    }}
                    className="hover:text-destructive cursor-pointer"
                    size={15}
                />
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
    )
}

export default ChapterItem
