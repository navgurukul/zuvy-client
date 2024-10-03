import React from 'react'

const VideoEmbed = ({ src, title }: { src: any; title: string }) => {
    return (
        <div>
            <iframe
                className="w-[420px] rounded-lg h-[200px] border-4 border-transparent hover:border-secondary transition-all duration-300"
                title={title}
                src={src}
                frameBorder="0"
                allowFullScreen
            ></iframe>
        </div>
    )
}

export default VideoEmbed
