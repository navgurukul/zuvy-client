// components/YouTubePlayer.tsx
import React from 'react'
import ReactPlayer from 'react-player/youtube'
import{YouTubePlayerProps} from "@/app/_components/videoPlayer/componentVideoType"
const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
    url,
    completeChapter,
    status,
}) => {
    const isCompleted = status === 'Completed'
    return (
        <div
            style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                position: 'relative',
                paddingTop: '56.25%',
            }}
        >
            <ReactPlayer
                url={url}
                controls={isCompleted}
                onEnded={() => completeChapter()}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
            />
        </div>
    )
}

export default YouTubePlayer
