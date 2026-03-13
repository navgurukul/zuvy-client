'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

import { toast } from '@/components/ui/use-toast'
import { getSocketConnectionStore, getUser } from '@/store/store'

const API_URL = 'http://localhost:5000'

export default function RootSocketConnection() {
    const socketRef = useRef<Socket | null>(null)
    const { user } = getUser()
    const {
        isGeneratingQuestions,
        generationProgress,
        setIsConnected,
        setLastQuestionsReadyEvent,
        setGenerationProgress,
        stopGeneratingQuestions,
    } = getSocketConnectionStore()

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token')

        if (!accessToken || !user?.id) {
            setIsConnected(false)
            stopGeneratingQuestions()
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
            setGenerationProgress(100)

            toast.success({
                title: 'Questions Generated Successfully!',
                description: `${data.count} MCQ questions have been generated and indexed.`,
            })

            // Keep 100% briefly for a smoother visual completion signal.
            setTimeout(() => {
                stopGeneratingQuestions()
            }, 600)
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
        setIsConnected,
        setLastQuestionsReadyEvent,
        setGenerationProgress,
        stopGeneratingQuestions,
    ])

    useEffect(() => {
        if (!isGeneratingQuestions) {
            return
        }

        const intervalId = window.setInterval(() => {
            const current = getSocketConnectionStore.getState().generationProgress

            // Mocked progress: fast at start, slower near completion.
            if (current < 65) {
                setGenerationProgress(current + 4)
                return
            }

            if (current < 85) {
                setGenerationProgress(current + 2)
                return
            }

            if (current < 95) {
                setGenerationProgress(current + 1)
            }
        }, 900)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [isGeneratingQuestions, setGenerationProgress])

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
