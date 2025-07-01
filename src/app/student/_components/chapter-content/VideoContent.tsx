'use client'

import React from 'react'
import YouTubePlayer from '@/app/_components/videoPlayer'
import { Button } from '@/components/ui/button'
import { getEmbedLink } from '@/utils/admin'
import useWindowSize from '@/hooks/useHeightWidth'
import { Badge } from '@/components/ui/badge'

interface VideoContentProps {
    chapterDetails: {
        id: number
        title: string
        description: string | null
        status: string
        file: string | null
        links: string[] | null
        duration?: string
    }
}

const VideoContent: React.FC<VideoContentProps> = ({ chapterDetails }) => {
    const { width } = useWindowSize()
    const isMobile = width < 768

    const modifiedLink = chapterDetails.links
        ? getEmbedLink(chapterDetails.links[0])
        : null

    const completeChapter = () => {
        console.log('Chapter completed:', chapterDetails.id)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {chapterDetails.title}
                    </h1>
                    <Badge
                        variant="secondary"
                        className={`${
                            chapterDetails.status === 'Completed'
                                ? 'bg-green-100 text-green-600 hover:bg-green-100'
                                : 'bg-white text-slate-700 hover:bg-white border border-slate-200'
                        } text-xs font-medium px-2 py-1`}
                    >
                        {chapterDetails.status === 'Completed'
                            ? 'Watched'
                            : 'Not Watched'}
                    </Badge>
                </div>
            </div>

            <div className="w-auto md:max-w-[900px] lg:max-w-[900px] h-auto aspect-w-16 aspect-h-9 rounded-[16px] mt-8 sm:mx-auto mr-4">
                {/* <p
                    key={chapterDetails?.description}
                    className={`text-start mb-4 ${
                        isMobile ? 'text-base' : 'text-xl'
                    } font-semibold`}
                >
                    {chapterDetails?.description}
                </p> */}

                {chapterDetails.links?.map((link: string) => {
                    const isGdriveVideo = link.includes('drive')

                    return (
                        <React.Fragment key={link}>
                            {isGdriveVideo ? (
                                <iframe
                                    className={`w-full rounded-lg ${
                                        isMobile ? 'h-[30vh]' : 'h-[70vh]'
                                    } border-4 border-transparent hover:border-secondary transition-all duration-300`}
                                    src={modifiedLink || ''}
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <YouTubePlayer
                                    url={link}
                                    completeChapter={completeChapter}
                                    status={chapterDetails?.status}
                                />
                            )}

                            {isGdriveVideo &&
                                chapterDetails.status !== 'Completed' && (
                                    <div className="w-full flex items-end justify-end mt-5">
                                        <Button onClick={completeChapter}>
                                            Mark as Done
                                        </Button>
                                    </div>
                                )}
                        </React.Fragment>
                    )
                })}

                {!chapterDetails.links && (
                    <div className="flex items-center justify-center h-full">
                        <h1 className="text-xl font-semibold text-gray-500">
                            There is no video content created yet!
                        </h1>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VideoContent
