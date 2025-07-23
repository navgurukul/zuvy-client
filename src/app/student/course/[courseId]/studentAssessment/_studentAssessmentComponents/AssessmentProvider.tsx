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
import QuizQuestions from './QuizQuestions'
import OpenEndedQuestions from './OpenEndedQuestions'
import IDE from './IDE'
import { api } from '@/utils/axios.config'
import QuestionCard from './QuestionCard'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useParams, usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getAssessmentStore } from '@/store/store'
import TimerDisplay from './TimerDisplay'
import { start } from 'repl'
import { AlertProvider } from './ProctoringAlerts';
import { formatToIST } from '@/lib/utils'
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
import PreventBackNavigation from './PreventBackNavigation'
import WarnOnLeave from './WarnOnLeave'
import useWindowSize from '@/hooks/useHeightWidth'
import type {PageParams,AssessmentData,AssessmentSubmissionsResponse,CodingQuestion,CodingSubmissionApiResponse} from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/courseStudentAssesmentStudentTypes';


function Page({
    params,
}: {
    params: PageParams
}) {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    const { width } = useWindowSize()
    const isMobile = width < 768

    const [disableSubmit, setDisableSubmit] = useState(false)
    const [runCodeLanguageId, setRunCodeLanguageId] = useState<number>(0)
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

    const [selectedQuestionId, setSelectedQuestionId] = useState <string | number | null>(null)
    const [remainingTime, setRemainingTime] = useState<number>(0)
    const [assessmentData, setAssessmentData] = useState <AssessmentData | null>(null)
    const [seperateQuizQuestions, setSeperateQuizQuestions] = useState<any[] | undefined>()
    const [seperateOpenEndedQuestions, setSeperateOpenEndedQuestions] =
        useState<any>()
    let interval: NodeJS.Timeout | null = null

    const [assessmentSubmitId, setAssessmentSubmitId] = useState<any>(null)
    const [selectedCodingOutsourseId, setSelectedCodingOutsourseId] =
        useState<number | undefined>();
    const [chapterId, setChapterId] = useState<string | undefined>();

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
        new Date(assessmentData?.submission?.startedAt ?? '').getTime()
    )
    const intervalIdRef = useRef<number | null>(null)
    const pathname = usePathname()

    function isCurrentPageSubmitAssessment() {
        const expected = `/student/course/${params.viewcourses}/studentAssessment`;
        return pathname === expected || pathname === expected + '/';
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
                toast.warning({
                    title: 'WARNING',
                    description: 'Hurry up, less than 5 minutes remaining now!',
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
            const res = await api.get<AssessmentSubmissionsResponse>(
                `Content/students/assessmentId=${decodedParams.assessmentOutSourceId}?moduleId=${params.moduleID}&bootcampId=${params.viewcourses}&chapterId=${params.chapterId}`
            )

            if (
                res.data.submitedOutsourseAssessments.length > 0 &&
                res.data.submitedOutsourseAssessments[0].submitedAt &&
                res?.data?.submitedOutsourseAssessments[0].reattemptApproved ===
                false
            ) {
                router.push(startPageUrl)
            } else if (
                res.data.submitedOutsourseAssessments.length > 0 &&
                res.data.submitedOutsourseAssessments[0].startedAt &&
                res?.data?.submitedOutsourseAssessments[0].reattemptApproved ===
                false
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
        const endTime = startedAt + (assessmentData?.timeLimit ?? 0) * 1000
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
            const res = await api.get<CodingSubmissionApiResponse>(
                `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            const action = res?.data?.data?.action
            setRunCodeLanguageId(res?.data?.data?.languageId || 0)
            setRunSourceCode(res?.data?.data?.sourceCode || '')
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
            toast.info({
                title: 'Open Ended Questions Already Submitted',
                description:
                    'You have already submitted the open ended questions',
            })
        } else {
            requestFullScreen(document.documentElement)
        }
    }

    const handleBack = () => {
        setIsSolving(false)
        setSelectedQuestionId(null)
    }

    async function getAssessmentData(isNewStart: boolean = false) {
        try {
            const res = await api.get(
                `/Content/startAssessmentForStudent/assessmentOutsourseId=${decodedParams.assessmentOutSourceId}/newStart=${isNewStart}`
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

    useEffect(() => {
        const navEntries = performance.getEntriesByType(
            'navigation'
        ) as PerformanceNavigationTiming[]
        const navType = navEntries[0]?.type

        if (navType === 'reload') {
            toast.info({
                title: 'Page Reloaded',
                description: 'The page has been reloaded.',
            })
        }

        const handleTabClose = () => {
            const channel = new BroadcastChannel('assessment_channel')
            channel.postMessage('assessment_tab_closed')
            channel.close()
        }

        window.addEventListener('beforeunload', handleTabClose)

        return () => {
            window.removeEventListener('beforeunload', handleTabClose)
        }
    }, [])

    if (isSolving && isFullScreen) {
        if (
            selectedQuesType === 'quiz' &&
            !assessmentData?.IsQuizzSubmission &&
            (assessmentData?.hardMcqQuestions ?? 0) +
            (assessmentData?.easyMcqQuestions ?? 0) +
            (assessmentData?.mediumMcqQuestions ?? 0) >
            0
        ) {
            return (
                <>
                    <PreventBackNavigation />
                    {/* <WarnOnLeave /> */}
                    <AlertProvider
                        requestFullScreen={handleFullScreenRequest}
                        setIsFullScreen={setIsFullScreen}
                    >
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
                    {/* <WarnOnLeave /> */}
                    <AlertProvider
                        requestFullScreen={handleFullScreenRequest}
                        setIsFullScreen={setIsFullScreen}
                    >
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
                    {/* <WarnOnLeave /> */}
                    <AlertProvider
                        requestFullScreen={handleFullScreenRequest}
                        setIsFullScreen={setIsFullScreen}
                    >
                        <IDE
                            params={{ editor: String(selectedQuestionId) }}
                            onBack={handleBack}
                            remainingTime={remainingTime}
                            assessmentSubmitId={assessmentSubmitId}
                            selectedCodingOutsourseId={
                                selectedCodingOutsourseId
                            }
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
                toast.success({
                    title: 'Assessment Submitted',
                    description:
                        'Your assessment has been submitted successfully',
                })

                completeChapter()

                router.push(
                    `/student/course/${assessmentData?.bootcampId}/modules/${assessmentData?.moduleId}?chapterId=${assessmentData?.chapterId}`
                )
                const channel = new BroadcastChannel('assessment_channel')
                channel.postMessage('assessment_submitted')
                channel.close()
                setTimeout(() => window.close(), 2000)
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
            {/* <WarnOnLeave /> */}
            <AlertProvider
                requestFullScreen={handleFullScreenRequest}
                setIsFullScreen={setIsFullScreen}
            >
                <div className="h-screen mb-24">                    {!isFullScreen && !remainingTime ? (
                    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10 flex items-center justify-center p-6">
                        <div className="fixed top-6 right-6 z-50">
                            <TimerDisplay
                                remainingTime={remainingTime}
                            />
                        </div>

                        <div className="max-w-2xl w-full">
                            <div className="bg-card border border-border rounded-2xl shadow-16dp overflow-hidden">
                                <div className="bg-card-elevated border-b border-border p-8 text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Fullscreen className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground mb-3">Assessment Ready</h2>
                                    <p className="text-muted-foreground">
                                        Enter full-screen mode to begin your assessment
                                    </p>
                                </div>

                                <div className="p-8">
                                    <div className="bg-warning-light border border-warning/20 rounded-xl p-6 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-6 h-6 text-warning mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-warning-dark mb-2">Important Notice</h4>
                                                <p className="text-sm text-warning-dark">
                                                    You must stay in full-screen mode during the test.
                                                    <strong> No tab switching, window changes, or exiting full-screen.</strong>
                                                    {' '}These violations may lead to auto-submission.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-8dp hover:shadow-16dp">
                                                    Enter Full Screen
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card border-border shadow-32dp">
                                                <AlertDialogHeader>
                                                    <AlertDialogDescription className="text-foreground text-base">
                                                        You must stay in full-screen mode during the test.
                                                        <strong className="text-primary">
                                                            {' '}No tab switching, window changes, or exiting full-screen.{' '}
                                                        </strong>
                                                        The above violations may lead to auto-submission.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-primary hover:bg-primary-dark text-primary-foreground"
                                                        onClick={() => {
                                                            handleFullScreenRequest();
                                                            getAssessmentData(true);
                                                        }}
                                                    >
                                                        Proceed
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>) : (
                    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
                        <div className="fixed top-6 right-6 z-50">
                            <TimerDisplay
                                remainingTime={remainingTime}
                            />
                        </div>

                        <div className="max-w-4xl mx-auto p-6 pt-20">
                            {/* Assessment Info Section */}
                            <div className=" rounded-2xl shadow-16dp mb-8 overflow-hidden">
                                <div className=" p-6">
                                    <div className="flex items-center flex-col w-full items-start text-left gap-5 mb-4">
                                        {/* <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Timer className="w-5 h-5 text-primary" />
                                        </div> */}
                                        <h2 className="text-2xl w-full ml-3 text-left font-bold text-foreground">{assessmentData?.ModuleAssessment?.title}</h2>
                                        <p className='text-left text-muted-foreground ml-2 font-medium'>Complete all sections to submit your assessment. Read the instructions carefully before proceeding.

</p>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">                                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                                       <div className='flex items-center space-x-3'>
                                       {/* <Clock className="w-5 h-5 text-accent flex-shrink-0" /> */}
                                        {/* <div>
                                            <p className="text-sm text-left text-muted-foreground font-medium">Deadline</p>
                                            <p className="text-foreground font-semibold">
                                                {assessmentData?.endDatetime
                                                    ? formatToIST(assessmentData.endDatetime)
                                                    : 'No Deadline For This Assessment'
                                                }
                                            </p>
                                        </div> */}
                                       </div>
                                    </div>
                                        <div>
                                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                                                {/* <Timer className="w-5 h-5 text-secondary flex-shrink-0" /> */}
                                                {/* <div>
                                                    <p className="text-sm text-left text-muted-foreground font-medium">Test Time</p>
                                                    <p className="text-foreground font-semibold">
                                                        {Math.floor(assessmentData?.timeLimit / 3600)} Hours{' '}
                                                        {Math.floor((assessmentData?.timeLimit % 3600) / 60)} Minutes
                                                    </p>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* <div className=" rounded-xl p-4 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-left text-info-dark">
                                                Timer has started. Questions will disappear if you exit full screen.
                                                All problems (coding challenges, MCQs, and open-ended questions) must be completed in one session.
                                            </p>
                                        </div>
                                    </div> */}

                                    <div className=" rounded-xl p-4">
                                        <h5 className="font-bold text-warning-dark mb-3 flex items-center space-x-2">      
                                            <span>Proctoring Rules</span>
                                        </h5>
                                       
                                        <ul className="list-disc text-left list-inside space-y-1 text-warning-dark">
                                            <li>No copy-pasting is allowed during the assessment</li>
                                            <li>Tab switching or window switching is not permitted</li>
                                            <li>Assessment screen exit will result in violations</li>
                                            <li>Maximum 3 violations are allowed before auto-submission</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>                                {/* Coding Challenges Section */}
                            {(assessmentData?.codingQuestions?.length ?? 0) > 0 && (
                                <div className=" mb-8 overflow-hidden">
                                    <div className=" p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            {/* <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-accent" />
                                            </div> */}
                                            <h2 className="text-2xl font-bold text-foreground">Coding Challenges</h2>
                                        </div>

                                        {/* <div className="bg-info-light border border-info/20 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <AlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-info-dark">
                                                    You may run your code multiple times after making changes, but you are allowed to submit it only once.
                                                </p>
                                            </div>
                                        </div> */}
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {assessmentData?.codingQuestions?.map((question: CodingQuestion) => (
                                                <QuestionCard
                                                    isMobile={isMobile}
                                                    key={question.codingQuestionId}
                                                    id={question.codingQuestionId}
                                                    easyCodingMark={assessmentData?.easyCodingMark}
                                                    mediumCodingMark={assessmentData?.mediumCodingMark}
                                                    hardCodingMark={assessmentData?.hardCodingMark}
                                                    title={question.title}
                                                    description={question.difficulty}
                                                    assessmentSubmitId={assessmentSubmitId}
                                                    codingOutsourseId={question.codingOutsourseId}
                                                    codingQuestions={true}
                                                    onSolveChallenge={(id: any) =>
                                                        handleSolveChallenge(
                                                            'coding',
                                                            id,
                                                            question.codingQuestionId,
                                                            question.codingOutsourseId
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}                                {/* MCQs Section */}
                            {(assessmentData?.hardMcqQuestions ?? 0)+
                                (assessmentData?.easyMcqQuestions ?? 0) +
                                (assessmentData?.mediumMcqQuestions ?? 0) >
                                0 && (
                                    <div className=" mb-8 overflow-hidden">
                                        <div className=" p-6">
                                            <div className="flex items-center space-x-3">
                                                {/* <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                                                    <AlertCircle className="w-5 h-5 text-secondary" />
                                                </div> */}
                                                <h2 className="text-2xl font-bold text-foreground">Multiple Choice Questions</h2>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <QuestionCard
                                                id={1}
                                                title="Quiz"
                                                weightage={assessmentData?.weightageMcqQuestions}
                                                description={`${(assessmentData?.hardMcqQuestions || 0) +
                                                    (assessmentData?.easyMcqQuestions || 0) +
                                                    (assessmentData?.mediumMcqQuestions || 0)
                                                    } questions`}
                                                onSolveChallenge={() => handleSolveChallenge('quiz')}
                                                isQuizSubmitted={assessmentData?.IsQuizzSubmission}
                                            />
                                        </div>
                                    </div>
                                )}

                            {/* Open-ended Questions Section */}
                            {seperateOpenEndedQuestions.length > 0 && (
                                <div className=" mb-8 overflow-hidden">
                                    <div className=" p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-info" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-foreground">Open-Ended Questions</h2>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <QuestionCard
                                            id={1}
                                            title="Open-Ended Questions"
                                            description={`${seperateOpenEndedQuestions.length || 0} questions`}
                                            onSolveChallenge={() => handleSolveChallenge('open-ended')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit Assessment Button */}
                            <div className="flex justify-center">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            disabled={
                                                disableSubmit ||
                                                ((assessmentData?.totalMcqQuestions ?? 0)> 0 &&
                                                    assessmentData?.IsQuizzSubmission === false)
                                            }
                                            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-8dp hover:shadow-16dp ${disableSubmit ||
                                                    ((assessmentData?.totalMcqQuestions?? 0) > 0 &&
                                                        assessmentData?.IsQuizzSubmission === false)
                                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    : 'bg-primary hover:bg-primary-dark text-primary-foreground'
                                                }`}
                                        >
                                            Submit Assessment
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-card border-border shadow-32dp">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-foreground">
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-muted-foreground">
                                                This action cannot be undone. This will submit your whole assessment.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                                                onClick={submitAssessment}
                                            >
                                                Submit
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </AlertProvider>
        </div>
    )
}

export default Page
