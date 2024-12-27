import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import ReactPlayer from 'react-player'

type Props = {
    content: any
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
    courseId: any
    moduleId: any
    chapterId: any
}

const PreviewVideo = ({
    content,
    setShowPreview,
    chapterId,
    courseId,
    moduleId,
}: Props) => {
    return (
        <div>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>
            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                {/* "Go Back" button */}
                <Link
                    href={`/admin/courses/${courseId}/module/${moduleId}/chapter/${chapterId}`}
                    className="absolute left-4 top-4 flex items-center space-x-2 p-2 text-gray-800 hover:text-gray-600"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Go back</span>
                </Link>
            </div>

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
                        ></Button>
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
        </div>
    )
}

export default PreviewVideo
