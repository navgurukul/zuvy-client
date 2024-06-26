import { cn } from '@/lib/utils'
import {
    BookOpenText,
    SquareCode,
    FileQuestion,
    PencilLine,
    StickyNote,
    Video,
} from 'lucide-react'

function StudentChapterItem({
    title,
    topicId,
    chapterId,
    activeChapter,
    fetchChapterContent,
    status,
}: {
    title: string
    topicId: number
    chapterId: number
    activeChapter: number
    fetchChapterContent: (chapterId: number) => void
    status: string
}) {
    // states and variables
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

    // async

    // useEffect(() => {
    //     fetchChapterContent(chapterId)
    // }, [activeChapter])

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
                <div className="flex gap-2 text-start capitalize">
                    <p>{setTopicIcon()} </p>
                    <p>{title}</p>
                </div>
                <div>
                    {status === 'Pending' ? null : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-circle-check-big text-primary"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <path d="m9 11 3 3L22 4" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudentChapterItem
