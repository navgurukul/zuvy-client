'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    handleFullScreenChange,
    handleKeyDown,
    handleRightClick,
    handleVisibilityChange,
    requestFullScreen,
    updateProctoringData,
    getProctoringData,
} from '@/utils/students'
import {
    ChevronLeft,
    Clock,
    Fullscreen,
    Timer,
    AlertCircle,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import QuizQuestions from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/QuizQuestions'
import OpenEndedQuestions from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/OpenEndedQuestions'
import IDE from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/IDE'
import { api } from '@/utils/axios.config'
import QuestionCard from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/QuestionCard'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useParams, usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getAssessmentStore } from '@/store/store'
import TimerDisplay from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/TimerDisplay'
import { start } from 'repl'
import { AlertProvider } from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/ProctoringAlerts'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import PreventBackNavigation from '@/app/student/courses/[viewcourses]/modules/_components/PreventBackNavigation'
import WarnOnLeave from '@/app/student/courses/[viewcourses]/modules/_components/WarnOnLeave'
import Loader from '@/app/student/courses/_components/Loader'

function Page({
    params,
}: {
    params: {
        assessmentOutSourceId: string
        moduleID: string
        viewcourses: string
        chapterId: string
    }
}) {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [runCodeLanguageId, setRunCodeLanguageId] = useState<any>(0)
    const [runSourceCode, setRunSourceCode] = useState<string>('')

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

    const router = useRouter()

    const [isSolving, setIsSolving] = useState(false)

    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
        null
    )
    const [remainingTime, setRemainingTime] = useState<number>(0)
    const [assessmentData, setAssessmentData] = useState<any>(null)
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
        assessmentData?.tabChange
    )
    const [isFullScreenProctorOn, setIsFullScreenProctorOn] = useState(
        assessmentData?.screenRecord
    )
    const [isCopyPasteProctorOn, setIsCopyPasteProctorOn] = useState(
        assessmentData?.copyPaste
    )
    const [isEyeTrackingProctorOn, setIsEyeTrackingProctorOn] = useState(null)
    const [startedAt, setStartedAt] = useState(
        new Date(assessmentData?.submission?.startedAt).getTime()
    )
    const intervalIdRef = useRef<number | null>(null)
    const pathname = usePathname()

    function isCurrentPageSubmitAssessment() {
        return (
            pathname ===
            `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${params.assessmentOutSourceId}/chapter/${params.chapterId}`
        )
    }

    const completeChapter = () => {
        api.post(
            `tracking/updateChapterStatus/${params.viewcourses}/${params.moduleID}?chapterId=${chapterId}`
        )
    }

    const startTimer = (endTime: number) => {
        intervalIdRef.current = window.setInterval(() => {
            const currentTime = Date.now()
            const newRemainingTime = Math.max(
                Math.floor((endTime - currentTime) / 1000),
                0
            )
            setRemainingTime(newRemainingTime)

            // Show toast when remaining time is 5 minutes (300 seconds)
            if (newRemainingTime === 300) {
                toast({
                    title: 'WARNING',
                    description: 'Hurry up, less than 5 minutes remaining now!',
                    className:
                        'fixed inset-0 w-1/4 h-1/5 m-auto text-start capitalize border border-destructive bg-red-600 text-white',
                })
            }

            // Submit assessment and clear interval when time is up
            if (newRemainingTime === 0) {
                submitAssessment()
                if (intervalIdRef.current) {
                    clearInterval(intervalIdRef.current)
                    intervalIdRef.current = null
                }
            }
        }, 1000)
    }

    async function getAssessmentSubmissionsData() {
        const startPageUrl = `/student/courses/${params.viewcourses}/modules/${params.moduleID}/chapters/${params.chapterId}`
        try {
            const res = await api.get(
                `Content/students/assessmentId=${decodedParams.assessmentOutSourceId}?moduleId=${params.moduleID}&bootcampId=${params.viewcourses}&chapterId=${params.chapterId}`
            )

            if (
                res.data.submitedOutsourseAssessments.length > 0 &&
                res.data.submitedOutsourseAssessments[0].submitedAt
            ) {
                router.push(startPageUrl)
            } else if (
                res.data.submitedOutsourseAssessments.length > 0 &&
                res.data.submitedOutsourseAssessments[0].startedAt
            ) {
                getAssessmentData()
            }
            // else {
            //     getAssessmentData()
            // }
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
            return null
        }
    }

    useEffect(() => {
        // Fetch proctoring data
        if (assessmentSubmitId) {
            getProctoringData(assessmentSubmitId)
        }
    }, [assessmentSubmitId])

    useEffect(() => {
        const endTime = startedAt + assessmentData?.timeLimit * 1000
        // Start the timer
        startTimer(endTime)

        // Define event handlers for proctoring
        const visibilityChangeHandler = () =>
            handleVisibilityChange(
                submitAssessment,
                isCurrentPageSubmitAssessment,
                assessmentSubmitId
            )

        const fullscreenChangeHandler = () =>
            handleFullScreenChange(
                submitAssessment,
                isCurrentPageSubmitAssessment,
                setIsFullScreen,
                assessmentSubmitId
            )

        // Add event listeners
        if (isTabProctorOn) {
            document.addEventListener(
                'visibilitychange',
                visibilityChangeHandler
            )
        }

        if (isFullScreenProctorOn) {
            document.addEventListener(
                'fullscreenchange',
                fullscreenChangeHandler
            )
        }

        // Cleanup on unmount
        return () => {
            if (isTabProctorOn) {
                document.removeEventListener(
                    'visibilitychange',
                    visibilityChangeHandler
                )
            }
            if (isFullScreenProctorOn) {
                document.removeEventListener(
                    'fullscreenchange',
                    fullscreenChangeHandler
                )
            }
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current)
            }
        }
    }, [isTabProctorOn, isFullScreenProctorOn])

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
            const action = res?.data?.data?.action
            setRunCodeLanguageId(res?.data?.data?.languageId || 0)
            setRunSourceCode(res?.data?.data?.sourceCode || null)
            return action
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
            return null
        }
    }

    const handleSolveChallenge = async (
        type: 'quiz' | 'open-ended' | 'coding',
        id?: number,
        codingQuestionId?: number,
        codingOutsourseId?: number
    ) => {
        setSelectedQuesType(type)
        setIsSolving(true)

        if (type === 'coding' && id) {
            const action = await getCodingSubmissionsData(
                codingOutsourseId,
                assessmentSubmitId,
                id
            )

            if (action === 'submit') {
                // toast({
                //     title: 'Coding Question Already Submitted',
                //     description:
                //         'You have already submitted this coding question',
                //     className: 'text-left capitalize',
                // })
            } else {
                setSelectedQuestionId(id)
                setSelectedCodingOutsourseId(codingOutsourseId)
                requestFullScreen(document.documentElement)
            }
        } else if (type === 'quiz' && assessmentData?.IsQuizzSubmission) {
            // toast({
            //     title: 'Quiz Already Submitted',
            //     description: 'You have already submitted the quiz',
            //     className: 'text-left capitalize',
            // })
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
            setIsFullScreen(true)
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
        if (isFullScreen) {
            getAssessmentData()
        }
        getSeperateQuizQuestions()
        getSeperateOpenEndedQuestions()
    }, [decodedParams.assessmentOutSourceId, isFullScreen])

    useEffect(() => {
        if (assessmentData) {
            getSeperateQuizQuestions()
            getSeperateOpenEndedQuestions()
        }
    }, [assessmentData])

    useEffect(() => {
        getAssessmentSubmissionsData()
    }, [])

    if (isSolving && isFullScreen) {
        if (
            selectedQuesType === 'quiz' &&
            !assessmentData?.IsQuizzSubmission &&
            assessmentData?.hardMcqQuestions +
            assessmentData?.easyMcqQuestions +
            assessmentData?.mediumMcqQuestions >
            0
        ) {
            return (
                <>
                <PreventBackNavigation />
                <WarnOnLeave />
                <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
                <QuizQuestions
                    onBack={handleBack}
                    weightage={assessmentData}
                    remainingTime={remainingTime}
                    questions={seperateQuizQuestions}
                    assessmentSubmitId={assessmentSubmitId}
                    getSeperateQuizQuestions={getSeperateQuizQuestions}
                    getAssessmentData={getAssessmentData}
                />
                </AlertProvider>
                </>
            )
        } else if (
            selectedQuesType === 'open-ended' &&
            !(seperateOpenEndedQuestions[0]?.submissionsData.length > 0)
        ) {
            return (
                <>
                <PreventBackNavigation />
                <WarnOnLeave />
                <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
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
                </AlertProvider>
                </>
            )
        } else if (
            selectedQuesType === 'coding' &&
            selectedQuestionId !== null
        ) {
            return (
                <>
                <PreventBackNavigation />
                <WarnOnLeave />
                <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
                <IDE
                    params={{ editor: String(selectedQuestionId) }}
                    onBack={handleBack}
                    remainingTime={remainingTime}
                    assessmentSubmitId={assessmentSubmitId}
                    selectedCodingOutsourseId={selectedCodingOutsourseId}
                    getAssessmentData={getAssessmentData}
                    runCodeLanguageId={runCodeLanguageId}
                    runSourceCode={runSourceCode}
                />
                </AlertProvider>
                </>
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

                router.push(
                    `/student/courses/${assessmentData?.bootcampId}/modules/${assessmentData?.moduleId}/chapters/${assessmentData?.chapterId}`
                )
                const channel = new BroadcastChannel('assessment_channel');
                channel.postMessage('assessment_submitted');
                channel.close();
                setTimeout(()=> window.close(), 2000);
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

    function handleFullScreenRequest() {
        const element = document.documentElement
        requestFullScreen(element)
        setIsFullScreen(true)
    }

    return (
        <div
            onPaste={(e) => handleCopyPasteAttempt(e)}
            onCopy={(e) => handleCopyPasteAttempt(e)}
        >
            <PreventBackNavigation />
             <WarnOnLeave />
            <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
                <div className="h-auto mb-24">
                    {!isFullScreen && !remainingTime ? (
                        <>
                            <>
                            <div className="fixed top-4 right-4 bg-white p-2 rounded-md shadow-md font-bold text-xl">
                                <div className="font-bold text-xl">
                                    <TimerDisplay
                                        remainingTime={remainingTime}
                                    />
                                </div>
                            </div>
                      
                            <h1>
                                Enter Full Screen to see the Questions. Warning:
                                If you exit fullscreen, your test will get
                                submitted automatically
                            </h1>
                            <div className="flex justify-center mt-10">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button>
                                            Enter Full Screen
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogDescription>
                                                You must stay in full-screen mode during the test. 
                                                <strong> No tab switching, window changes, or exiting full-screen. </strong> 
                                                The above violations may lead to auto-submission.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-500"
                                                onClick={handleFullScreenRequest}
                                            >
                                                Proceed
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                                </>
                            {/* )} */}
                        </>
                    ) : (
                        <div>
                            <div className="fixed top-4 right-4 bg-white p-2 rounded-md shadow-md font-bold text-xl">
                                <div className="font-bold text-xl">
                                    <TimerDisplay
                                        remainingTime={remainingTime}
                                    />
                                </div>
                            </div>
                            {/* <Separator className="my-6" /> */}
                            <div className="flex justify-center">
                                <div className="flex flex-col gap-5 w-1/2 text-left">
                                    <h2 className="font-bold">
                                        Testing Your Knowledge
                                    </h2>
                                    <p className="deadline flex items-center gap-2">
                                        <Clock size={18} />
                                        Deadline:{' '}
                                        {assessmentData?.deadline ||
                                            'No Deadline For This Assessment'}
                                    </p>
                                    <p className="testTime flex items-center gap-2">
                                        <Timer size={18} />
                                        Test Time:{' '}
                                        {Math.floor(
                                            assessmentData?.timeLimit / 3600
                                        )}{' '}
                                        Hours{' '}
                                        {Math.floor(
                                            (assessmentData?.timeLimit % 3600) /
                                            60
                                        )}{' '}
                                        Minutes
                                    </p>
                                    <p className="description">
                                        Timer has started. Questions will
                                        disappear if you exit full screen. All
                                        the problems i.e. coding challenges,
                                        MCQs and open-ended questions have to be
                                        completed all at once
                                    </p>

                                    <h1 className="font-bold">
                                        Proctoring Rules
                                    </h1>
                                    <p>
                                        To ensure fair assessments, the
                                        assessments are proctored are proctored
                                        for the following cases below. Please
                                        avoid violating the rules:
                                    </p>
                                    <ul className="list-disc ml-5">
                                        <li>Copy and pasting</li>
                                        <li>Tab switching</li>
                                        <li>Assessment screen exit</li>
                                    </ul>
                                </div>
                            </div>
                            {assessmentData?.codingQuestions?.length > 0 && (
                                <div className="flex justify-center">
                                    <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                                        <h2 className="font-bold">
                                            Coding Challenges
                                        </h2>
                                        <div className="flex gap-2">
                                            <AlertCircle />
                                            <h2>
                                                You may run your code multiple
                                                times after making changes, but
                                                you are allowed to submit it
                                                only once.
                                            </h2>
                                        </div>
                                        {assessmentData?.codingQuestions?.map(
                                            (question: any) => (
                                                <QuestionCard
                                                    key={
                                                        question.codingQuestionId
                                                    }
                                                    id={
                                                        question.codingQuestionId
                                                    }
                                                    easyCodingMark={
                                                        assessmentData?.easyCodingMark
                                                    }
                                                    mediumCodingMark={
                                                        assessmentData?.mediumCodingMark
                                                    }
                                                    hardCodingMark={
                                                        assessmentData?.hardCodingMark
                                                    }
                                                    title={question.title}
                                                    description={
                                                        question.difficulty
                                                    }
                                                    // assessmentOutsourseId={question.assessmentOutsourseId}
                                                    assessmentSubmitId={
                                                        assessmentSubmitId
                                                    }
                                                    codingOutsourseId={
                                                        question.codingOutsourseId
                                                    }
                                                    codingQuestions={true}
                                                    onSolveChallenge={(id:any) =>
                                                        handleSolveChallenge(
                                                            'coding',
                                                            id,
                                                            question.codingQuestionId,
                                                            question.codingOutsourseId
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                            {assessmentData?.hardMcqQuestions +
                                assessmentData?.easyMcqQuestions +
                                assessmentData?.mediumMcqQuestions >
                                0 && (
                                    <div className="flex justify-center">
                                        <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                                            <h2 className="font-bold">MCQs</h2>
                                            <QuestionCard
                                                id={1}
                                                title="Quiz"
                                                weightage={
                                                    assessmentData?.weightageMcqQuestions
                                                }
                                                description={`${assessmentData?.hardMcqQuestions +
                                                    assessmentData?.easyMcqQuestions +
                                                    assessmentData?.mediumMcqQuestions ||
                                                    0
                                                    } questions`}
                                                onSolveChallenge={() =>
                                                    handleSolveChallenge('quiz')
                                                }

                                                isQuizSubmitted={
                                                    assessmentData?.IsQuizzSubmission
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
                                            description={`${seperateOpenEndedQuestions.length ||
                                                0
                                                } questions`}
                                            onSolveChallenge={() =>
                                                handleSolveChallenge(
                                                    'open-ended'
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={disableSubmit}>
                                        Submit Assessment
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will submit your whole assessment.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-500"
                                            onClick={submitAssessment}
                                        >
                                            Submit
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </AlertProvider>
        </div>
    )
}

export default Page
