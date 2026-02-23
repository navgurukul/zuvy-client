import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import React from 'react'
import ReactPlayer from 'react-player'
import { PreviewProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/module/_components/video/ModuleVideoType'

const PreviewVideo = ({ content, setShowPreview }: PreviewProps) => {
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full flex items-start">
                <div className="flex flex-col items-start">
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
            </div>
            <div className="relative w-[70%] aspect-video flex justify-center items-center">
                {content?.contentDetails?.length > 0 &&
                content?.contentDetails[0]?.links?.length > 0 ? (
                    <ReactPlayer
                        url={content.contentDetails[0].links[0]}
                        controls={true}
                        width="100%"
                        height="100%"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                    />
                ) : (
                    <p>No video available</p> // Show a fallback message if the content is not available
                )}
            </div>
        </div>
    )
}

export default PreviewVideo
