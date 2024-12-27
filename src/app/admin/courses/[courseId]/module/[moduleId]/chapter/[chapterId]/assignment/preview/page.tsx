'use client'

import { useEditor } from '@tiptap/react'
import React from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { getChapterContentState } from '@/store/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {
    courseId: string
    moduleId: string
    chapterId: string
}

const PreviewAssignment: React.FC<Props> = ({
    courseId,
    moduleId,
    chapterId,
}) => {
    const { chapterContent } = getChapterContentState()

    const timestamp = chapterContent?.completionDate
    const date = new Date(timestamp)
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
    }
    const formattedDate = date.toLocaleDateString('en-US', options)

    let editorContent

    if (
        chapterContent?.contentDetails &&
        Array.isArray(chapterContent.contentDetails) &&
        chapterContent.contentDetails.length > 0 &&
        chapterContent.contentDetails[0]?.content &&
        chapterContent.contentDetails[0].content.length > 0
    ) {
        editorContent = chapterContent.contentDetails[0].content[0]
    }

    const editor = useEditor({
        extensions,
        content: editorContent,
        editable: false,
    })
    const router = useRouter()
    function handleBack() {
        router.back()
    }

    return (
        <div>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>
            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                    <ArrowLeft size={20} />
                    <h1 onClick={handleBack} className="text-sm font-medium">
                        Go back
                    </h1>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-semibold text-left">
                    {chapterContent?.title
                        ? chapterContent.title
                        : 'No Title yet'}
                </h1>
                <h1 className="font-semibold">Deadline: {formattedDate}</h1>

                <Button
                    className="gap-x-1 flex items-center"
                    variant={'ghost'}
                ></Button>
            </div>

            <TiptapEditor editor={editor} />
            {/* <div className="mt-2 text-end">
                <Button>Mark as Done</Button>
            </div> */}
        </div>
    )
}

export default PreviewAssignment
