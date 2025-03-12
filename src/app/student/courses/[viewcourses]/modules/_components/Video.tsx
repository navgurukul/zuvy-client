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
    console.log(content.links)
    return (
        <div>
            <p className="text-start mb-2 text-xl font-semibold">
                {content?.description}
            </p>
            {content.links?.map((link: string) => {
                const isGdriveVideo = link.includes('drive') ? (
                    <iframe
                        key={link}
                        className="w-full rounded-lg h-[80vh] border-4 border-transparent hover:border-secondary transition-all duration-300"
                        src={link}
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <YouTubePlayer
                        url={link}
                        key={link}
                        completeChapter={completeChapter}
                        status={content?.status}
                    />
                )
                return (
                    <>
                        {isGdriveVideo}
                        <div className="w-full flex items-end justify-end mt-5">
                            <Button onClick={completeChapter}>
                                Mark as Done
                            </Button>
                        </div>
                    </>
                )
            })}
        </div>
    )
}

export default Video