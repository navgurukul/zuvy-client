import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Timer, AlertOctagon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from 'next/image';
import useAssessmentDetails from "@/hooks/useAssessmentDetails";
import useChapterDetails from "@/hooks/useChapterDetails";
import { api } from '@/utils/axios.config';
import { formatToIST, formatTimeLimit, calculateCountdown, startPolling, stopPolling } from '@/lib/utils';

interface AssessmentContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    assessmentId: number | null;
    moduleId: number;
  };
}

const AssessmentContent: React.FC<AssessmentContentProps> = ({ chapterDetails }) => {
  const router = useRouter();
  const { courseId: courseIdParam, moduleId: moduleIdParam } = useParams();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State management
  const [countdown, setCountdown] = useState<string>('');
  const [showPublishedCard, setShowPublishedCard] = useState(false);
  const [showActiveCard, setShowActiveCard] = useState(false);
  const [showClosedCard, setShowClosedCard] = useState(false);
  const [reattemptDialogOpen, setReattemptDialogOpen] = useState(false);
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isTimeOver, setIsTimeOver] = useState(false);
  
  // Extract IDs for the hooks
  const moduleId = chapterDetails.moduleId?.toString() || moduleIdParam?.toString() || null;
  const bootcampId = "502";
  const chapterId = chapterDetails.id?.toString() || null;
  
  const { assessmentDetails, loading, error, refetch } = useAssessmentDetails(
    chapterDetails.assessmentId,
    moduleId,
    bootcampId,
    chapterId
  );

  const { refetch: refetchChapter } = useChapterDetails(chapterId);

  // Derived states from assessment details
  const hasQuestions = assessmentDetails ? (
    assessmentDetails.totalCodingQuestions > 0 ||
    assessmentDetails.totalMcqQuestions > 0 ||
    assessmentDetails.totalOpenEndedQuestions > 0
  ) : false;

  const isAssessmentStarted = assessmentDetails?.submitedOutsourseAssessments?.[0]?.startedAt;
  const isSubmitedAt = assessmentDetails?.submitedOutsourseAssessments?.[0]?.submitedAt;
  const reattemptRequested = assessmentDetails?.submitedOutsourseAssessments?.[0]?.reattemptRequested || false;
  const reattemptApproved = assessmentDetails?.submitedOutsourseAssessments?.[0]?.reattemptApproved || false;
  const isPassed = assessmentDetails?.submitedOutsourseAssessments?.[0]?.isPassed;
  const marks = assessmentDetails?.submitedOutsourseAssessments?.[0]?.marks;
  const percentage = assessmentDetails?.submitedOutsourseAssessments?.[0]?.percentage;
  const passPercentage = assessmentDetails?.passPercentage;
  const submissionId = assessmentDetails?.submitedOutsourseAssessments?.[0]?.id;

  // Assessment state transitions handler
  const handleAssessmentStateTransitions = () => {
    if (!assessmentDetails) return;

    const state = assessmentDetails.assessmentState?.toUpperCase();

    const startPollingWithRef = () => {
      startPolling(pollIntervalRef, refetch);
    };

    const stopPollingWithRef = () => {
      stopPolling(pollIntervalRef);
    };

    if (state === 'PUBLISHED' && assessmentDetails.startDatetime) {
      stopPollingWithRef();
      setShowActiveCard(false);
      setShowClosedCard(false);
      setShowPublishedCard(true);

      const countdownInterval = setInterval(() => {
        const countdownValue = calculateCountdown(assessmentDetails.startDatetime);
        
        if (!countdownValue) {
          clearInterval(countdownInterval);
          setShowPublishedCard(false);
          startPollingWithRef();
          return;
        }
        
        setCountdown(countdownValue);
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else if (state === 'ACTIVE') {
      stopPollingWithRef();
      setShowPublishedCard(false);
      setShowClosedCard(false);
      setShowActiveCard(true);

      if (assessmentDetails.endDatetime) {
        const activeInterval = setInterval(() => {
          const now = new Date().getTime();
          const endTime = new Date(assessmentDetails.endDatetime).getTime();
          if (now > endTime) {
            clearInterval(activeInterval);
            setShowActiveCard(false);
            startPollingWithRef();
          }
        }, 300);

        return () => clearInterval(activeInterval);
      }
    } else if (state === 'CLOSED') {
      stopPollingWithRef();
      setShowPublishedCard(false);
      setShowActiveCard(false);
      setShowClosedCard(true);
    } else {
      setShowPublishedCard(false);
      setShowActiveCard(false);
      setShowClosedCard(false);
    }

    return stopPollingWithRef;
  };

  // Handle assessment start
  const handleStartAssessment = () => {
    setIsStartingAssessment(true);
    refetch();

    try {
      const courseId = "502"; // Extract from params if available
      const currentModuleId = moduleIdParam?.toString() || moduleId;
      const chapterId = chapterDetails.id;
      const assessmentId = assessmentDetails?.assessmentId;
      const assessmentUrl = `/student/course/${courseId}/studentAssessment?assessmentId=${assessmentId}&chapterId=${chapterId}&moduleId=${currentModuleId}`;
      window.open(assessmentUrl, '_blank')?.focus();
    } catch (error) {
      console.error('Failed to start assessment:', error);
      setIsStartingAssessment(false);
    }
  };

  // Handle view results
  const handleViewResults = () => {
    try {
      const courseId = "502";
      const currentModuleId = moduleIdParam?.toString() || moduleId;
      const resultsUrl = `/student/course/${courseId}/modules/${currentModuleId}/assessment/viewresults/${submissionId}`;
      router.push(resultsUrl);
    } catch (error) {
      console.error('Failed to view results:', error);
    }
  };

  // Request re-attempt
  const requestReattempt = async () => {
    try {
      await api.post(
        `/student/assessment/request-reattempt?assessmentSubmissionId=${submissionId}&userId=${assessmentDetails?.submitedOutsourseAssessments?.[0]?.userId}`
      );
      toast({
        title: 'Re-attempt Requested',
        description: 'Your request for a re-attempt has been sent.',
      });
      refetch();
    } catch (error) {
      console.error('Error requesting re-attempt:', error);
      toast({
        title: 'Error',
        description: 'Failed to request re-attempt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Time over check effect
  useEffect(() => {
    if (!assessmentDetails || !isAssessmentStarted || !assessmentDetails.timeLimit) {
      return;
    }

    const startTime = new Date(isAssessmentStarted).getTime();
    const endTime = startTime + assessmentDetails.timeLimit * 1000;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime >= endTime) {
        setIsTimeOver(true);
        clearInterval(interval);
      }
    }, 1000);

    const currentTime = Date.now();
    if (currentTime >= endTime) {
      setIsTimeOver(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [assessmentDetails, isAssessmentStarted]);

  // Broadcast channel for assessment communication
  useEffect(() => {
    const channel = new BroadcastChannel('assessment_channel');

    channel.onmessage = (event) => {
      if (event.data === 'assessment_submitted') {
        refetch();
        refetchChapter();

        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }

      if (event.data === 'assessment_tab_closed') {
        console.warn('Assessment tab was closed before submission');
        refetch();
        toast({
          title: 'Assessment Tab Closed',
          description: 'You closed the assessment before submitting.',
        });
      }
    };

    return () => {
      channel.close();
    };
  }, [refetch, refetchChapter]);

  // Assessment state transitions effect
  useEffect(() => {
    const cleanup = handleAssessmentStateTransitions();
    return cleanup;
  }, [assessmentDetails]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-heading font-bold mb-2">Loading Assessment...</h1>
          <p className="text-muted-foreground">Fetching assessment details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-heading font-bold mb-2 text-destructive">Error Loading Assessment</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  if (!assessmentDetails) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-heading font-bold mb-2">{chapterDetails.title}</h1>
          <p className="text-muted-foreground">Assessment details not available</p>
        </div>
      </div>
    );
  }

  const isDisabled = !hasQuestions;

  return (
    <div className="h-full">
      <div className="flex flex-col items-center justify-center px-4 py-8 mt-8">
        <div className="flex flex-col gap-y-4 text-left w-full max-w-lg">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {assessmentDetails.ModuleAssessment?.title}
              </h1>
              {assessmentDetails.assessmentState && (
                <Badge
                  variant={
                    assessmentDetails.assessmentState.toUpperCase() === 'ACTIVE'
                      ? 'secondary'
                      : assessmentDetails.assessmentState.toUpperCase() === 'PUBLISHED'
                      ? 'default'
                      : assessmentDetails.assessmentState.toUpperCase() === 'DRAFT'
                      ? 'outline'
                      : assessmentDetails.assessmentState.toUpperCase() === 'CLOSED'
                      ? 'destructive'
                      : 'destructive'
                  }
                  className="text-sm"
                >
                  {assessmentDetails.assessmentState.charAt(0).toUpperCase() +
                    assessmentDetails.assessmentState.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>
            <h2 className="bg-[#DEDEDE] px-2 py-1 text-sm rounded-2xl font-semibold whitespace-nowrap">
              Total Marks:{' '}
              {assessmentDetails.weightageMcqQuestions + assessmentDetails.weightageCodingQuestions}
            </h2>
          </div>

          {/* Question breakdown */}
          {hasQuestions && (
            <div className="flex gap-6">
              {assessmentDetails.totalCodingQuestions > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-secondary">
                    {assessmentDetails.easyCodingQuestions +
                      assessmentDetails.mediumCodingQuestions +
                      assessmentDetails.hardCodingQuestions}
                  </h2>
                  <p className="text-sm text-gray-600">Coding Challenges</p>
                </div>
              )}
              {assessmentDetails.totalMcqQuestions > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-secondary">
                    {assessmentDetails.easyMcqQuestions +
                      assessmentDetails.mediumMcqQuestions +
                      assessmentDetails.hardMcqQuestions}
                  </h2>
                  <p className="text-sm text-gray-600">MCQs</p>
                </div>
              )}
              {assessmentDetails.totalOpenEndedQuestions > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-secondary">
                    {assessmentDetails.totalOpenEndedQuestions}
                  </h2>
                  <p className="text-sm text-gray-600">Open-Ended</p>
                </div>
              )}
            </div>
          )}

          {/* No questions message */}
          {!isAssessmentStarted && isDisabled && (
            <div className="my-2 w-full max-w-2xl mx-auto">
              <p className="mb-2 font-medium">
                No Questions Available. Assessment will appear soon!
              </p>
            </div>
          )}

          {/* Time limit */}
          {hasQuestions && (
            <p className={`flex items-center gap-x-1 gap-y-2 text-sm text-gray-700 ${isAssessmentStarted && 'mb-10'}`}>
              <Timer size={18} className="text-gray-500" />
              Test Time:{' '}
              <span className="font-semibold">
                {formatTimeLimit(assessmentDetails.timeLimit)}
              </span>
            </p>
          )}

          {/* Re-attempt request section */}
          {assessmentDetails.assessmentState?.toUpperCase() !== 'CLOSED' &&
            assessmentDetails.assessmentState?.toUpperCase() !== 'PUBLISHED' &&
            ((isAssessmentStarted && !reattemptRequested && !reattemptApproved) ||
              (isTimeOver && isAssessmentStarted && !reattemptRequested && !reattemptApproved)) && (
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
                      ? `You Can Request For Re-Attempt before ${formatToIST(assessmentDetails.endDatetime)} If You Faced Any Issue`
                      : 'Your previous assessment attempt was interrupted'}
                  </div>
                </h2>
                <Dialog open={reattemptDialogOpen} onOpenChange={setReattemptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">Request Re-Attempt</Button>
                  </DialogTrigger>
                  <DialogOverlay />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-800">
                        Requesting Re-Attempt
                      </DialogTitle>
                      <DialogDescription className="text-md text-gray-600">
                        Zuvy team will receive your request and take a decision on granting a re-attempt
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        className="border border-[#4A4A4A]"
                        onClick={() => setReattemptDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="ml-4" onClick={requestReattempt}>
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

          {/* Re-attempt requested status */}
          {reattemptRequested && !reattemptApproved && (
            <div className="flex flex-col items-center justify-center w-full p-5 bg-white border rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Your re-attempt request has been sent.
              </h2>
              <p className="text-sm text-gray-600">
                We'll notify you on email once it is approved.
              </p>
            </div>
          )}

          {/* Results display */}
          {isAssessmentStarted &&
            isSubmitedAt &&
            !(reattemptApproved && reattemptRequested && assessmentDetails.submitedOutsourseAssessments?.length > 0) && (
              <div>
                <div
                  className={`${
                    isPassed
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                  } flex justify-between max-w-lg p-5 rounded-lg border`}
                >
                  <div className="flex gap-3">
                    <div className="mt-2">
                      <Image src="/flag.svg" alt="Result Flag" width={40} height={40} />
                    </div>
                    <div className="md:text-lg text-sm">
                      <p className="font-semibold">
                        Your Score: {Math.trunc(percentage) || 0}/100
                      </p>
                      <p>
                        {isPassed
                          ? 'Congratulations, you passed!'
                          : `You needed at least ${passPercentage} percentage to pass`}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      className={`${
                        isPassed
                          ? 'text-secondary hover:text-secondary'
                          : 'text-red-500 hover:text-red-500'
                      } font-semibold md:text-lg text-sm`}
                      onClick={handleViewResults}
                      disabled={chapterDetails.status === 'Pending' && !isSubmitedAt}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Active assessment card */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'ACTIVE' &&
            (!isAssessmentStarted || (reattemptRequested && reattemptApproved)) && (
              <div
                className={`w-full max-w-lg flex flex-col items-center justify-center rounded-lg bg-[#DCE7E3] p-5 text-center transition-all duration-[1500ms] ease-in-out ${
                  showActiveCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
              >
                <div className="text-[#518672] font-medium">
                  {assessmentDetails.endDatetime ? (
                    <>
                      <p>The assessment is now available to be taken until</p>
                      <p className="font-semibold">{formatToIST(assessmentDetails.endDatetime)}</p>
                    </>
                  ) : (
                    <p>The assessment is available now</p>
                  )}
                </div>
                <Button
                  onClick={handleStartAssessment}
                  className="mt-5 rounded-md bg-[#4A7C7A] px-6 py-2 text-white hover:bg-[#42706e]"
                  disabled={
                    isDisabled ||
                    (isAssessmentStarted && (!reattemptApproved || !reattemptRequested)) ||
                    isStartingAssessment
                  }
                >
                  {reattemptApproved && reattemptRequested && assessmentDetails.submitedOutsourseAssessments?.length > 0
                    ? 'Re-Attempt Assessment'
                    : 'Begin Assessment'}
                </Button>
              </div>
            )}

          {/* Closed assessment card */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'CLOSED' && (
            <div
              className={`w-full max-w-lg flex justify-center items-center gap-x-2 rounded-lg bg-red-100 px-6 py-3 font-medium text-red-700 text-center transition-all duration-[1500ms] ease-in-out ${
                showClosedCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <AlertOctagon size={20} />
              <span>Assessment is closed. You cannot attempt it anymore.</span>
            </div>
          )}

          {/* Published assessment countdown */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'PUBLISHED' && (
            <div
              className={`w-full max-w-lg flex flex-col text-center justify-center items-center gap-y-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg transition-all duration-[1500ms] ease-in-out ${
                showPublishedCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <div className="flex items-center gap-x-3 text-white">
                <Timer size={24} className="animate-pulse hidden sm:block" />
                <h3 className="text-lg sm:text-xl font-bold tracking-wider">
                  Assessment Begins In
                </h3>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 tracking-widest">
                {countdown}
              </div>
              <p className="text-gray-300 text-xs sm:text-sm mt-2">
                Get ready to showcase your skills! The assessment will begin soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentContent; 