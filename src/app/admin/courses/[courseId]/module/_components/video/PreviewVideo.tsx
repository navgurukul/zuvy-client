import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import React from 'react'
import ReactPlayer from 'react-player'

type Props = {
    content: any
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}

const PreviewVideo = ({ content, setShowPreview }: Props) => {
    return (
        <div className="w-full flex items-start">
            <div className="flex  flex-col items-start">
                <h1 className="text-2xl font-semibold text-left">
                    {content?.title ? content.title : 'No Title yet'}
                </h1>
                <Button
                    onClick={() => setShowPreview(false)}
                    className="gap-x-1 flex items-center"
                    variant={'ghost'}
                >
                    <X className="text-red-400" size={15} />
                    <h1 className="text-red-400">Close Preview</h1>
                </Button>
            </div>
            <ReactPlayer
                url={content?.contentDetails[0].links[0]}
                controls={true}
                // onEnded={() => completeChapter()}
                width="70%"
                height="80%"
                style={{
                    position: 'absolute',
                    top: '25%',
                    left: '28%',
                }}
            />
        </div>
    )
}

export default PreviewVideo
