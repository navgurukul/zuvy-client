'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertOctagon, Timer, TriangleIcon } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import Image from 'next/image'
import { fetchChapters, formatToIST, getAssessmentShortInfo, handleAssessmentStateTransitions } from '@/utils/students'
import { getModuleDataNew, getStudentChaptersState } from '@/store/store'
import { toast } from '@/components/ui/use-toast'
import useWindowSize from '@/hooks/useHeightWidth'
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { api } from '@/utils/axios.config'
import { is } from 'immutable'

const Assessment = ({
    assessmentShortInfo,
    assessmentOutSourceId,
    submissionId,
    chapterContent,
    setAssessmentShortInfo,
    setAssessmentOutSourceId,
    setSubmissionId,
}: {
    assessmentShortInfo: any
    assessmentOutSourceId: any
    submissionId: any
    chapterContent: any
    setAssessmentShortInfo: any
    setAssessmentOutSourceId: any
    setSubmissionId: any
}) => {
    const router = useRouter()
    const { viewcourses, moduleID } = useParams()
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const [countdown, setCountdown] = useState<string>('')
    const [showPublishedCard, setShowPublishedCard] = useState(false)
    const [showActiveCard, setShowActiveCard] = useState(false)
    const [showClosedCard, setShowClosedCard] = useState(false)

    const [testDuration, setTestDuration] = useState<number>(
        assessmentShortInfo?.timeLimit
    )
    const [reattemptDialogOpen, setReattemptDialogOpen] = useState(false)
    const [reattemptRequested, setReattemptRequested] = useState(
        assessmentShortInfo?.submitedOutsourseAssessments?.[0]
            ?.reattemptRequested || false
    )
    const [reattemptApproved, setReattemptApproved] = useState(
        assessmentShortInfo?.submitedOutsourseAssessments?.[0]
            ?.reattemptApproved || false
    )

    const { width } = useWindowSize()

    const { chapters, setChapters } = getStudentChaptersState()

    const [isTimeOver, setIsTimeOver] = useState(false)
    const isMobile = width < 768

    const hasQuestions =
        assessmentShortInfo?.totalCodingQuestions > 0 ||
        assessmentShortInfo?.totalQuizzes > 0 ||
        assessmentShortInfo?.totalOpenEndedQuestions > 0

    // const isAssessmentStarted =
    //     assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.startedAt
    // let isSubmitedAt =
    //     assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.submitedAt || null;

    const [isAssessmentStarted, setIsAssessmentStarted] =
        useState<boolean>(false)
    const [isSubmitedAt, setIsSubmitedAt] = useState<boolean>(false)

    const [isStartingAssessment, setIsStartingAssessment] = useState(false)

    const isPassed =
        assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.isPassed
    const marks = assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.marks
    const percentage =
        assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.percentage
    const passPercentage = assessmentShortInfo?.passPercentage

    const isDisabled = !hasQuestions

    const [isDeadlineCrossed, setIsDeadlineCrossed] = useState(
        assessmentShortInfo?.deadline
            ? new Date(assessmentShortInfo?.deadline) < new Date()
            : false
    )

    const handleStartAssessment = () => {
        setIsStartingAssessment(true) // Disable the button immediately

        getAssessmentShortInfo(
            chapterContent?.assessmentId,
            moduleID,
            viewcourses,
            chapterContent.id,
            setAssessmentShortInfo,
            setAssessmentOutSourceId,
            setSubmissionId
        )

        try {
            const assessmentUrl = `/student/courses/${viewcourses}/modules/${moduleID}/assessment/${assessmentShortInfo?.assessmentId}/chapter/${chapterContent.id}`
            window.open(assessmentUrl, '_blank')?.focus()
        } catch (error) {
            console.error('Failed to start assessment:', error)
            setIsStartingAssessment(false) // Re-enable button in case of error
        }
    }

    const handleViewResults = () => {
        try {
            const resultsUrl = `/student/courses/${viewcourses}/modules/${moduleID}/assessment/viewresults/${submissionId}`
            router.push(resultsUrl)
        } catch (error) {
            console.error('Failed to view results:', error)
        }
    }

    // Requesting re-attempt by calling the post api on endpoint - student/assessment/request-reattempt?assessmentSubmissionId=23432532&userId=23452345

    async function requestReattempt() {
        try {
            const response = await api.post(
                `/student/assessment/request-reattempt?assessmentSubmissionId=${submissionId}&userId=${assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.userId}`
            )
            setReattemptRequested(true)
            toast.success({
                title: 'Re-attempt Requested',
                description: 'Your request for a re-attempt has been sent.',
            })
        } catch (error) {
            console.error('Error requesting re-attempt:', error)
            toast.error({
                title: 'Error',
                description: 'Failed to request re-attempt. Please try again.',
            })
        }
    }

    useEffect(() => {
        setTestDuration(assessmentShortInfo?.timeLimit)
        setReattemptRequested(
            assessmentShortInfo?.submitedOutsourseAssessments?.[0]
                ?.reattemptRequested || false
        )
        setReattemptApproved(
            assessmentShortInfo?.submitedOutsourseAssessments?.[0]
                ?.reattemptApproved || false
        )
        const startedAt =
            assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.startedAt
        const submitedAt =
            assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.submitedAt

        setIsAssessmentStarted(!!startedAt)
        setIsSubmitedAt(!!submitedAt)

        if (!startedAt || !testDuration) {
            console.warn('No startedAt or testDuration provided.')
            return
        }

        const startTime = new Date(startedAt).getTime()
        const endTime = startTime + testDuration * 1000

        let interval = setInterval(() => {
            const currentTime = Date.now()

            if (currentTime >= endTime) {
                setIsTimeOver(true)
                clearInterval(interval) // Now interval is already defined!
            }
        }, 1000)

        // Optional: check immediately (in case time already passed)
        const currentTime = Date.now()
        if (currentTime >= endTime) {
            setIsTimeOver(true)
            clearInterval(interval)
        }

        return () => clearInterval(interval)
    }, [assessmentShortInfo, testDuration])

    useEffect(() => {
        const channel = new BroadcastChannel('assessment_channel')

        channel.onmessage = (event) => {
            if (event.data === 'assessment_submitted') {
                getAssessmentShortInfo(
                    chapterContent?.assessmentId,
                    moduleID,
                    viewcourses,
                    chapterContent.id,
                    setAssessmentShortInfo,
                    setAssessmentOutSourceId,
                    setSubmissionId
                )

                fetchChapters(moduleID, setChapters)

                if (document.fullscreenElement) {
                    document.exitFullscreen()
                }
            }

            if (event.data === 'assessment_tab_closed') {
                console.warn('Assessment tab was closed before submission');
                getAssessmentShortInfo(
                    chapterContent?.assessmentId,
                    moduleID,
                    viewcourses,
                    chapterContent.id,
                    setAssessmentShortInfo,
                    setAssessmentOutSourceId,
                    setSubmissionId
                )
                toast.info({
                    title: 'Assessment Tab Closed',
                    description: 'You closed the assessment before submitting.',
                })
            }
        }

        return () => {
            channel.close()
        }
    }, [])

    useEffect(() => {
        const cleanup = handleAssessmentStateTransitions(
            assessmentShortInfo,
            chapterContent,
            moduleID,
            viewcourses,
            setAssessmentShortInfo,
            setAssessmentOutSourceId,
            setSubmissionId,
            pollIntervalRef,
            setCountdown,
            setShowPublishedCard,
            setShowActiveCard,
            setShowClosedCard
        )
        return cleanup
    }, [
        assessmentShortInfo,
        chapterContent,
        moduleID,
        viewcourses,
        setAssessmentShortInfo,
        setAssessmentOutSourceId,
        setSubmissionId,
    ])

    return (
        <div className="h-full">
            <div
                className={`flex flex-col items-center justify-center px-0 ${isMobile ? 'py-3 mt-3' : 'py-8 mt-20'
                    } md:px-4 `}
            >
                <div className="flex flex-col gap-y-4 text-left w-full max-w-lg">
                    <div className="flex items-start justify-between gap-4 pr-10">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                {assessmentShortInfo?.ModuleAssessment?.title}
                            </h1>
                            {assessmentShortInfo?.assessmentState && (
                                <Badge
                                    variant={
                                        assessmentShortInfo.assessmentState.toUpperCase() ===
                                            'ACTIVE'
                                            ? 'secondary'
                                            : assessmentShortInfo.assessmentState.toUpperCase() ===
                                                'PUBLISHED'
                                                ? 'default'
                                                : assessmentShortInfo.assessmentState.toUpperCase() ===
                                                    'DRAFT'
                                                    ? 'yellow'
                                                    : assessmentShortInfo.assessmentState.toUpperCase() ===
                                                        'CLOSED'
                                                        ? 'default'
                                                        : 'destructive'
                                    }
                                    className="text-sm"
                                >
                                    {assessmentShortInfo.assessmentState
                                        .charAt(0)
                                        .toUpperCase() +
                                        assessmentShortInfo.assessmentState
                                            .slice(1)
                                            .toLowerCase()}
                                </Badge>
                            )}
                        </div>
                        <h2 className="bg-[#DEDEDE] px-2 py-1 text-sm rounded-2xl font-semibold whitespace-nowrap">
                            Total Marks:{' '}
                            {assessmentShortInfo?.weightageMcqQuestions +
                                assessmentShortInfo?.weightageCodingQuestions}
                        </h2>
                    </div>
                    {hasQuestions ? (
                        <div className="flex gap-6">
                            {assessmentShortInfo?.totalCodingQuestions > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {assessmentShortInfo?.easyCodingQuestions +
                                            assessmentShortInfo?.mediumCodingQuestions +
                                            assessmentShortInfo?.hardCodingQuestions}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Coding Challenges
                                    </p>
                                </div>
                            )}
                            {assessmentShortInfo?.totalQuizzes > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary">
                                        {assessmentShortInfo?.easyMcqQuestions +
                                            assessmentShortInfo?.mediumMcqQuestions +
                                            assessmentShortInfo?.hardMcqQuestions}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        MCQs
                                    </p>
                                </div>
                            )}
                            {assessmentShortInfo?.totalOpenEndedQuestions >
                                0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-secondary">
                                            {
                                                assessmentShortInfo?.totalOpenEndedQuestions
                                            }
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Open-Ended
                                        </p>
                                    </div>
                                )}
                        </div>
                    ) : null}

                    {!isAssessmentStarted && (
                        <div className="my-2 w-full max-w-2xl mx-auto">
                            {isDisabled && (
                                <p className="mb-2 font-medium">
                                    No Questions Available. Assessment will
                                    appear soon!
                                </p>
                            )}
                        </div>
                    )}
                    {hasQuestions && (
                        <p
                            className={`flex items-center gap-x-1 gap-y-2 text-sm text-gray-700 ${isAssessmentStarted && 'mb-10'
                                }`}
                        >
                            <Timer size={18} className="text-gray-500" />
                            Test Time:{' '}
                            <span className="font-semibold">
                                {Math.floor(
                                    assessmentShortInfo.timeLimit / 3600
                                )}{' '}
                                hours{' '}
                                {Math.floor(
                                    (assessmentShortInfo.timeLimit % 3600) / 60
                                )}{' '}
                                minutes
                            </span>
                        </p>
                    )}

                    {assessmentShortInfo.assessmentState?.toUpperCase() !== 'CLOSED' &&
                        assessmentShortInfo.assessmentState?.toUpperCase() !== 'PUBLISHED' &&
                        ((isAssessmentStarted &&
                            !reattemptRequested &&
                            !reattemptApproved) ||
                            (isTimeOver &&
                                isAssessmentStarted &&
                                !reattemptRequested &&
                                !reattemptApproved)) && (
                            <>
                                <div className="flex flex-col items-center justify-center p-5 bg-white border rounded-lg shadow-sm">
                                    <h2 className="mt-4 text-lg text-gray-800 flex items-center gap-x-2">
                                        <div className="relative w-6 h-6">
                                            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
                                            <div className="absolute top-[4px] left-1/2 transform -translate-x-1/2 text-black text-xs font-bold">
                                                !
                                            </div>
                                        </div>

                                        <div>
                                            {isSubmitedAt
                                                ? `You Can Request For Re-Attempt before ${formatToIST(assessmentShortInfo.endDatetime)} If You Faced Any Issue`
                                                : 'Your previous assessment attempt was interrupted'}
                                        </div>
                                    </h2>
                                    <Dialog
                                        open={reattemptDialogOpen}
                                        onOpenChange={setReattemptDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className="mt-4">
                                                Request Re-Attempt
                                            </Button>
                                        </DialogTrigger>
                                        <DialogOverlay />
                                        <DialogContent className=" ">
                                            <DialogHeader>
                                                <DialogTitle className="text-lg font-bold text-gray-800 ">
                                                    Requesting Re-Attempt
                                                </DialogTitle>
                                                <DialogDescription className="text-md text-gray-600 ">
                                                    Zuvy team will receive your
                                                    request and take a decision on
                                                    granting a re-attempt
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex justify-end mt-4">
                                                {/* lets close the dialog on clicking cancel button */}
                                                <Button
                                                    variant="outline"
                                                    className="border border-[#4A4A4A]"
                                                    onClick={() =>
                                                        setReattemptDialogOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="ml-4"
                                                    onClick={requestReattempt}
                                                >
                                                    Send Request
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </>
                        )}

                    {reattemptRequested && !reattemptApproved && (
                        <div className="flex flex-col items-center justify-center w-full p-5 bg-white border rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Your re-attempt request has been
                                sent.
                            </h2>
                            <p className="text-sm text-gray-600">
                                We’ll notify you on email once it is
                                approved.
                            </p>
                        </div>
                    )}

                    {isAssessmentStarted &&
                        isSubmitedAt &&
                        !(
                            reattemptApproved &&
                            reattemptRequested &&
                            assessmentShortInfo
                                ?.submitedOutsourseAssessments
                                ?.length > 0
                        ) && (
                            <div>
                                <div
                                    className={`${isPassed
                                        ? 'bg-green-100 border-green-500'
                                        : 'bg-red-100 border-red-500 '
                                        } flex justify-between max-w-lg p-5 rounded-lg border`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-2">
                                            <Image
                                                src="/flag.svg"
                                                alt="Empty State"
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                        <div className="md:text-lg  text-sm">
                                            <p className=" font-semibold bg-#DEDEDE">
                                                Your Score:{' '}
                                                {Math.trunc(percentage) || 0}
                                                /100
                                            </p>
                                            <p>
                                                {isPassed
                                                    ? 'Congratulations, you passed!'
                                                    : `You needed at least ${passPercentage} percentage to pass`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="">
                                        <Button
                                            variant="ghost"
                                            className={`${isPassed
                                                ? 'text-secondary hover:text-secondary'
                                                : 'text-red-500 hover:text-red-500'
                                                }  font-semibold md:text-lg text-sm `}
                                            onClick={handleViewResults}
                                            disabled={
                                                chapterContent.status ===
                                                'Pending' && !isSubmitedAt
                                            }
                                        >
                                            View Results
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                    {assessmentShortInfo?.assessmentState?.toUpperCase() ===
                        'ACTIVE' &&
                        (!isAssessmentStarted ||
                            (reattemptRequested &&
                                reattemptApproved)) && (
                            <div
                                className={`w-full max-w-lg flex flex-col items-center justify-center rounded-lg bg-[#DCE7E3] p-5 text-center transition-all duration-[1500ms] ease-in-out ${showActiveCard
                                    ? 'scale-100 opacity-100'
                                    : 'scale-0 opacity-0'
                                    }`}
                            >
                                <div className="text-[#518672] font-medium">
                                    {assessmentShortInfo?.endDatetime ? (
                                        <>
                                            <p>
                                                The assessment is
                                                now available to be
                                                taken until
                                            </p>
                                            <p className="font-semibold">
                                                {formatToIST(
                                                    assessmentShortInfo.endDatetime
                                                )}
                                            </p>
                                        </>
                                    ) : (
                                        <p>
                                            The assessment is
                                            available now
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleStartAssessment}
                                    className="mt-5 rounded-md bg-[#4A7C7A] px-6 py-2 text-white hover:bg-[#42706e]"
                                    disabled={
                                        isDisabled ||
                                        (isAssessmentStarted &&
                                            (!reattemptApproved ||
                                                !reattemptRequested)) ||
                                        isStartingAssessment
                                    }
                                >
                                    {reattemptApproved &&
                                        reattemptRequested &&
                                        assessmentShortInfo
                                            ?.submitedOutsourseAssessments
                                            ?.length > 0
                                        ? 'Re-Attempt Assessment'
                                        : 'Begin Assessment'}
                                </Button>
                            </div>
                        )}

                    {assessmentShortInfo?.assessmentState?.toUpperCase() ===
                        'CLOSED' && (
                            <div
                                className={`w-full max-w-lg flex justify-center items-center gap-x-2 rounded-lg bg-red-100 px-6 py-3 font-medium text-red-700 text-center transition-all duration-[1500ms] ease-in-out ${showClosedCard
                                    ? 'scale-100 opacity-100'
                                    : 'scale-0 opacity-0'
                                    }`}
                            >
                                <AlertOctagon size={20} />
                                <span>
                                    Assessment is closed. You cannot
                                    attempt it anymore.
                                </span>
                            </div>
                        )}

                    {assessmentShortInfo?.assessmentState?.toUpperCase() ===
                        'PUBLISHED' && (
                            <div
                                className={`w-full max-w-lg flex flex-col text-center justify-center items-center gap-y-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg transition-all duration-[1500ms] ease-in-out ${showPublishedCard
                                    ? 'scale-100 opacity-100'
                                    : 'scale-0 opacity-0'
                                    }`}
                            >
                                <div className="flex items-center gap-x-3 text-white">
                                    <Timer
                                        size={24}
                                        className="animate-pulse hidden sm:block"
                                    />
                                    <h3 className="text-lg sm:text-xl font-bold tracking-wider">
                                        Assessment Begins In
                                    </h3>
                                </div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 tracking-widest">
                                    {countdown}
                                </div>
                                <p className="text-gray-300 text-xs sm:text-sm mt-2">
                                    Get ready to showcase your skills!
                                    The assessment will begin soon.
                                </p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

export default Assessment
