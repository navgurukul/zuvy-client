// components/YouTubePlayer.tsx
import { tree } from 'next/dist/build/templates/app-page'
import React from 'react'
import ReactPlayer from 'react-player/youtube'

interface YouTubePlayerProps {
    url: string
    completeChapter: any
    status: string
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
    url,
    completeChapter,
    status,
}) => {
    const isCompleted = status === 'Completed'
    console.log(isCompleted)
    return (
        <div
            style={{
                maxWidth: '100%',
                maxHeight: '100%',
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
