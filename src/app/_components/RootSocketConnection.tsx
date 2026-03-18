'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

import { toast } from '@/components/ui/use-toast'
import { getSocketConnectionStore, getUser } from '@/store/store'

const API_URL = process.env.NEXT_PUBLIC_LOCAL_URL 

const GENERATION_STATUS_LINES = [
    'Analyzing topic coverage and intent',
    'Designing question structure by difficulty',
    'Generating clear and exam-ready MCQs',
    'Validating options and answer quality',
    'Finalizing question set for delivery',
]

export default function RootSocketConnection() {
    const socketRef = useRef<Socket | null>(null)
    const [retryKey, setRetryKey] = useState(0)
    const [statusLineIndex, setStatusLineIndex] = useState(0)
    const { user } = getUser()
    const {
        isGeneratingQuestions,
        generationProgress,
        totalJobs,
        completedJobs,
        setIsConnected,
        setLastQuestionsReadyEvent,
        setGenerationProgress,
        incrementCompletedJobs,
        stopGeneratingQuestions,
    } = getSocketConnectionStore()

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token')

        if (!accessToken || !user?.id) {
            setIsConnected(false)
            stopGeneratingQuestions()

            // Retry bootstrap while auth/user state is hydrating.
            if (accessToken || user?.id) {
                const retryTimer = window.setTimeout(() => {
                    setRetryKey((value) => value + 1)
                }, 1200)

                return () => {
                    window.clearTimeout(retryTimer)
                }
            }

            return
        }

        const socket = io(API_URL, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000,
            withCredentials: true,
        })

        socketRef.current = socket

        socket.on('connect', () => {
            console.log('WebSocket connected with ID:', socket.id)
            setIsConnected(true)
        })

        socket.on('disconnect', (reason) => {
            console.warn('WebSocket disconnected:', reason)
            setIsConnected(false)
        })

        socket.on('questions:ready', (data: { count: number; questionIds: number[] }) => {
            setLastQuestionsReadyEvent({
                count: data.count,
                questionIds: data.questionIds,
                receivedAt: Date.now(),
            })
            incrementCompletedJobs()

            const state = getSocketConnectionStore.getState()
            const safeTotalJobs = Math.max(1, state.totalJobs)
            const nextCompleted = Math.min(safeTotalJobs, state.completedJobs + 1)
            const committedProgress = Math.floor((nextCompleted / safeTotalJobs) * 100)
            setGenerationProgress(committedProgress)

            toast.success({
                title: 'Questions Generated Successfully!',
                description: `${data.count} MCQ questions have been generated and indexed.`,
            })
        })

        socket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err.message)
        })

        return () => {
            socket.disconnect()
            setIsConnected(false)
            socketRef.current = null
        }
    }, [
        user?.id,
        retryKey,
        setIsConnected,
        setLastQuestionsReadyEvent,
        setGenerationProgress,
        incrementCompletedJobs,
        stopGeneratingQuestions,
    ])

    useEffect(() => {
        if (!isGeneratingQuestions) {
            return
        }

        const singleJobCompletedByMock = totalJobs === 1 && generationProgress >= 100
        const multiJobCompletedByServer = totalJobs > 1 && completedJobs >= totalJobs

        if (singleJobCompletedByMock || multiJobCompletedByServer) {
            setGenerationProgress(100)

            // Keep 100% briefly for a smoother visual completion signal.
            const completeTimer = window.setTimeout(() => {
                stopGeneratingQuestions()
            }, 600)

            return () => {
                window.clearTimeout(completeTimer)
            }
        }
    }, [
        isGeneratingQuestions,
        generationProgress,
        completedJobs,
        totalJobs,
        setGenerationProgress,
        stopGeneratingQuestions,
    ])

    useEffect(() => {
        if (!isGeneratingQuestions) {
            setStatusLineIndex(0)
            return
        }

        const statusTimer = window.setInterval(() => {
            setStatusLineIndex((current) =>
                (current + 1) % GENERATION_STATUS_LINES.length
            )
        }, 2200)

        return () => {
            window.clearInterval(statusTimer)
        }
    }, [isGeneratingQuestions])

    useEffect(() => {
        if (!isGeneratingQuestions) {
            return
        }

        const intervalId = window.setInterval(() => {
            const state = getSocketConnectionStore.getState()
            const current = state.generationProgress
            const safeTotalJobs = Math.max(1, state.totalJobs)
            const committedProgress = Math.floor(
                (state.completedJobs / safeTotalJobs) * 100
            )

            const maxMockProgress =
                safeTotalJobs === 1
                    ? 100
                    : Math.min(95, committedProgress + 20)

            if (current >= maxMockProgress) {
                return
            }

            // Mocked progress: fast at start, slower near completion.
            if (current < 65) {
                setGenerationProgress(Math.min(current + 4, maxMockProgress))
                return
            }

            if (current < 85) {
                setGenerationProgress(Math.min(current + 2, maxMockProgress))
                return
            }

            if (current < 95) {
                setGenerationProgress(Math.min(current + 1, maxMockProgress))
            }
        }, 900)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [
        isGeneratingQuestions,
        totalJobs,
        completedJobs,
        setGenerationProgress,
    ])

    return (
        <div
            className="fixed bottom-4 right-4 z-50 pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
        >
            {isGeneratingQuestions && (
                <div className="min-w-[220px] max-w-[260px] rounded-lg border border-border bg-background/90 shadow-lg backdrop-blur px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <p className="text-xs font-medium text-foreground">
                            AI generation in progress
                        </p>
                        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                            {generationProgress}%
                        </span>
                    </div>
                    <p
                        key={statusLineIndex}
                        className="mt-1 text-[11px] leading-4 text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                    >
                        {
                            GENERATION_STATUS_LINES[
                                statusLineIndex % GENERATION_STATUS_LINES.length
                            ]
                        }
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${generationProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
