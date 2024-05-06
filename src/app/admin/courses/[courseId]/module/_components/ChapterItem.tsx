import { cn } from '@/lib/utils'
import { getDeleteStudentStore } from '@/store/store'
import {
    BookOpenText,
    SquareCode,
    FileQuestion,
    PencilLine,
    StickyNote,
    Trash2,
    Video,
} from 'lucide-react'
import { boolean } from 'zod'

function ChapterItem({
    title,
    topicId,
    topicName,
    chapterId,
    activeChapter,
    fetchChapterContent,
}: {
    title: string
    topicId: number
    topicName: string
    chapterId: number
    activeChapter: number
    fetchChapterContent: (chapterId: number) => void
}) {
    const { setDeleteModalOpen, isDeleteModalOpen } = getDeleteStudentStore()

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
                <div className="flex gap-2">
                    <p>{setTopicIcon()} </p>
                    <p>{title}</p>
                </div>
                <Trash2
                    onClick={() => {
                        // handleTrashClick()
                    }}
                    className="hover:text-destructive cursor-pointer"
                    size={15}
                />
            </div>
        </div>
    )
}

export default ChapterItem
