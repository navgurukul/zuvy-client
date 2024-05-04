import React from 'react'

const VideoEmbed = ({ src, title }: { src: any; title: string }) => {
    return (
        <div>
            <iframe
                className="w-[400px] h-[200px]"
                title={title}
                src={src}
                frameBorder="0"
                allowFullScreen
            ></iframe>
        </div>
    )
}

export default VideoEmbed
