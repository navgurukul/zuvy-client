'use client'

import React, { useEffect, useState } from 'react'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'
import { Clock, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import QuizQuestions from './QuizQuestions'
import OpenEndedQuestions from './OpenEndedQuestions'
import IDE from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/IDE'
import { api } from '@/utils/axios.config'
import QuestionCard from './QuestionCard'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useParams, usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getAssessmentStore } from '@/store/store'
import TimerDisplay from './TimerDisplay'

function Page({
    params,
}: {
    params: {
        assessmentOutSourceId: string
        moduleID: string
        viewcourses: string
    }
}) {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    const [disableSubmit, setDisableSubmit] = useState(false)

    const decodedParams = {
        assessmentOutSourceId: parseInt(
            decodeURIComponent(params.assessmentOutSourceId).replace(
                /\[|\]/g,
                ''
            )
        ),
    }

    const {
        tabChangeInstance,
        setTabChangeInstance,
        setFullScreenExitInstance,
        fullScreenExitInstance,
        setCopyPasteAttempt,
        copyPasteAttempt,

    } = getAssessmentStore()

    const [selectedQuesType, setSelectedQuesType] = useState<
        'quiz' | 'open-ended' | 'coding'
    >('quiz')
    
    const [isSolving, setIsSolving] = useState(false)
    
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
        null
    )
    const [remainingTime, setRemainingTime] = useState<number>(0)
    const [assessmentData, setAssessmentData] = useState<any>({})
    const [seperateQuizQuestions, setSeperateQuizQuestions] = useState<any>()
    const [seperateOpenEndedQuestions, setSeperateOpenEndedQuestions] =
        useState<any>()
    let interval: NodeJS.Timeout | null = null

    const [assessmentSubmitId, setAssessmentSubmitId] = useState<any>()
    const [selectedCodingOutsourseId, setSelectedCodingOutsourseId] =
        useState<any>()

    const pathname = usePathname()

    function isCurrentPageSubmitAssessment() {
        return (
            pathname ===
            `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${params.assessmentOutSourceId}`
        )
    }

    useEffect(() => {
        const endTime = parseInt(localStorage.getItem('endTime') || '0', 10)
        const initialTabChangeInstance = parseInt(
            localStorage.getItem('tabChangeInstance') || '0',
            10
        )
        setTabChangeInstance(initialTabChangeInstance)

        if (endTime) {
            startTimer(endTime)
        }

        document.addEventListener('visibilitychange', () =>
            handleVisibilityChange(
                setTabChangeInstance,
                tabChangeInstance,
                submitAssessment,
                isCurrentPageSubmitAssessment
            )
        )

        document.addEventListener('fullscreenchange', () =>
            handleFullScreenChange(
                setFullScreenExitInstance,
                fullScreenExitInstance,
                submitAssessment,
                isCurrentPageSubmitAssessment
            )
        )

        return () => {
            document.removeEventListener('visibilitychange', () =>
                handleVisibilityChange(
                    setTabChangeInstance,
                    tabChangeInstance,
                    submitAssessment,
                    isCurrentPageSubmitAssessment
                )
            )
            document.removeEventListener('fullscreenchange', () =>
                handleFullScreenChange(
                    setFullScreenExitInstance,
                    fullScreenExitInstance,
                    submitAssessment,
                    isCurrentPageSubmitAssessment
                )
            )
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [tabChangeInstance, fullScreenExitInstance])

    useEffect(() => {
        if (remainingTime === 0 && intervalId) {
            clearInterval(intervalId)
            submitAssessment()
        }
    }, [remainingTime])

    const startTimer = (endTime: number) => {
        const newIntervalId = setInterval(() => {
            const currentTime = Date.now()
            const newRemainingTime = Math.max(
                Math.floor((endTime - currentTime) / 1000),
                0
            )
            setRemainingTime(newRemainingTime)
            if (newRemainingTime === 0 && newIntervalId) {
                clearInterval(newIntervalId)
            }
        }, 1000)
        setIntervalId(newIntervalId)
    }

    const handleSolveChallenge = (
        type: 'quiz' | 'open-ended' | 'coding',
        id?: number,
        codingOutsourseId?: number
    ) => {
        setSelectedQuesType(type)
        setIsSolving(true)
        if (type === 'coding' && id) {
            setSelectedQuestionId(id)
            setSelectedCodingOutsourseId(codingOutsourseId)
            requestFullScreen(document.documentElement)
        } else {
            requestFullScreen(document.documentElement)
        }
    }

    const handleBack = () => {
        setIsSolving(false)
        setSelectedQuestionId(null)
    }

    async function getAssessmentData() {
        try {
            const res = await api.get(
                `/Content/startAssessmentForStudent/assessmentOutsourseId=${decodedParams.assessmentOutSourceId}`
            )
            setAssessmentData(res.data)
            setAssessmentSubmitId(res.data.submission.id)
        } catch (e) {
            console.error(e)
        }
    }

    async function getSeperateQuizQuestions() {
        try {
            const res = await api.get(
                `/Content/assessmentDetailsOfQuiz/${decodedParams.assessmentOutSourceId}`
            )
            setSeperateQuizQuestions(res.data)
        } catch (e) {
            console.error(e)
        }
    }
    async function getSeperateOpenEndedQuestions() {
        try {
            const res = await api.get(
                `/Content/assessmentDetailsOfOpenEnded/${decodedParams.assessmentOutSourceId}`
            )
            setSeperateOpenEndedQuestions(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        getAssessmentData()
        getSeperateQuizQuestions()
        getSeperateOpenEndedQuestions()
    }, [decodedParams.assessmentOutSourceId])

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
            return (
                <QuizQuestions
                    onBack={handleBack}
                    remainingTime={remainingTime}
                    questions={seperateQuizQuestions}
                    assessmentSubmitId={assessmentSubmitId}
                />
            )
        } else if (selectedQuesType === 'open-ended') {
            return (
                <OpenEndedQuestions
                    onBack={handleBack}
                    remainingTime={remainingTime}
                    questions={seperateOpenEndedQuestions}
                    assessmentSubmitId={assessmentSubmitId}
                />
            )
        } else if (
            selectedQuesType === 'coding' &&
            selectedQuestionId !== null
        ) {
            return (
                <IDE
                    params={{ editor: String(selectedQuestionId) }}
                    onBack={handleBack}
                    remainingTime={remainingTime}
                    assessmentSubmitId={assessmentSubmitId}
                    selectedCodingOutsourseId={selectedCodingOutsourseId}
                />
            )
        }
    }

    async function submitAssessment() {
        setDisableSubmit(true)
        try {
            await api.patch(
                `/submission/assessment/submit?assessmentSubmissionId=${assessmentSubmitId}`,
                {
                    tabChange: tabChangeInstance,
                    copyPaste: copyPasteAttempt,
                    embeddedGoogleSearch: 0,
                }
            )
            toast({
                title: 'Assessment Submitted',
                description: 'Your assessment has been submitted successfully',
                className: 'text-left capitalize',
            })

            const newTabChangeInstance = 0

            setTabChangeInstance(newTabChangeInstance)
            localStorage.setItem(
                'tabChangeInstance',
                JSON.stringify(newTabChangeInstance)
            )

            const newFullScreenExitInstance = 0
                localStorage.setItem('fullScreenExitInstance', newFullScreenExitInstance.toString());
                setFullScreenExitInstance(newFullScreenExitInstance)

            setTimeout(() => {
                window.close()
            }, 5000)

        } catch (e) {
            console.error(e)
        }
    }

    function handleCopyPasteAttempt(event: any) {
        event.preventDefault()
        setCopyPasteAttempt(copyPasteAttempt + 1)
    }

    const handleFullScreenRequest = () => {
        const element = document.documentElement
        requestFullScreen(element)
        setIsFullScreen(true)
    }

    return (
        <React.Fragment>
            {!isFullScreen ? (
                <>
                <div className="flex items-center justify-center gap-2">
                <div className='font-bold text-xl'><TimerDisplay remainingTime={remainingTime} /></div>
            </div>
            <Separator />
            <h1>Enter Full Screen to see the Questions. 
                Warning: If you exit fullscreen, your test will get submitted automatically</h1>
                <div className="flex justify-center mt-10">
                    <Button onClick={handleFullScreenRequest}>
                        Enter Full Screen
                    </Button>
                </div>
                </>
            ) : (
                <>
                    <div className="flex items-center justify-center gap-2">
                    <div className='font-bold text-xl'><TimerDisplay remainingTime={remainingTime} /></div>
                    </div>
                    <Separator />
                    <div
                        className="flex justify-center"
                        onPaste={(e) => handleCopyPasteAttempt(e)}
                        onCopy={(e) => handleCopyPasteAttempt(e)}
                    >
                        <div className="flex flex-col gap-5 w-1/2 text-left">
                            <h2 className="font-bold">
                                Testing Your Knowledge
                            </h2>
                            <p className="deadline flex items-center gap-2">
                                <Clock size={18} />
                                Deadline:{' '}
                                {assessmentData.deadline ||
                                    'No Deadline For This Assessment'}
                            </p>
                            <p className="testTime flex items-center gap-2">
                                <Timer size={18} />
                                Test Time:{' '}
                                {Math.floor(
                                    assessmentData.timeLimit / 3600
                                )}{' '}
                                Hours{' '}
                                {Math.floor(
                                    (assessmentData.timeLimit % 3600) / 60
                                )}{' '}
                                Minutes
                            </p>
                            <p className="description">
                                All the problems i.e. coding challenges, MCQs
                                and open-ended questions have to be completed
                                all at once.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                            <h2 className="font-bold">Coding Challenges</h2>
                            {assessmentData.CodingQuestions?.map(
                                (question: any) => (
                                    <QuestionCard
                                        key={question.id}
                                        id={question.id}
                                        title={question.title}
                                        description={question.difficulty}
                                        onSolveChallenge={() =>
                                            handleSolveChallenge(
                                                'coding',
                                                question.id,
                                                question.codingOutsourseId
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                            <h2 className="font-bold">MCQs</h2>
                            <QuestionCard
                                id={1}
                                title="Quiz"
                                description={`${
                                    assessmentData.Quizzes?.length || 0
                                } questions`}
                                onSolveChallenge={() =>
                                    handleSolveChallenge('quiz')
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                            <h2 className="font-bold">Open-Ended Questions</h2>
                            <QuestionCard
                                id={1}
                                title="Open-Ended Questions"
                                description={`${
                                    assessmentData.OpenEndedQuestions?.length ||
                                    0
                                } questions`}
                                onSolveChallenge={() =>
                                    handleSolveChallenge('open-ended')
                                }
                            />
                        </div>
                    </div>
                    <Button onClick={submitAssessment} disabled={disableSubmit}>
                        Submit Assessment
                    </Button>
                </>
            )}
        </React.Fragment>
    )
}

export default Page
