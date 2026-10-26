import React from 'react'
import ReactPlayer from 'react-player/youtube'
import { isYouTubeLink } from '@/utils/admin'

const VideoEmbed = ({
    src,
    title,
    onDuration,
}: {
    src: string
    title: string
    onDuration?: (duration: number) => void
}) => {
    if (isYouTubeLink(src)) {
        return (
            <div>
                <ReactPlayer
                    className="w-[780px] rounded-lg h-[450px] border-4 border-transparent hover:border-[rgb(81,134,114)] transition-all duration-300"
                    url={src}
                    title={title}
                    controls
                    width="780px"
                    height="450px"
                    onDuration={onDuration}
                />
            </div>
        )
    }

    return (
        <div>
            <iframe
                className="w-[780px] rounded-lg h-[450px] border-4 border-transparent hover:border-[rgb(81,134,114)] transition-all duration-300"
                title={title}
                src={src}
                frameBorder="0"
                allowFullScreen
            ></iframe>
        </div>
    )
}

export default VideoEmbed