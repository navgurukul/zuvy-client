import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    Code,
    FileQuestion,
    PencilLine,
    ScrollText,
    StickyNote,
    Video,
} from 'lucide-react'
import React from 'react'

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
            ? 'bg-secondary text-white'
            : 'bg-muted text-black'
    }

    return (
        <>
            <div
                className={cn(
                    'flex rounded-l-md p-2 gap-2 my-1 cursor-pointer',
                    setActiveChapterItem()
                )}
                onClick={() => fetchChapterContent(chapterId)}
            >
                <p>{setTopicIcon()} </p>
                <p>{title}</p>
            </div>
            {/* <Separator /> */}
        </>
    )
}

export default ChapterItem
