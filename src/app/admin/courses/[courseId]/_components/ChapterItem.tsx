import { cn } from '@/lib/utils'
import {
    Code,
    FileQuestion,
    PencilLine,
    ScrollText,
    StickyNote,
    Trash2,
    Video,
} from 'lucide-react'

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
    const setTopicIcon = () => {
        switch (topicId) {
            case 1:
                return <Video />
            case 2:
                return <ScrollText />
            case 3:
                return <Code />
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
            ? 'bg-muted-foreground text-white'
            : 'bg-muted text-black hover:bg-muted-foreground/50'
    }

    return (
        <>
            <div
                className={cn(
                    'flex rounded-md p-3  my-1 cursor-pointer justify-between items-center',
                    setActiveChapterItem()
                )}
                onClick={() => fetchChapterContent(chapterId)}
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
        </>
    )
}

export default ChapterItem
