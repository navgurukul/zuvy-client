'use client'

import React, { useEffect } from 'react'
import { getVideoPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PreviewForm = ({ params }: { params: any }) => {
    const { videoPreviewContent, setVideoPreviewContent } =
        getVideoPreviewStore()

    useEffect(() => {
        fetchPreviewData(params, setVideoPreviewContent)
    }, [params.chapterId, fetchPreviewData])
    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>
            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                <Link
                    href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                    className="absolute left-0 top-0 flex items-center space-x-2 p-4"
                >
                    {' '}
                    {/* Absolute positioning */}
                    <ArrowLeft size={20} />
                    <p className="ml-1 text-sm font-medium text-gray-800">
                        Go back
                    </p>
                </Link>
            </div>
        </>
    )
}

export default PreviewForm
