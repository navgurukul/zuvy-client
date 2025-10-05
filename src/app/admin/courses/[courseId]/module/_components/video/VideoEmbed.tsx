import React from 'react'

const VideoEmbed = ({ src, title }: { src: any; title: string }) => {
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
