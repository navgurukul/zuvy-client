'use client'

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'
import { Clock, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import QuestionCard from './QuestionCard'
import QuizQuestions from './QuizQuestions'
import OpenEndedQuestions from './OpenEndedQuestions'
import IDE from '@/app/student/playground/[editor]/editor'
import { useTimerStore } from '@/store/store'

const Page = () => {
    const [selectedQuesType, setSelectedQuesType] = useState<
        'quiz' | 'open-ended' | 'coding'
    >('quiz')
    const [isSolving, setIsSolving] = useState(false)
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
        null
    )
    const { remainingTime, startTimer } = useTimerStore((state: any) => ({
        remainingTime: state.remainingTime,
        startTimer: state.startTimer,
    }))

    const testDuration = 2 * 60 * 60 // Test duration in seconds (2 hours)

    useEffect(() => {
        if (remainingTime === 0) {
            startTimer(testDuration)
        }
    }, [])

    const handleSolveChallenge = (
        type: 'quiz' | 'open-ended' | 'coding',
        id?: number
    ) => {
        setSelectedQuesType(type)
        setIsSolving(true)
        if (type === 'coding' && id) {
            setSelectedQuestionId(id)
            requestFullScreen(document.documentElement)
        } else {
            requestFullScreen(document.documentElement)
        }
    }

    const handleBack = () => {
        setIsSolving(false)
        setSelectedQuestionId(null)
    }

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange)
        document.addEventListener('fullscreenchange', handleFullScreenChange)

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            )
            document.removeEventListener(
                'fullscreenchange',
                handleFullScreenChange
            )
        }
    }, [])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, '0')
        const m = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${h}:${m}:${s}`
    }

    if (isSolving) {
        if (selectedQuesType === 'quiz') {
            return <QuizQuestions onBack={handleBack} />
        } else if (selectedQuesType === 'open-ended') {
            return <OpenEndedQuestions onBack={handleBack} />
        } else if (
            selectedQuesType === 'coding' &&
            selectedQuestionId !== null
        ) {
            return (
                <IDE
                    params={{ editor: String(selectedQuestionId) }}
                    onBack={handleBack}
                />
            )
        }
    }

    return (
        <React.Fragment>
            <div className="flex items-center justify-end gap-2">
                <Timer size={18} />
                <h1 className="text-right">{formatTime(remainingTime)}</h1>
            </div>
            <Separator />
            <div
                className="flex justify-center"
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
            >
                <div className="flex flex-col gap-5 w-1/2 text-left">
                    <h2 className="font-bold">Testing Your Knowledge</h2>
                    <p className="deadline flex items-center gap-2">
                        <Clock size={18} />
                        Deadline: 10 May 2024 (25 days remaining)
                    </p>
                    <p className="testTime flex items-center gap-2">
                        <Timer size={18} />
                        Test Time: 2 hours
                    </p>
                    <p className="description">
                        Timer will start when you attempt the first problem. All
                        the problems i.e. coding challenges, MCQs and open-ended
                        questions have to be completed all at once.
                    </p>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                    <h2 className="font-bold">Coding Challenges</h2>
                    <QuestionCard
                        id={51}
                        onSolve={() => handleSolveChallenge('coding', 51)}
                    />
                    <QuestionCard
                        id={52}
                        onSolve={() => handleSolveChallenge('coding', 52)}
                    />
                    <QuestionCard
                        id={53}
                        onSolve={() => handleSolveChallenge('coding', 53)}
                    />
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                    <h2 className="font-bold">MCQs</h2>
                    <QuestionCard
                        onSolve={() => handleSolveChallenge('quiz')}
                    />
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                    <h2 className="font-bold">Open-Ended Questions</h2>
                    <QuestionCard
                        onSolve={() => handleSolveChallenge('open-ended')}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export default Page
