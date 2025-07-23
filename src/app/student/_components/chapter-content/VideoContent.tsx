import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle2, Youtube, Video as VideoIcon } from 'lucide-react'
import useChapterCompletion from '@/hooks/useChapterCompletion'
import {VideoContentProps} from '@/app/student/_components/chapter-content/componentChapterStudentTypes.ts';


const getEmbedLink = (link: string) => {
    if (!link) return ''
    if (link.includes('youtube.com') || link.includes('youtu.be')) return link
    if (link.includes('drive.google.com')) {
        // Convert Google Drive link to embeddable format
        const match = link.match(/\/d\/([\w-]+)/)
        if (match) {
            return `https://drive.google.com/file/d/${match[1]}/preview`
        }
        return link
    }
    return link
}

const VideoContent: React.FC<VideoContentProps> = ({
    chapterDetails,
    onChapterComplete,
}) => {
    const { courseId, moduleId } = useParams()
    const [isCompleted, setIsCompleted] = useState(
        chapterDetails.status === 'Completed'
    )

    const { isCompleting, completeChapter } = useChapterCompletion({
        courseId: courseId as string,
        moduleId: moduleId as string,
        chapterId: chapterDetails.id.toString(),
        onSuccess: () => {
            setIsCompleted(true)
            onChapterComplete()
        },
    })

    useEffect(() => {
        setIsCompleted(chapterDetails.status === 'Completed')
    }, [chapterDetails.status])

    const videoLinks =
        chapterDetails.links && chapterDetails.links.length > 0
            ? chapterDetails.links
            : chapterDetails.file
            ? [chapterDetails.file]
            : []

    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {chapterDetails.title}
                            </h1>
                            {/* {chapterDetails.description && (
                                <p className="text-muted-foreground text-base mb-1 text-start">
                                    {chapterDetails.description}
                                </p>
                            )} */}
                        </div>
                        <Badge
                            variant="secondary"
                            className={`${
                                chapterDetails.status === 'Completed'
                                    ? 'bg-green-100 text-green-600 hover:bg-green-100'
                                    : 'bg-white text-slate-700 hover:bg-white border border-slate-200'
                            } text-xs font-medium px-2 py-1`}
                        >
                            {chapterDetails.status === 'Completed'
                                ? 'Watched'
                                : 'Not Watched'}
                        </Badge>
                    </div>
                </div>

                {/* Video Player Section */}
                {videoLinks.length > 0 ? (
                    videoLinks.map((link, idx) => {
                        const isYouTube =
                            link[0].includes('youtube.com') ||
                            link[0].includes('youtu.be')
                        const isDrive = link[0].includes('drive.google.com')
                        const embedLink = getEmbedLink(link)
                        return (
                            <div
                                key={link}
                                className="mb-8 bg-card-elevated rounded-lg shadow-16dp overflow-hidden border border-border"
                            >
                                <div className="aspect-video bg-black flex items-center justify-center relative">
                                    {isYouTube ? (
                                        <iframe
                                            src={embedLink[0]}
                                            title="YouTube Video"
                                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full border-none"
                                        />
                                    ) : isDrive ? (
                                        <iframe
                                            src={embedLink[0]}
                                            title="Google Drive Video"
                                            allow="autoplay"
                                            allowFullScreen
                                            className="w-full h-full border-none"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-full text-white">
                                            <VideoIcon className="w-16 h-16 mb-2 opacity-60" />
                                            <p>Unsupported video format</p>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                                        {isYouTube ? (
                                            <Youtube className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <VideoIcon className="w-4 h-4 text-primary" />
                                        )}
                                        <span className="text-xs text-white font-medium">
                                            {isYouTube
                                                ? 'YouTube'
                                                : isDrive
                                                ? 'Google Drive'
                                                : 'Video'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-black rounded-2xl aspect-video flex items-center justify-center shadow-8dp border border-border">
                        <div className="text-center text-white">
                            <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                            <p className="text-lg font-semibold">
                                No Video Content
                            </p>
                            <p className="text-sm opacity-75">
                                Video will appear here when available
                            </p>
                        </div>
                    </div>
                )}

                {/* Mark as Watched Button */}
                {!isCompleted && videoLinks.length > 0 && (
                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={completeChapter}
                            size="lg"
                            disabled={isCompleting}
                            className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover px-8 py-2 rounded-lg"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            {isCompleting
                                ? 'Marking as Watched...'
                                : 'Mark as Watched'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VideoContent
