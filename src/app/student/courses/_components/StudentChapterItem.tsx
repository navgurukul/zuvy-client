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

function StudentChapterItem({
    title,
    topicId,
    chapterId,
    activeChapter,
    setActiveChapter,
    fetchChapterContent,
    status,
    viewcourses,
    moduleID,
}: {
    title: string
    topicId: number
    chapterId: number
    activeChapter: number
    setActiveChapter: any
    fetchChapterContent: (chapterId: number) => void
    status: string
    viewcourses: any
    moduleID: any
}) {
    const router = useRouter()
    const pathname = usePathname()
    const path = pathname.split('/')[1]

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

    // async

    // useEffect(() => {
    //     // fetchChapterContent(chapterId)
    //     if (activeChapter === chapterId) {
    //         router.push(
    //             `/student/courses/${viewcourses}/modules/${moduleID}/chapters/${chapterId}`
    //         )

    //         setActiveChapter(chapterId)
    //     }
    // }, [chapterId])

    return (
        <div>
            {/* <Link
            // key={id}
            href={`/student/courses/${viewcourses}/modules/${moduleID}/chapters/${chapterId}`}
            // className={`bg-gradient-to-bl my-3 p-3 rounded-xl flex flex-col md:flex-row ${
            //     typeId === 1
            //         ? !isLock
            //             ? 'from-blue-50 to-violet-50'
            //             : 'from-blue-50 to-violet-50 pointer-events-none opacity-50'
            //         : isLock
            //         ? 'bg-yellow/30'
            //         : 'bg-yellow/50'
            // }`}
        > */}
            <div
                className={cn(
                    'flex rounded-md p-3  my-1 cursor-pointer justify-between items-center',
                    setActiveChapterItem()
                )}
                onClick={() => {
                    console.log('chapterId sending to fetchChapterContent', chapterId)
                    fetchChapterContent(chapterId)
                    router.push(
                        `/${path}/courses/${viewcourses}/modules/${moduleID}/chapters/${chapterId}`
                    )
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
            {/* </Link> */}
        </div>
    )
}

export default StudentChapterItem
