import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Check, VideoIcon } from 'lucide-react'
import useChapterCompletion from '@/hooks/useChapterCompletion'
import { getEmbedLink } from '@/utils/students'
import {
    Session,
    LiveClassContentProps,
} from '@/app/student/_components/chapter-content/componentChapterType'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactPlayer, { ReactPlayerProps } from 'react-player'
import { useVideoStore } from '@/store/store'

const LiveClassContent: React.FC<LiveClassContentProps> = ({
    chapterDetails,
    onChapterComplete,
    refetch,
}) => {
    const { courseId, moduleId } = useParams()
    const { progress, setProgress } = useVideoStore()

    const playerRef = useRef<ReactPlayer>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const lastSaveRef = useRef<number>(0)
    const hasCompletedRef = useRef(false)
    const [playing, setPlaying] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [localIsCompleted, setLocalIsCompleted] = useState(false)

    // Get session data
    const session = chapterDetails.sessions?.[0] || null

    // Chapter completion hook
    const { isCompleting, completeChapter } = useChapterCompletion({
        courseId: courseId as string,
        moduleId: moduleId as string,
        chapterId: chapterDetails.id.toString(),
        onSuccess: () => {
            setLocalIsCompleted(true)
            onChapterComplete()
        },
    })

    useEffect(() => {
        let timeout: NodeJS.Timeout

        const handleMouseMove = () => {
            setShowControls(true) // Show controls on mouse move
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setShowControls(false) // Hide controls after 3s
            }, 3000)
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('mousemove', handleMouseMove)
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove)
            }
            clearTimeout(timeout)
        }
    }, [])

    // Update local state when chapter status changes
    useEffect(() => {
        setLocalIsCompleted(chapterDetails.status === 'Completed')
    }, [chapterDetails.status])

    // Chapter completion status
    const isCompleted =
        localIsCompleted || chapterDetails.status === 'Completed'

    // Helper function to format date and time
    const formatDateTime = (date: Date) => {
        const getOrdinalSuffix = (day: number) => {
            if (day > 3 && day < 21) return 'th'
            switch (day % 10) {
                case 1:
                    return 'st'
                case 2:
                    return 'nd'
                case 3:
                    return 'rd'
                default:
                    return 'th'
            }
        }

        const day = date.getDate()
        const month = date.toLocaleDateString('en-US', { month: 'long' })
        const year = date.getFullYear()
        const time = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })

        return `${day}${getOrdinalSuffix(day)} ${month} ${year} at ${time}`
    }

    // Helper function to get time remaining
    const getTimeRemaining = (scheduledDateTime: Date) => {
        const now = new Date()
        const diff = scheduledDateTime.getTime() - now.getTime()

        // If time has passed or is very close (within 1 minute)
        if (diff <= 0) return 'Starting soon'

        // If less than 1 minute remaining
        if (diff < 60000) return 'Starting soon'

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ${hours} hour${
                hours > 1 ? 's' : ''
            }`
        }

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
                minutes > 1 ? 's' : ''
            }`
        }

        return ` Class starts in ${minutes} minute${minutes > 1 ? 's' : ''}`
    }

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
            chapterDetails.id.toString(),
            setProgress,
            completeChapter,
            isCompleted,
        ]
    )

    const toggleFullScreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen()
            setIsFullscreen(true)
        } else if (document.exitFullscreen) {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    // If no session data, show empty state
    if (!session) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-xl font-heading font-bold mb-4">
                    {chapterDetails.title}
                </h1>
                <p className="text-muted-foreground">
                    No session has been scheduled yet
                </p>
            </div>
        )
    }

    // Map session data to expected format
    const item = {
        type: 'live-class',
        title: session.title || chapterDetails.title,
        description: chapterDetails.description,
        scheduledDateTime: session.startTime
            ? new Date(session.startTime)
            : null,
        status: session.status,
        duration: session.duration,
        hangoutLink: session.hangoutLink,
        s3link: session.s3link,
        attendance: session.attendance,
    }

    if (item.type === 'live-class') {
        const isScheduled = item.status === 'upcoming'
        const isInProgress = item.status === 'ongoing'
        const isSessionCompleted = item.status === 'completed'

        if (isScheduled) {
            return (
                <div className="max-w-4xl mx-auto p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-heading font-bold">
                            {item.title}
                        </h1>
                        <Badge
                            variant="outline"
                            className="text-muted-foreground"
                        >
                            Scheduled
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-left mb-6">
                        {item.description ||
                            'Join this live interactive session with your instructor and fellow students.'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground">
                                Scheduled Date & Time
                            </p>
                            <p className="font-medium">
                                {item.scheduledDateTime
                                    ? formatDateTime(item.scheduledDateTime)
                                    : 'TBD'}
                            </p>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground">
                                {' '}
                                Duration
                            </p>
                            <p className="font-medium">{item.duration} mins</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <Card className="bg-info-light border-info">
                            <CardContent className="p-4">
                                <p className="text-info font-semibold text-center">
                                    {getTimeRemaining(item.scheduledDateTime!)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )
        }

        if (isInProgress) {
            return (
                <div className="max-w-4xl mx-auto p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-heading text-left font-bold">
                            {item.title}
                        </h1>
                        <Badge
                            variant="outline"
                            className="text-success border-success"
                        >
                            Live Now
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-left mb-6">
                        {item.description ||
                            'Join this live interactive session with your instructor and fellow students.'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground">
                                Scheduled Date & Time
                            </p>
                            <p className="font-medium">
                                {item.scheduledDateTime
                                    ? formatDateTime(item.scheduledDateTime)
                                    : 'TBD'}
                            </p>
                        </div>
                    </div>
                    <div className="text-left">
                        <Button
                            className="mb-6 text-left font-semibold bg-primary hover:bg-primary-dark text-white"
                            onClick={() =>
                                item.hangoutLink &&
                                window.open(item.hangoutLink, '_blank')
                            }
                            disabled={
                                !item.hangoutLink ||
                                item.hangoutLink === 'not found'
                            }
                        >
                            Join Class
                        </Button>
                    </div>
                </div>
            )
        }

        if (isSessionCompleted) {
            const embedLink = getEmbedLink(item.s3link)
            const hasRecording = Boolean(
                item.s3link &&
                    item.s3link !== 'not found' &&
                    item.s3link.trim() !== ''
            )

            return (
                <ScrollArea className="h-[80vh]">
                    <div className="max-w-4xl mx-auto p-8">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-heading font-bold">
                                {item.title}
                            </h1>
                            {chapterDetails.status === 'Completed' ||
                            localIsCompleted ? (
                                <Badge
                                    variant="outline"
                                    className="text-success border-success"
                                >
                                    Viewed
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="text-warning border-warning"
                                >
                                    Not Viewed
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground text-left mb-6">
                            {item.description ||
                                'This live class has been completed.'}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-left">
                                <p className="text-sm text-muted-foreground">
                                    Date & Time
                                </p>
                                <p className="font-medium">
                                    {item.scheduledDateTime
                                        ? formatDateTime(item.scheduledDateTime)
                                        : 'TBD'}
                                </p>
                            </div>
                            {item.s3link && (
                                <div className="text-left">
                                    <p className="text-sm text-muted-foreground">
                                        Your Attendance Duration{' '}
                                    </p>
                                    <p className="font-medium">
                                        {item.duration} mins
                                    </p>
                                </div>
                            )}
                            {item.s3link && (
                                <div className="text-left">
                                    <p className="text-sm text-muted-foreground">
                                        Attendance
                                    </p>
                                    <p
                                        className={`font-medium ${
                                            item.attendance === 'present'
                                                ? 'text-success'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {item.attendance === 'present'
                                            ? 'Present'
                                            : 'Absent'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <p className="text-success mb-2 flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Class completed
                        </p>
                        <p className="text-left mb-4 text-sm">
                            {(item.s3link === 'not found' ||
                                item.s3link === null) &&
                                item.status === 'completed' &&
                                'Your attendance and recording are being processed. Please check again after 24 to 48 hours.'}
                        </p>

                        {hasRecording ? (
                            <div className="border-t border-border pt-6">
                                <h2 className="text-xl text-left font-heading font-semibold mb-4">
                                    Recording available for the live class
                                </h2>
                                <div className="bg-black rounded-lg aspect-video flex items-center justify-center cursor-pointer">
                                    {embedLink.includes('google') ? (
                                        <iframe
                                            src={embedLink}
                                            title="Google Drive Video"
                                            allow="autoplay"
                                            allowFullScreen
                                            className="w-full h-full border-none"
                                        />
                                    ) : (
                                        <div
                                            ref={containerRef}
                                            className="relative w-full h-full"
                                        >
                                            <ReactPlayer
                                                ref={playerRef}
                                                url={embedLink}
                                                playing={playing}
                                                controls={true}
                                                width="100%"
                                                height="100%"
                                                onProgress={handleProgress}
                                                config={{
                                                    file: {
                                                        attributes: {
                                                            controlsList:
                                                                'nodownload noremoteplayback',
                                                            disablePictureInPicture:
                                                                true,
                                                            onContextMenu: (
                                                                e: any
                                                            ) =>
                                                                e.preventDefault(),
                                                        },
                                                    },
                                                }}
                                                // onPlay={'Play'}
                                            />
                                            {!isCompleted && showControls && (
                                                <div className="absolute inset-0 opacity-0 hover:opacity-100 flex gap-4 items-center justify-center bg-black/50 text-white">
                                                    <Button
                                                        onClick={() =>
                                                            setPlaying(!playing)
                                                        }
                                                        className="bg-white/80 text-black  rounded-full px-4 py-2 shadow-lg"
                                                    >
                                                        {playing
                                                            ? 'Pause'
                                                            : 'Play'}
                                                    </Button>
                                                    <Button
                                                        onClick={
                                                            toggleFullScreen
                                                        }
                                                        className="bg-white/80 text-black rounded-full px-4 py-2 shadow-lg"
                                                    >
                                                        {!isFullscreen
                                                            ? 'FullScreen'
                                                            : 'Exit FullScreen'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!isCompleted &&
                                    !embedLink.includes('zoom.us') && (
                                        <div className="mt-6">
                                            <Button
                                                onClick={completeChapter}
                                                disabled={isCompleting}
                                                className="w-full bg-primary hover:bg-primary-dark text-white"
                                            >
                                                {isCompleting
                                                    ? 'Marking as Done...'
                                                    : 'Mark as Done'}
                                            </Button>
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-[70vh] bg-card">
                                <VideoIcon className="w-16 h-16 mb-2 opacity-60" />
                                <p>Recording Not Found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            )
        }
    }

    // Fallback return
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-xl font-heading font-bold">
                {chapterDetails.title}
            </h1>
            <p className="text-muted-foreground">Live class content</p>
        </div>
    )
}

export default LiveClassContent
