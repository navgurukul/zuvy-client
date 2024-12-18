'use client'

import React, { useEffect, useState } from 'react'
import {
    handleFullScreenChange,
    handleKeyDown,
    handleRightClick,
    handleVisibilityChange,
    requestFullScreen,
    updateProctoringData,
    getProctoringData,
} from '@/utils/students'
import { Clock, Fullscreen, Timer } from 'lucide-react'
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
import { start } from 'repl'
import { AlertProvider } from './ProctoringAlerts'

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

    const { setFullScreenExitInstance, fullScreenExitInstance } =
        getAssessmentStore()

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
    const [chapterId, setChapterId] = useState<any>()

    // Check if Proctoring is set on by admin for tab switching, copy paste, etc.
    const [isTabProctorOn, setIsTabProctorOn] = useState(
        assessmentData.tabChange
    )
    const [isFullScreenProctorOn, setIsFullScreenProctorOn] = useState(
        assessmentData.screenRecord
    )
    const [isCopyPasteProctorOn, setIsCopyPasteProctorOn] = useState(
        assessmentData.copyPaste
    )
    const [isEyeTrackingProctorOn, setIsEyeTrackingProctorOn] = useState(null)
    const [startedAt, setStartedAt] = useState(
        new Date(assessmentData?.submission?.startedAt).getTime()
    )

    const pathname = usePathname()

    function isCurrentPageSubmitAssessment() {
        return (
            pathname ===
            `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${params.assessmentOutSourceId}`
        )
    }

    const completeChapter = () => {
        api.post(
            `tracking/updateChapterStatus/${params.viewcourses}/${params.moduleID}?chapterId=${chapterId}`
        )
    }

    const startTimer = (endTime: number) => {
        const newIntervalId = setInterval(() => {
            const currentTime = Date.now()
            const newRemainingTime = Math.max(
                Math.floor((endTime - currentTime) / 1000),
                0
            )
            setRemainingTime(newRemainingTime)

            // Show toast when remaining time is 5 minutes
            if (newRemainingTime === 300) {
                toast({
                    title: 'WARNING',
                    description: 'Hurry up less than 5 minutes remaining now!',
                    className:
                        'fixed inset-0 w-1/4 h-1/5 m-auto text-start capitalize border border-destructive bg-red-600 text-white',
                })
            }

            if (newRemainingTime === 0 && newIntervalId) {
                submitAssessment()
                clearInterval(newIntervalId)
            }
        }, 1000)
        setIntervalId(newIntervalId)
    }

    useEffect(() => {
        const endTime = startedAt + assessmentData.timeLimit * 1000

        // get all the proctoring violation counts data for tab switching, copy paste, etc.:-
        if (assessmentSubmitId) {
            getProctoringData(assessmentSubmitId)
        }

        if (endTime) {
            startTimer(endTime)
        }

        isTabProctorOn &&
            document.addEventListener('visibilitychange', () =>
                handleVisibilityChange(
                    submitAssessment,
                    isCurrentPageSubmitAssessment,
                    assessmentSubmitId
                )
            )

        isFullScreenProctorOn &&
            document.addEventListener('fullscreenchange', () =>
                handleFullScreenChange(
                    submitAssessment,
                    isCurrentPageSubmitAssessment,
                    setIsFullScreen,
                    assessmentSubmitId
                )
            )

        return () => {
            document.removeEventListener('visibilitychange', () =>
                handleVisibilityChange(
                    submitAssessment,
                    isCurrentPageSubmitAssessment,
                    assessmentSubmitId
                )
            )
            document.removeEventListener('fullscreenchange', () =>
                handleFullScreenChange(
                    submitAssessment,
                    isCurrentPageSubmitAssessment,
                    setIsFullScreen,
                    assessmentSubmitId
                )
            )
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [
        isTabProctorOn,
        isFullScreenProctorOn,
        isCopyPasteProctorOn,
        isEyeTrackingProctorOn,
        startedAt,
    ])

    // useEffect(() => {
    //     // Add event listeners for right-click and key presses
    //     document.addEventListener('contextmenu', handleRightClick)
    //     document.addEventListener('keydown', handleKeyDown)
    //     return () => {
    //         document.removeEventListener('contextmenu', handleRightClick)
    //         document.removeEventListener('keydown', handleKeyDown)
    //     }
    // }, [])

    useEffect(() => {
        if (remainingTime === 0 && intervalId) {
            clearInterval(intervalId)
            submitAssessment()
        }
    }, [remainingTime])

    async function getCodingSubmissionsData(
        codingOutsourseId: any,
        assessmentSubmissionId: any,
        questionId: any
    ) {
        try {
            const res = await api.get(
                `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            const action = res.data.data.action
            return action
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
            return null
        }
    }

    const handleSolveChallenge = async (
        type: 'quiz' | 'open-ended' | 'coding',
        id?: number,
        codingOutsourseId?: number
    ) => {
        setSelectedQuesType(type)
        setIsSolving(true)
        console.log('id', id)

        if (type === 'coding' && id) {
            const action = await getCodingSubmissionsData(
                codingOutsourseId,
                assessmentSubmitId,
                id
            )

            if (action === 'submit') {
                toast({
                    title: 'Coding Question Already Submitted',
                    description:
                        'You have already submitted this coding question',
                    className: 'text-left capitalize',
                })
            } else {
                setSelectedQuestionId(id)
                setSelectedCodingOutsourseId(codingOutsourseId)
                requestFullScreen(document.documentElement)
            }
        } else if (type === 'quiz' && assessmentData.IsQuizzSubmission) {
            toast({
                title: 'Quiz Already Submitted',
                description: 'You have already submitted the quiz',
                className: 'text-left capitalize',
            })
        } else if (
            type === 'open-ended' &&
            seperateOpenEndedQuestions[0]?.submissionsData.length > 0
        ) {
            
            toast({
                title: 'Open Ended Questions Already Submitted',
                description:
                    'You have already submitted the open ended questions',
                className: 'text-left capitalize',
            })
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
            setAssessmentData(res?.data?.data)
            setStartedAt(
                new Date(res?.data?.data.submission?.startedAt).getTime()
            )
            setIsTabProctorOn(res?.data.data.canTabChange)
            setIsFullScreenProctorOn(res?.data.data.canScreenExit)
            setIsCopyPasteProctorOn(res?.data.data.canCopyPaste)
            setIsEyeTrackingProctorOn(res?.data.data.canEyeTrack)
            setAssessmentSubmitId(res?.data.data.submission.id)
            setChapterId(res?.data.data.chapterId)
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

    if (isSolving && isFullScreen) {
        if (
            selectedQuesType === 'quiz' && !assessmentData.IsQuizzSubmission &&
            assessmentData.hardMcqQuestions +
                assessmentData.easyMcqQuestions +
                assessmentData.mediumMcqQuestions >
                0
        ) {
            return (
                <QuizQuestions
                    onBack={handleBack}
                    weightage={assessmentData}
                    remainingTime={remainingTime}
                    questions={seperateQuizQuestions}
                    assessmentSubmitId={assessmentSubmitId}
                    getSeperateQuizQuestions={getSeperateQuizQuestions}
                    getAssessmentData={getAssessmentData}
                />
            )
        } else if (
            selectedQuesType === 'open-ended' && !(seperateOpenEndedQuestions[0]?.submissionsData.length > 0)
        ) {
            return (
                <OpenEndedQuestions
                    onBack={handleBack}
                    remainingTime={remainingTime}
                    questions={seperateOpenEndedQuestions}
                    assessmentSubmitId={assessmentSubmitId}
                    getSeperateOpenEndedQuestions={
                        getSeperateOpenEndedQuestions
                    }
                    getAssessmentData={getAssessmentData}
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
                    getAssessmentData={getAssessmentData}
                />
            )
        }
    }

    async function submitAssessment() {
        setDisableSubmit(true)
        if (assessmentSubmitId) {
            const { tabChange, copyPaste, fullScreenExit, eyeMomentCount } =
                await getProctoringData(assessmentSubmitId)

            try {
                await api.patch(
                    `/submission/assessment/submit?assessmentSubmissionId=${assessmentSubmitId}`,
                    {
                        tabChange: tabChange,
                        copyPaste: copyPaste,
                        fullScreenExit: fullScreenExit,
                        eyeMomentCount: eyeMomentCount,
                        typeOfsubmission: 'studentSubmit',
                    }
                )
                toast({
                    title: 'Assessment Submitted',
                    description:
                        'Your assessment has been submitted successfully',
                    className: 'text-left capitalize',
                })

                completeChapter()

                setTimeout(() => {
                    window.close()
                }, 4000)
            } catch (e) {
                console.error(e)
            }
        }
    }

    async function handleCopyPasteAttempt(event: any) {
        if (assessmentSubmitId) {
            if (isCopyPasteProctorOn) {
                let { tabChange, copyPaste, fullScreenExit, eyeMomentCount } =
                    await getProctoringData(assessmentSubmitId)


                let storedCopyPaste = copyPaste + 1

                updateProctoringData(
                    assessmentSubmitId,
                    tabChange,
                    storedCopyPaste,
                    fullScreenExit,
                    eyeMomentCount
                )
            }
        }
    }

    const handleFullScreenRequest = () => {
        const element = document.documentElement
        requestFullScreen(element)
        setIsFullScreen(true)
    }

    return (
       <div 
       onPaste={(e) => handleCopyPasteAttempt(e)}
       onCopy={(e) => handleCopyPasteAttempt(e)}
       >
         <AlertProvider>
            <div
                className="h-auto mb-24"
            >
                {!isFullScreen ? (
                    <>
                        <div className="flex items-center justify-center gap-2">
                            <div className="font-bold text-xl">
                                <TimerDisplay remainingTime={remainingTime} />
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <h1>
                            Enter Full Screen to see the Questions. Warning: If
                            you exit fullscreen, your test will get submitted
                            automatically
                        </h1>
                        <div className="flex justify-center mt-10">
                            <Button onClick={handleFullScreenRequest}>
                                Enter Full Screen
                            </Button>
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="font-bold text-xl">
                                <TimerDisplay remainingTime={remainingTime} />
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div className="flex justify-center">
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
                                    Timer has started. Questions will disappear
                                    if you exit full screen. All the problems
                                    i.e. coding challenges, MCQs and open-ended
                                    questions have to be completed all at once
                                </p>

                                <h1 className="font-bold">Proctoring Rules</h1>
                                <p>
                                    To ensure fair assessments, the assessments
                                    are proctored are proctored for the
                                    following cases below. Please avoid
                                    violating the rules:
                                </p>
                                <ul className="list-disc ml-5">
                                    <li>Copy and pasting</li>
                                    <li>Tab switching</li>
                                    <li>Assessment screen exit</li>
                                </ul>
                            </div>
                        </div>
                        {assessmentData.codingQuestions.length > 0 && (
                            <div className="flex justify-center">
                                <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                                    <h2 className="font-bold">
                                        Coding Challenges
                                    </h2>
                                    {assessmentData.codingQuestions?.map(
                                        (question: any) => (
                                            <QuestionCard
                                                key={question.id}
                                                id={question.id}
                                                easyCodingMark = {assessmentData.easyCodingMark}
                                                mediumCodingMark = {assessmentData.mediumCodingMark}
                                                hardCodingMark = {assessmentData.hardCodingMark}
                                                title={question.title}
                                                description={
                                                    question.difficulty
                                                }
                                                codingQuestions={true}
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
                        )}
                        {assessmentData.hardMcqQuestions +
                            assessmentData.easyMcqQuestions +
                            assessmentData.mediumMcqQuestions >
                            0 && (
                            <div className="flex justify-center">
                                <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                                    <h2 className="font-bold">MCQs</h2>
                                    <QuestionCard
                                        id={1}
                                        title="Quiz"
                                        weightage={
                                            assessmentData.weightageMcqQuestions
                                        }
                                        description={`${
                                            assessmentData.hardMcqQuestions +
                                                assessmentData.easyMcqQuestions +
                                                assessmentData.mediumMcqQuestions ||
                                            0
                                        } questions`}
                                        onSolveChallenge={() =>
                                            handleSolveChallenge('quiz')
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        {seperateOpenEndedQuestions.length > 0 && (
                            <div className="flex justify-center">
                                <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                                    <h2 className="font-bold">
                                        Open-Ended Questions
                                    </h2>
                                    <QuestionCard
                                        id={1}
                                        title="Open-Ended Questions"
                                        description={`${
                                            seperateOpenEndedQuestions.length ||
                                            0
                                        } questions`}
                                        onSolveChallenge={() =>
                                            handleSolveChallenge('open-ended')
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        <Button
                            onClick={submitAssessment}
                            disabled={disableSubmit}
                        >
                            Submit Assessment
                        </Button>
                    </div>
                )}
            </div>
        </AlertProvider>
       </div>
    )
}

export default Page
