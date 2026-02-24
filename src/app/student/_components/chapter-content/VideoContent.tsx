import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle2, Youtube, Video as VideoIcon } from 'lucide-react'
import useChapterCompletion from '@/hooks/useChapterCompletion'
import ReactPlayer, { ReactPlayerProps } from 'react-player'
import { getEmbedLink } from '@/utils/students'
import { VideoContentProps } from '@/app/student/_components/chapter-content/componentChapterType'
import { ScrollArea } from '@/components/ui/scroll-area'
import useWindowSize from '@/hooks/useHeightWidth'
import { useVideoStore } from '@/store/store'

import { VideoSkeleton } from "@/app/student/_components/Skeletons";

function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return match ? match[1] : url // fallback to full URL if no match
}
const VideoContent: React.FC<VideoContentProps> = ({
    chapterDetails,
    onChapterComplete,
    refetch,
}) => {
    const { courseId, moduleId } = useParams()
    const playerRef = useRef<ReactPlayer>(null)
    const { progress, setProgress } = useVideoStore()
    const [playing, setPlaying] = useState(false)
    const [loading, setLoading] = useState(true);
    const { width } = useWindowSize()
    const isMobile = width < 768
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
        // Reset completion ref when chapter changes
        hasCompletedRef.current = false
    }, [chapterDetails.status])

    const videoLinks =
        chapterDetails.links && chapterDetails.links.length > 0
            ? chapterDetails.links
            : chapterDetails.file
                ? [chapterDetails.file]
                : []
    const flatLinks = videoLinks.flat()
    const isYouTubeandZoom =
        flatLinks.some(
            (link) => link.includes('youtube.com') || link.includes('youtu.be')
        ) ||
        flatLinks.some(
            (link) => link.includes('zoom.us') || link.includes('zoom')
        )

    // const youtubeId = isYouTube ? getYoutubeId(flatLinks[0]) : '';
    const savedTime = isYouTubeandZoom
        ? progress[chapterDetails.id.toString()] || 0
        : 0
    const handleReady = useCallback(() => {
        if (savedTime && playerRef.current) {
            playerRef.current.seekTo(savedTime, 'seconds')
        }
        setPlaying(true)
    }, [savedTime, setPlaying, playerRef])

    // Throttle saving progress every 2 seconds
    const lastSaveRef = useRef<number>(0)
    const hasCompletedRef = useRef(false)

    const handleProgress: ReactPlayerProps['onProgress'] = useCallback(
        (state: any) => {
            const now = Date.now()
            // Save progress every 2 seconds
            if (now - lastSaveRef.current > 2000) {
                setProgress(chapterDetails.id.toString(), state.playedSeconds)
                lastSaveRef.current = now
            }

            // Call completeChapter when 75% is reached (only once)
            if (
                !isCompleted &&
                !hasCompletedRef.current &&
                state.played >= 0.75
            ) {
                hasCompletedRef.current = true
                completeChapter()
                refetch()
            }
        },
        [
            chapterDetails.id,
            setProgress,
            completeChapter,
            isCompleted,
            refetch,
        ]
    )


    useEffect(() => {
        if (chapterDetails) {
            setLoading(false)
        }
    }, [chapterDetails])


    if (loading) {
        return <VideoSkeleton />;
    }


    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
            <div className="max-w-4xl mx-auto">
                <ScrollArea className={`${isMobile ? 'h-[75vh]' : 'h-[80vh]'}`}>
                    <div className="flex flex-col space-y-2 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl text-left font-extrabold">
                                    {chapterDetails.title}
                                </h1>
                                {chapterDetails.description && (
                                    <p className="text-muted-foreground text-base mt-6 text-start">
                                        {chapterDetails.description}
                                    </p>
                                )}
                            </div>
                            <Badge
                                variant="secondary"
                                className={`${isCompleted
                                        ? 'bg-green-100 text-green-600 hover:bg-green-100'
                                        : 'bg-white text-slate-700 hover:bg-white border border-slate-200'
                                    } text-xs font-medium px-2 py-1 mb-5`}
                            >
                                {isCompleted ? 'Watched' : 'Not Watched'}
                            </Badge>
                        </div>
                    </div>

                    {videoLinks.length > 0 ? (
                        videoLinks.map((link, idx) => {
                            const isYouTube =
                                link[0].includes('youtube.com') ||
                                link[0].includes('youtu.be')
                            const isDrive = link[0].includes('drive.google.com')
                            const isZoom = link[0].includes('zoom.us')
                            const embedLink = getEmbedLink(link)
                            return (
                                <div
                                    key={`${idx}-${link[0]}`}
                                    className="mb-8 bg-card-elevated rounded-lg shadow-16dp overflow-hidden border border-border"
                                >
                                    <div className="aspect-video bg-black flex items-center justify-center relative">
                                        {isYouTube ? (
                                            <ReactPlayer
                                                ref={playerRef}
                                                url={embedLink[0]}
                                                playing={playing}
                                                controls={isCompleted}
                                                width="100%"
                                                height="100%"
                                                onReady={handleReady}
                                                onProgress={handleProgress}


                                            // onEnded={() => completeChapter()}
                                            />
                                        ) : isDrive ? (
                                            <iframe
                                                src={embedLink[0]}
                                                title="Google Drive Video"
                                                allow="autoplay"
                                                allowFullScreen
                                                className="w-full h-full border-none"
                                            />
                                        ) : isZoom ?
                                            <ReactPlayer
                                                ref={playerRef}
                                                url={embedLink[0]}
                                                playing={playing}
                                                controls={isCompleted}
                                                width="100%"
                                                height="100%"
                                                // onReady={handleReady}
                                                onProgress={handleProgress}


                                            // onEnded={() => completeChapter()}
                                            />
                                            : (
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
                    {/* Video Player Section */}

                    {/* Mark as Watched Button */}
                    {!isCompleted &&
                        videoLinks.length > 0 &&
                        !isYouTubeandZoom && (
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
                </ScrollArea>
            </div>
        </div>
    )
}

export default VideoContent




