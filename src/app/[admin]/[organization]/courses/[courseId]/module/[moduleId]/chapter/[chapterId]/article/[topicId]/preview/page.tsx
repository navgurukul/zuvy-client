'use client'

import React, { useEffect, useState } from 'react'
import { getArticlePreviewStore, getUser } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import { useSearchParams, usePathname } from 'next/navigation'
import {
    PageEditorDoc,
    PageParams,
} from '@/app/[admin]/[organization]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/article/moduleIdArticalPageType'

const PreviewArticle = ({ params }: { params: PageParams }) => {
    const [initialContent, setInitialContent] = useState<
        { doc: PageEditorDoc } | undefined
    >()
    const searchParams = useSearchParams()
    const isPdf = searchParams.get('pdf') === 'true'
    const { articlePreviewContent, setArticlePreviewContent } =
        getArticlePreviewStore()

    const [link, setlink] = useState('')
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    useEffect(() => {
        fetchPreviewData(params, setArticlePreviewContent)
    }, [params.chapterId, fetchPreviewData])

    useEffect(() => {
        if (articlePreviewContent?.contentDetails) {
            const contentDetails = articlePreviewContent.contentDetails
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
            if (typeof firstContent === 'string') {
                setInitialContent(JSON.parse(firstContent))
            } else {
                const jsonData = { doc: firstContent }
                setInitialContent(jsonData)
            }
        }
    }, [articlePreviewContent])

    const pdfLink =
        articlePreviewContent?.contentDetails?.[0]?.links?.[0] || null

    return (
        <div className="">
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>
            {!isPdf ? (
                <div className="flex mt-20 px-8 gap-8">
                    {/* Left Section: Go Back Button */}
                    <div className="w-1/4 flex flex-col">
                        <Link
                            href={`/${userRole}/${orgName}/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft size={20} />
                            <p className="ml-1 text-sm font-medium text-gray-800">
                                Go back
                            </p>
                        </Link>
                    </div>

                    {/* Right Section: Editor */}
                    <div className="pt-20 w-[395%]">
                        <div className="flex flex-col items-start">
                            <h1 className="text-2xl font-semibold text-left">
                                {articlePreviewContent?.title
                                    ? articlePreviewContent.title
                                    : 'No Title yet'}
                            </h1>
                        </div>

                        <div className="mt-2 text-start">
                            <RemirrorTextEditor
                                initialContent={initialContent}
                                setInitialContent={setInitialContent}
                                preview={true}
                            />
                        </div>
                        <div className="mt-2 text-end">
                            <Button className="bg-[#518672]" disabled>
                                Mark as Done{' '}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-start w-full h-full justify-center">
                    <Link
                        href={`/${userRole}/${orgName}/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                        className="flex items-center mt-10 my-3"
                    >
                        <ArrowLeft size={20} />
                        <p className="ml-1 text-sm font-medium text-gray-800">
                            Go back
                        </p>
                    </Link>
                    {pdfLink ? (
                        <iframe
                            src={pdfLink}
                            width="100%"
                            height="800"
                            title="PDF Preview"
                            className="border rounded"
                        />
                    ) : (
                        <div className="mt-4 p-4 border rounded bg-gray-50">
                            <p>No PDF available for preview</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PreviewArticle
