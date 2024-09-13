import YouTubePlayer from '@/app/_components/videoPlayer'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'

function Video({
    content,
    completeChapter,
}: {
    content: any
    completeChapter: () => void
}) {
    return (
        <div>
            <p className="text-start mb-2 text-xl font-semibold">
                {content.description}
            </p>
            {content.links?.map((link: string) => (
                <YouTubePlayer
                    url={link}
                    key={link}
                    completeChapter={completeChapter}
                />
            ))}
        </div>
    )
}

export default Video
