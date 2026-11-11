import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle2, Youtube, Video as VideoIcon } from 'lucide-react'
import useChapterCompletion from '@/app/student/hooks/useChapterCompletion'
import ReactPlayer, { ReactPlayerProps } from 'react-player'
import { getEmbedLink } from '@/utils/students'
import { VideoContentProps } from '@/app/student/_components/chapter-content/componentChapterType'
import { ScrollArea } from '@/components/ui/scroll-area'
import useWindowSize from '@/hooks/useHeightWidth'
import { useVideoStore } from '@/store/store'
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { CAREER_TOUR_BOOTCAMP_IDS } from '@/lib/utils'

import { VideoSkeleton } from "@/app/student/_components/Skeletons";
import { CAREER_TOUR_BOOTCAMP_IDS } from '@/lib/utils'

const DURATION_OVERRIDE_BOOTCAMP_IDS = ['136', '135', '134', '133', '132', '131', '130', '129'];

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
    const [showFeedbackReminder, setShowFeedbackReminder] = useState(false)
    const hasShownFeedbackReminderRef = useRef<string | null>(null)
    const hasCompletedRef = useRef(false)
    const keepVideoPausedRef = useRef(false)
    const isBootcampVideoOverride = DURATION_OVERRIDE_BOOTCAMP_IDS.includes(String(courseId))
    // const [showFeedbackReminder, setShowFeedbackReminder] = useState(false)
    // const hasShownFeedbackReminderRef = useRef<string | null>(null)

    // const { isCompleting, completeChapter } = useChapterCompletion({
    //     courseId: courseId as string,
    //     moduleId: moduleId as string,
    //     chapterId: chapterDetails.id.toString(),
    //     onSuccess: () => {
    //         setIsCompleted(true)
    //         onChapterComplete()
    //     },
    // })

    useEffect(() => {
        setIsCompleted(chapterDetails.status === 'Completed')
    }, [chapterDetails.status])

    useEffect(() => {
        hasCompletedRef.current = false
        keepVideoPausedRef.current = false
    }, [chapterDetails.id])

    const videoLinks =
        chapterDetails.links && chapterDetails.links.length > 0
            ? chapterDetails.links
            : chapterDetails.file
            ? [chapterDetails.file]
            : []
    const flatLinks = videoLinks.flat()
    const isTrackableVideo =
        flatLinks.some(
            (link) =>
                link.includes('youtube.com') ||
                link.includes('youtu.be') ||
                link.includes('vimeo.com')
        ) ||
        flatLinks.some(
            (link) => link.includes('zoom.us') || link.includes('zoom')
        )

    // const youtubeId = isYouTube ? getYoutubeId(flatLinks[0]) : '';
    const savedTime = isTrackableVideo
        ? progress[chapterDetails.id.toString()] || 0
        : 0
    const pausePlayer = useCallback(() => {
        setPlaying(false)

        const internalPlayer = playerRef.current?.getInternalPlayer()
        if (internalPlayer?.pauseVideo) {
            internalPlayer.pauseVideo()
        } else if (internalPlayer?.pause) {
            internalPlayer.pause()
        }
    }, [])

    const resumePlayer = useCallback(() => {
        keepVideoPausedRef.current = false
        setPlaying(true)

        const internalPlayer = playerRef.current?.getInternalPlayer()
        if (internalPlayer?.playVideo) {
            internalPlayer.playVideo()
        } else if (internalPlayer?.play) {
            internalPlayer.play()
        }
    }, [])

    useEffect(() => {
        const handleResumeVideo = () => {
            resumePlayer()
        }

        window.addEventListener('zuvy:resume-video', handleResumeVideo)
        return () => {
            window.removeEventListener('zuvy:resume-video', handleResumeVideo)
        }
    }, [resumePlayer])

    const handleReady = useCallback(() => {
        if (savedTime && playerRef.current) {
            playerRef.current.seekTo(savedTime, 'seconds')
        }

        if (keepVideoPausedRef.current) {
            pausePlayer()
            return
        }

        setPlaying(true)
    }, [pausePlayer, savedTime])

    // Throttle saving progress every 2 seconds
    const lastSaveRef = useRef<number>(0)
    // This is hardcoded for Career Tours and may change in the future.
    const chapterKey = chapterDetails.id.toString()
    const isCareerTour = CAREER_TOUR_BOOTCAMP_IDS.includes(Number(courseId))
    const completionThreshold = isBootcampVideoOverride ? 0.99 : 0.75

    const { isCompleting, completeChapter } = useChapterCompletion({
        courseId: courseId as string,
        moduleId: moduleId as string,
        chapterId: chapterDetails.id.toString(),
        onWatchMore: isBootcampVideoOverride ? undefined : resumePlayer,
        onSuccess: () => {
            setIsCompleted(true)
            onChapterComplete()
        },
    })

    const showFeedbackReminderOnce = useCallback(() => {
        if (!isCareerTour || hasShownFeedbackReminderRef.current === chapterKey) return
    }, [chapterKey, isCareerTour])

    // const showFeedbackReminderOnce = useCallback(() => {
    //     if (!isCareerTour || hasShownFeedbackReminderRef.current === chapterKey) return

    //     const storageKey = `career-tour-feedback-reminder:${courseId}:${chapterKey}`
    //     try {
    //         if (window.localStorage.getItem(storageKey)) {
    //             hasShownFeedbackReminderRef.current = chapterKey
    //             return
    //         }
    //         window.localStorage.setItem(storageKey, 'shown')
    //     } catch {
    //         // Keep the reminder one-time for this mounted video if storage is unavailable.
    //     }

    //     hasShownFeedbackReminderRef.current = chapterKey
    //     setShowFeedbackReminder(true)
    // }, [chapterKey, courseId, isCareerTour])

    const handleProgress: ReactPlayerProps['onProgress'] = useCallback(
        (state: any) => {
            const now = Date.now()
            // Save progress every 2 seconds
            if (now - lastSaveRef.current > 2000) {
                setProgress(chapterKey, state.playedSeconds)
                lastSaveRef.current = now
            }

            // if (state.played >= 1) {
            //     showFeedbackReminderOnce()
            // }

            // For bootcamp video overrides, the reward should wait until full video completion.
            // Otherwise, standard videos reward at 75% watched.
            if (
                !isCompleted &&
                !hasCompletedRef.current &&
                state.played >= completionThreshold
            ) {
                hasCompletedRef.current = true
                keepVideoPausedRef.current = true
                setProgress(chapterKey, state.playedSeconds)
                pausePlayer()
                // Don't refetch chapter details here: it toggles the renderer's
                // loading state, which remounts this component and auto-resumes
                // the video behind the reward modal. onChapterComplete already
                // refreshes module tracking (which opens the modal).
                completeChapter()
            }
        },
        [
            chapterKey,
            setProgress,
            completeChapter,
            isCompleted,
            completionThreshold,
            showFeedbackReminderOnce,
            pausePlayer,
            // showFeedbackReminderOnce,
        ]
    )


    useEffect(() => {
      if (chapterDetails) {
        setLoading(false)
      }
    }, [chapterDetails])
    

    if (loading) {
        return <VideoSkeleton/>;
    }


    return (
        <>
        <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
            <div className="max-w-4xl mx-auto">
                <ScrollArea className={`${isMobile ? 'h-[75vh]' : 'h-[80vh]'}`}>
                    <div className="flex flex-col space-y-2 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl text-left font-extrabold font-body">
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
                                className={`${
                                    isCompleted
                                        ? 'bg-green-100 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/30'
                                        : 'bg-white text-slate-700 hover:bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-700'

                                } text-xs font-medium px-2 py-1 mb-5`}
                            >
                                {isCompleted ? 'Watched' : 'Not Watched'}
                            </Badge>
                        </div>
                    </div>

                    {videoLinks.length > 0 ? (
                        videoLinks.map((link, idx) => {
                            const rawLink = Array.isArray(link) ? link[0] : link
                            const isYouTube =
                                rawLink.includes('youtube.com') ||
                                rawLink.includes('youtu.be')
                            const isVimeo = rawLink.includes('vimeo.com')
                            const isDrive = rawLink.includes('drive.google.com')
                            const isZoom = rawLink.includes('zoom.us')
                            const embedLink = getEmbedLink(rawLink)
                            const isReactPlayerVideo =
                                isYouTube || isVimeo || isZoom
                            return (
                                <div
                                    key={`${idx}-${rawLink}`}
                                    className="mb-8 bg-card-elevated rounded-lg shadow-16dp overflow-hidden border border-border"
                                >
                                    <div className="aspect-video bg-black flex items-center justify-center relative">
                                        {isReactPlayerVideo ? (
                                            <ReactPlayer
                                                ref={playerRef}
                                                url={embedLink}
                                                playing={playing}
                                                controls={isCompleted}
                                                width="100%"
                                                height="100%"
                                                onReady={handleReady}
                                                onProgress={handleProgress}
                                                // onEnded={showFeedbackReminderOnce}
                                               

                                                // onEnded={() => completeChapter()}
                                            />
                                        ) : isDrive ? (
                                            <iframe
                                                src={embedLink}
                                                title="Google Drive Video"
                                                allow="autoplay"
                                                allowFullScreen
                                                className="w-full h-full border-none"
                                            />
                                        ) : isZoom ? 
                                        <ReactPlayer
                                                ref={playerRef}
                                                url={embedLink}
                                                playing={playing}
                                                controls={isCompleted}
                                                width="100%"
                                                height="100%"
                                                // onReady={handleReady}
                                                onProgress={handleProgress}
                                                // onEnded={showFeedbackReminderOnce}
                                              

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
                                                    : isVimeo
                                                    ? 'Vimeo'
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
                        !isTrackableVideo && (
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
        {/* <Dialog open={showFeedbackReminder} onOpenChange={setShowFeedbackReminder}>
            <DialogContent className="max-w-lg overflow-hidden border-border bg-card p-0 shadow-2xl">
                <div className="p-6 sm:p-7">
                    <DialogHeader className="space-y-3 text-left">
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Please fill out the feedback form
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Before moving to the next module, click the{' '}
                            <span className="font-semibold text-primary">Feedback Form</span>{' '}
                            chapter in the left sidebar and submit your feedback.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            onClick={() => setShowFeedbackReminder(false)}
                            className="w-full bg-primary font-semibold text-primary-foreground shadow-hover hover:bg-primary-dark sm:w-auto"
                        >
                            Got it
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog> */}
        </>
    )
}

export default VideoContent
