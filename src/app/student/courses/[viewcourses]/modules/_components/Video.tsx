import YouTubePlayer from '@/app/_components/videoPlayer'
import { Button } from '@/components/ui/button'
import { getEmbedLink } from '@/utils/admin'
import React from 'react'

function Video({
    content,
    completeChapter,
}: {
    content: any
    completeChapter: () => void
}) {
    const modifiedLink: any = content.links ? (
        getEmbedLink(content?.links[0])
    ) : (
        <h1>No Content Yet</h1>
    )

    return (
        <div className="w-full max-w-full sm:max-w-[740px] md:max-w-[900px] lg:max-w-[900px] mx-auto h-auto aspect-w-16 aspect-h-9 rounded-[16px] mt-20">
            <p className="text-start mb-4 text-xl font-semibold">
                {content?.description}
            </p>
            {content.links?.map((link: string) => {
                const isGdriveVideo = link.includes('drive') ? (
                    <iframe
                        key={link}
                        className="w-full rounded-lg h-[70vh] border-4 border-transparent hover:border-secondary transition-all duration-300"
                        src={modifiedLink}
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
                        {link.includes('drive') && (
                            <div className="w-full flex items-end justify-end mt-5">
                                <Button onClick={completeChapter}>
                                    Mark as Done
                                </Button>
                            </div>
                        )}
                    </>
                )
            })}
            {!content.links && <h1>There is no video content created yet!</h1>}
        </div>
    )
}

export default Video