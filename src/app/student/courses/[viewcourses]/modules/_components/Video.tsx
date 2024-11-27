import YouTubePlayer from '@/app/_components/videoPlayer'
import { Button } from '@/components/ui/button'
import React from 'react'

function Video({
    content,
    completeChapter,
}: {
    content: any
    completeChapter: () => void
}) {
    return (
            <div className="w-full max-w-full sm:max-w-[740px] md:max-w-[900px] lg:max-w-[900px] mx-auto h-auto aspect-w-16 aspect-h-9 rounded-[16px]">
            <p className="text-start mb-4 text-xl font-semibold">
                {content?.description}
            </p>
                {content.links?.map((link: string) => (
                    <YouTubePlayer
                        url={link}
                        key={link}
                        completeChapter={completeChapter}
                        status={content?.status}
                    />
                ))}
            </div>
    )
}

export default Video
