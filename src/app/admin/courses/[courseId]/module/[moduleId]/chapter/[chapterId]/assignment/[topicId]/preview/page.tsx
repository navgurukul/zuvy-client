'use client'

import React, { useEffect, useState } from 'react'
import { getAssignmentPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

type EditorDoc = {
    type: string
    content: any[]
}

const PreviewAssignment = ({ params }: { params: any }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isPdfPreview = searchParams.get('pdf') === 'true'
    const { assignmentPreviewContent, setAssignmentPreviewContent } =
        getAssignmentPreviewStore()
    const [initialContent, setInitialContent] = useState<
        { doc: EditorDoc } | undefined
    >()

    const timestamp = assignmentPreviewContent?.completionDate
    const date = new Date(timestamp)

    const options: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
    }
    const options2: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const formattedDate = date.toLocaleDateString('en-US', options)

    useEffect(() => {
        fetchPreviewData(params, setAssignmentPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    useEffect(() => {
        if (assignmentPreviewContent?.contentDetails) {
            const contentDetails = assignmentPreviewContent.contentDetails
            const firstContent = contentDetails?.[0]?.content?.[0] ?? {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'No content has been added yet',
                            },
                        ],
                    },
                ],
            }
            if (
                contentDetails?.[0]?.content?.[0] &&
                typeof firstContent === 'string'
            ) {
                setInitialContent(JSON.parse(firstContent))
            } else {
                const jsonData = { doc: firstContent }
                setInitialContent(jsonData)
            }
        }
    }, [assignmentPreviewContent])

    // Get PDF link if available
    const pdfLink =
        assignmentPreviewContent?.contentDetails?.[0]?.links?.[0] || null

    const goBack = () => {
        router.push(
            `/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`
        )
    }

    return (
        <div className="">
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>

            <div className="flex mt-14 px-8 gap-8">
                {/* Left Section: Go Back Button */}
                <div className="w-1/4 flex flex-col">
                    <Button variant={'ghost'} onClick={goBack}>
                        <ArrowLeft size={20} />
                        <p className="ml-1 text-sm font-medium text-gray-800">
                            Go back
                        </p>
                    </Button>
                </div>

                {/* Right Section: Editor */}
                <div className="pt-12 w-[395%] text-gray-600">
                    <div className="flex justify-between">
                        <div className="flex flex-col items-start mb-3">
                            <h1 className="text-2xl font-semibold text-left">
                                {assignmentPreviewContent?.title
                                    ? assignmentPreviewContent.title
                                    : 'No Title yet'}
                            </h1>
                            <h1 className="font-semibold text-[15px]">
                                Deadline: {formattedDate}
                            </h1>
                        </div>
                        <div className="mt-2 text-end">
                            <Button disabled>Submit</Button>
                        </div>
                    </div>

                    {/* PDF Preview */}
                    {isPdfPreview && pdfLink ? (
                        <div className="mt-2 text-start">
                            <iframe
                                src={pdfLink}
                                width="100%"
                                height="800"
                                title="PDF Preview"
                                className="border rounded"
                            />
                        </div>
                    ) : (
                        <div className="mt-2 text-start">
                            <RemirrorTextEditor
                                initialContent={initialContent}
                                setInitialContent={setInitialContent}
                                preview={true}
                            />
                        </div>
                    )}
                    <div className="mt-2">
                        <div className="flex items-center">
                            <Link className="mr-2 h-4 w-4" />
                            <Input
                                placeholder="Paste your Assignment Link Here"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewAssignment
