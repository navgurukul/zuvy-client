'use client'

import React, { useEffect } from 'react'
import ReactPlayer from 'react-player'
import { getVideoPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PreviewVideo = ({ params }: { params: any }) => {
    const { videoPreviewContent, setVideoPreviewContent } =
        getVideoPreviewStore()

    useEffect(() => {
        fetchPreviewData(params, setVideoPreviewContent)
    }, [params.chapterId, fetchPreviewData])
    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
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
                <div className="w-full flex flex-col items-center justify-center">
                    <div className="w-[70%] aspect-video justify-center items-center">
                        <div className="flex flex-col items-start mb-5">
                            <h1 className="text-2xl font-semibold text-left">
                                {videoPreviewContent?.title
                                    ? videoPreviewContent.title
                                    : 'No Title yet'}
                            </h1>
                        </div>
                        {videoPreviewContent?.contentDetails?.length > 0 &&
                        videoPreviewContent?.contentDetails[0]?.links?.length >
                            0 ? (
                            <ReactPlayer
                                url={
                                    videoPreviewContent.contentDetails[0]
                                        .links[0]
                                }
                                controls={true}
                                width="100%"
                                height="100%"
                                // style={{
                                //     position: 'absolute',
                                //     top: 0,
                                //     left: 0,
                                // }}
                            />
                        ) : (
                            <p>No video available</p> // Show a fallback message if the content is not available
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default PreviewVideo
