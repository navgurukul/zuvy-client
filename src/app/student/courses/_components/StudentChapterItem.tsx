import React, { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
    BookOpenText,
    SquareCode,
    FileQuestion,
    PencilLine,
    StickyNote,
    Video,
    BookOpenCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { encryptId } from '@/app/utils'

function StudentChapterItem({
    title,
    topicId,
    chapterId,
    activeChapter,
    setActiveChapter,
    status,
    viewcourses,
    moduleID,
    activeChapterRef,
}: // chapter_id,
{
    title: string
    topicId: number
    chapterId: number
    activeChapter: number
    setActiveChapter: any
    status: string
    viewcourses: any
    moduleID: any
    activeChapterRef: any
    // chapter_id: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const path = pathname.split('/')[1]
    const instructor = pathname?.includes('/instructor')

    console.log('viewcourses in select item', viewcourses)
    console.log('moduleID in select item', moduleID)

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

    console.log('activeChapter', activeChapter)
    console.log('chapterId', chapterId)
    const encryptedChapterID = encryptId(chapterId)
    return (
        <div ref={chapterId === activeChapter ? activeChapterRef : null}>
            <Link
                // key={id}
                href={
                    instructor
                        ? `/instructor/courses/${viewcourses}/modules/${moduleID}/chapters/${encryptedChapterID}`
                        : `/student/courses/${viewcourses}/modules/${moduleID}/chapters/${encryptedChapterID}`
                }
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
            </Link>
        </div>
    )
}

export default StudentChapterItem
