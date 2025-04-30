'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertOctagon, Timer, TriangleIcon } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import Image from 'next/image'
import { fetchChapters, getAssessmentShortInfo } from '@/utils/students'
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
    const [testDuration, setTestDuration] = useState<number>(assessmentShortInfo?.timeLimit)
    const { viewcourses, moduleID } = useParams()
    const [reattemptDialogOpen, setReattemptDialogOpen] = useState(false)
    const [reattemptRequested, setReattemptRequested] = useState(assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.reattemptRequested || false)
    const [reattemptApproved, setReattemptApproved] = useState(assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.reattemptApproved || false)


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

    const [isDeadlineCrossed, setIsDeadlineCrossed] = useState(assessmentShortInfo?.deadline
        ? new Date(assessmentShortInfo?.deadline) < new Date()
        : false)

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
            const response = api.post(
                `/student/assessment/request-reattempt?assessmentSubmissionId=${submissionId}&userId=${assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.userId}`
            )
            setReattemptRequested(true);
            toast({
                title: 'Re-attempt Requested',
                description: 'Your request for a re-attempt has been sent.',
                className: 'text-left capitalize',
            })
        } catch (error) {
            console.error('Error requesting re-attempt:', error)
            toast({
                title: 'Error',
                description: 'Failed to request re-attempt. Please try again.',
                className: 'text-left capitalize',
                variant: 'destructive',
            })
        }
    }

    useEffect(() => {
        setTestDuration((assessmentShortInfo?.timeLimit));
        setReattemptRequested(assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.reattemptRequested || false);
        setReattemptApproved(assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.reattemptApproved || false);
        const startedAt = assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.startedAt;
        const submitedAt = assessmentShortInfo?.submitedOutsourseAssessments?.[0]?.submitedAt;

        setIsAssessmentStarted(!!startedAt);
        setIsSubmitedAt(!!submitedAt);

        if (!startedAt || !testDuration) {
            console.warn("No startedAt or testDuration provided.");
            return;
        }

        const startTime = new Date(startedAt).getTime();
        const endTime = startTime + testDuration * 1000;

        let interval = setInterval(() => {
            const currentTime = Date.now();

            if (currentTime >= endTime) {
                setIsTimeOver(true);
                clearInterval(interval); // Now interval is already defined!
            }
        }, 1000);

        // Optional: check immediately (in case time already passed)
        const currentTime = Date.now();
        if (currentTime >= endTime) {
            setIsTimeOver(true);
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [assessmentShortInfo, testDuration]);


    useEffect(() => {
        const channel = new BroadcastChannel('assessment_channel');

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
                );

                fetchChapters(moduleID, setChapters);

                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }

            if (event.data === 'assessment_tab_closed') {
                console.warn('Assessment tab was closed before submission');
                toast({
                    title: 'Assessment Tab Closed',
                    description: 'You closed the assessment before submitting.',
                    className: 'text-left capitalize',
                    variant: 'destructive',
                });
            }
        };

        return () => {
            channel.close();
        };
    }, []);



    return (
        <div className="h-full">
            <div className="flex flex-col items-center justify-center px-0 py-8 mt-20 md:px-4 ">
                <div className="flex flex-col gap-x-4 gap-y-1 text-left w-full max-w-lg">
                    <div className="flex items-center justify-between gap-4 pr-10">
                        <h1 className="text-2xl font-bold text-gray-800 text-center">
                            {assessmentShortInfo?.ModuleAssessment?.title}
                        </h1>
                        <h2 className="bg-[#DEDEDE] px-2 py-1 text-sm rounded-2xl font-semibold">
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

                    {(isAssessmentStarted &&
                        !reattemptRequested && !reattemptApproved || (isTimeOver && isAssessmentStarted &&
                            !reattemptRequested && !reattemptApproved)) && (
                            <>
                                <div className="flex flex-col items-center justify-center w-full p-5 mb-5 bg-white border rounded-lg shadow-sm">
                                    <h2 className="mt-4 text-lg text-gray-800 flex items-center gap-x-2">

                                        <div className="relative w-6 h-6">
                                            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
                                            <div className="absolute top-[4px] left-1/2 transform -translate-x-1/2 text-black text-xs font-bold">!</div>
                                        </div>

                                        <div>
                                            {isSubmitedAt ? 'You Can Request For Re-Attempt If You Faced Any Issue' : 'Your previous assessment attempt was interrupted'}
                                        </div>
                                    </h2>
                                    <Dialog open={reattemptDialogOpen} onOpenChange={setReattemptDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="mt-4">
                                                Request Re-Attempt
                                            </Button>
                                        </DialogTrigger>
                                        <DialogOverlay />
                                        <DialogContent className="w-[30%] h-[29%] [&>button]:hidden" >

                                            <DialogHeader>
                                                <DialogTitle className="text-lg font-bold text-gray-800 w-full">
                                                    Requesting Re-Attempt
                                                </DialogTitle>
                                                <DialogDescription className="text-md text-gray-600 w-full">
                                                    Zuvy team will receive your request and take a decision on granting a re-attempt
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex justify-end mt-4">
                                                {/* lets close the dialog on clicking cancel button */}
                                                <Button variant="outline" className='border border-[#4A4A4A]' onClick={() => setReattemptDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button className="ml-4" onClick={requestReattempt}>
                                                    Send Request
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </>

                        )
                    }

                    {!reattemptRequested && !reattemptApproved && isAssessmentStarted &&
                        chapterContent.status === 'Pending' &&
                        !isSubmitedAt && !isTimeOver && (
                            <p className="text-md font-semibold text-red-400">
                                You have not submitted the assessment properly. You will get the option to apply for Re-Attempt once the deadline is crossed.
                            </p>
                        )
                    }

                    {reattemptRequested && !reattemptApproved && (isTimeOver || isSubmitedAt) && (
                        <div className="flex flex-col items-center justify-center w-full p-5 mb-5 bg-white border rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Your re-attempt request has been sent.
                            </h2>
                            <p className="text-sm text-gray-600">
                                We’ll notify you on email once it is approved.
                            </p>
                        </div>
                    )}

                    {isAssessmentStarted && isSubmitedAt && !(reattemptApproved && reattemptRequested && assessmentShortInfo?.submitedOutsourseAssessments?.length > 0) &&(
                        <div className={`md:mr-0 mr-10 `}>
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
                                            {Math.trunc(percentage) || 0}/100
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
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center">
            {(!isAssessmentStarted || (reattemptRequested && reattemptApproved)) && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="">
                                    <Button
                                        onClick={handleStartAssessment}
                                        className=" "
                                        disabled={
                                            isDisabled ||
                                            (isAssessmentStarted && (!reattemptApproved || !reattemptRequested)) ||
                                            isStartingAssessment
                                        }
                                    >
                                        {(reattemptApproved && reattemptRequested && assessmentShortInfo?.submitedOutsourseAssessments?.length > 0) ? 'Re-Attempt Assessment' : 'Start Assessment'}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {isDisabled && (
                                <TooltipContent>
                                    No Questions Available. Assessment will
                                    appear soon!
                                </TooltipContent>
                            )}
                            {isDeadlineCrossed && (
                                <TooltipContent>
                                    You have missed the deadline to start the
                                    assessment
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                )}

                {isDeadlineCrossed && (
                    <h3 className="text-red-500 text-md mt-4">
                        Deadline Crossed
                    </h3>
                )}
            </div>
        </div>
    )
}

export default Assessment
