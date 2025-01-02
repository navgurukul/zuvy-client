'use client'

import React, { useEffect, useState } from 'react'
import { getArticlePreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEditor } from '@tiptap/react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'

const PreviewArticle = ({ params }: { params: any }) => {
    const { articlePreviewContent, setArticlePreviewContent } =
        getArticlePreviewStore()

    const editor = useEditor({
        extensions,
        content: '', // Initialize with empty content
        editable: false,
    })

    useEffect(() => {
        fetchPreviewData(params, setArticlePreviewContent)
    }, [params.chapterId, fetchPreviewData])

    useEffect(() => {
        if (editor && articlePreviewContent?.contentDetails) {
            const contentDetails = articlePreviewContent.contentDetails
            const firstContent = contentDetails?.[0]?.content?.[0] ?? {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'left' },
                    },
                ],
            }
            editor.commands.setContent(firstContent)
        }
    }, [articlePreviewContent, editor])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>

            <div className="flex mt-20 px-8 gap-8">
                {/* Left Section: Go Back Button */}
                <div className="w-1/4 flex flex-col">
                    <Link
                        href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft size={20} />
                        <p className="ml-1 text-sm font-medium text-gray-800">
                            Go back
                        </p>
                    </Link>
                </div>

                {/* Right Section: Editor */}
                <div className="pt-20">
                    <div className="flex flex-col items-start">
                        <h1 className="text-2xl font-semibold text-left">
                            {articlePreviewContent?.title
                                ? articlePreviewContent.title
                                : 'No Title yet'}
                        </h1>
                    </div>

                    <TiptapEditor editor={editor} />
                    <div className="mt-2 text-end">
                        <Button disabled>Mark as Done </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PreviewArticle
