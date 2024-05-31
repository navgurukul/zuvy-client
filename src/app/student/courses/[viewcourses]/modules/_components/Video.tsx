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
    console.log('first', content)
    return (
        <div>
            <p className="text-start mb-2 text-xl font-semibold">
                {content.description}
            </p>
            {content.links?.map((link: string) => (
                <YouTubePlayer url={link} key={link} />
            ))}
            <div className="mt-2 text-end">
                <Button onClick={completeChapter}>Mark as Done</Button>
            </div>
        </div>
    )
}

export default Video
