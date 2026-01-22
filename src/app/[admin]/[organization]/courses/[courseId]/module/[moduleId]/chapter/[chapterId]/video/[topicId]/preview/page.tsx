'use client'

import React, { useEffect } from 'react'
import ReactPlayer from 'react-player'
import { getVideoPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Params } from '@/app/[admin]/[organization]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/assignment/[topicId]/preview/TopicIdPageType'
const PreviewVideo = ({ params }: { params: Params }) => {
    const { videoPreviewContent, setVideoPreviewContent } =
        getVideoPreviewStore()

    useEffect(() => {
        fetchPreviewData(params, setVideoPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    return (
        <div className="fixed top-0 left-0 w-full h-screen bg-white overflow-hidden z-40">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-white">
                    You are in the Admin Preview Mode.
                </h1>
            </div>

            {/* Back link */}
            <Link
                href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                className="absolute left-4 top-14 flex items-center space-x-2 z-50"
            >
                <ArrowLeft size={20} />
                <p className="ml-1 mt-2 text-sm font-medium text-gray-800">
                    Go back
                </p>
            </Link>

            {/* Centered Content */}
            <div className="flex flex-col justify-center items-center h-full pt-28 px-4">
                <div className="w-full md:w-[90%] lg:w-[40%] xl:w-[60%] max-w-4xl mb-[50%] xl:mb-10 md:mb-5">
                    <h1 className="text-2xl font-semibold text-gray-700 mb-4 text-left">
                        {videoPreviewContent?.title || 'No Title yet'}
                    </h1>
                    <div className="w-full aspect-video">
                        {videoPreviewContent?.contentDetails?.[0]
                            ?.links?.[0] ? (
                            <ReactPlayer
                                url={
                                    videoPreviewContent.contentDetails[0]
                                        .links[0]
                                }
                                controls
                                width="100%"
                                height="100%"
                            />
                        ) : (
                            <p>No video available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewVideo
