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
  const bootcampId = courseIdParam?.toString() || null;
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
      const courseId = courseIdParam?.toString() || bootcampId; // Use courseId from params or fallback to bootcampId
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
      const courseId = courseIdParam?.toString() || bootcampId;
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
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8 mt-4 sm:mt-6 lg:mt-8">
        <div className="flex flex-col gap-y-4 text-left w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 lg:pr-10">
            <div className="min-w-0 flex-1">              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-words">
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
                  className="text-xs sm:text-sm"
                >
                  {assessmentDetails.assessmentState.charAt(0).toUpperCase() +
                    assessmentDetails.assessmentState.slice(1).toLowerCase()}
                </Badge>
              )}            </div>
            <div className="flex-shrink-0 self-start sm:self-auto mt-2 sm:mt-0">              <h2 className="bg-muted px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-2xl font-semibold whitespace-nowrap text-muted-foreground">
                Total Marks:{' '}
                {assessmentDetails.weightageMcqQuestions + assessmentDetails.weightageCodingQuestions}
              </h2>
            </div>
          </div>          {/* Question breakdown */}
          {hasQuestions && (
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {assessmentDetails.totalCodingQuestions > 0 && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-secondary">
                    {assessmentDetails.easyCodingQuestions +
                      assessmentDetails.mediumCodingQuestions +
                      assessmentDetails.hardCodingQuestions}
                  </h2>                  <p className="text-xs sm:text-sm text-muted-foreground">Coding Challenges</p>
                </div>
              )}
              {assessmentDetails.totalMcqQuestions > 0 && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-secondary">
                    {assessmentDetails.easyMcqQuestions +
                      assessmentDetails.mediumMcqQuestions +
                      assessmentDetails.hardMcqQuestions}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">MCQs</p>
                </div>
              )}
              {assessmentDetails.totalOpenEndedQuestions > 0 && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-secondary">
                    {assessmentDetails.totalOpenEndedQuestions}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Open-Ended</p>
                </div>
              )}
            </div>
          )}          {/* No questions message */}
          {!isAssessmentStarted && isDisabled && (
            <div className="my-2 w-full max-w-full sm:max-w-2xl mx-auto">
              <p className="mb-2 font-medium text-sm sm:text-base text-center sm:text-left">
                No Questions Available. Assessment will appear soon!
              </p>
            </div>
          )}

          {/* Time limit */}
          {hasQuestions && (            <p className={`flex items-center justify-center sm:justify-start gap-x-2 text-xs sm:text-sm text-muted-foreground ${isAssessmentStarted && 'mb-6 sm:mb-10'}`}>
              <Timer size={16} className="text-muted-foreground sm:w-[18px] sm:h-[18px]" />
              <span>Test Time:</span>
              <span className="font-semibold">
                {formatTimeLimit(assessmentDetails.timeLimit)}
              </span>
            </p>
          )}

          {/* Re-attempt request section */}
          {assessmentDetails.assessmentState?.toUpperCase() !== 'CLOSED' &&
            assessmentDetails.assessmentState?.toUpperCase() !== 'PUBLISHED' &&
            ((isAssessmentStarted && !reattemptRequested && !reattemptApproved) ||
              (isTimeOver && isAssessmentStarted && !reattemptRequested && !reattemptApproved)) && (              <div className="flex flex-col items-center justify-center p-5 bg-card border border-border rounded-lg shadow-2dp">
                <h2 className="mt-4 text-lg text-foreground flex items-center gap-x-2">
                  <div className="relative w-6 h-6">
                    <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-warning"></div>
                    <div className="absolute top-[4px] left-1/2 transform -translate-x-1/2 text-warning-foreground text-xs font-bold">
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
                  <DialogOverlay />                  <DialogContent className="mx-4 sm:mx-0 max-w-md sm:max-w-lg">
                    <DialogHeader>                      <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                        Requesting Re-Attempt
                      </DialogTitle>
                      <DialogDescription className="text-sm sm:text-md text-muted-foreground">
                        Zuvy team will receive your request and take a decision on granting a re-attempt
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 mt-4">
                      <Button
                        variant="outline"
                        className="border-border w-full sm:w-auto"
                        onClick={() => setReattemptDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="sm:ml-4 w-full sm:w-auto" onClick={requestReattempt}>
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

          {/* Re-attempt requested status */}
          {reattemptRequested && !reattemptApproved && (            <div className="flex flex-col items-center justify-center w-full p-5 bg-card border border-border rounded-lg shadow-2dp">
              <h2 className="text-lg font-semibold text-foreground">
                Your re-attempt request has been sent.
              </h2>
              <p className="text-sm text-muted-foreground">
                We'll notify you on email once it is approved.
              </p>
            </div>
          )}

          {/* Results display */}
          {isAssessmentStarted &&
            isSubmitedAt &&
            !(reattemptApproved && reattemptRequested && assessmentDetails.submitedOutsourseAssessments?.length > 0) && (
              <div>                <div
                  className={`${
                    isPassed
                      ? 'bg-success-light border-success'
                      : 'bg-destructive-light border-destructive'
                  } flex justify-between max-w-lg p-5 rounded-lg border shadow-4dp`}
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
                      variant="ghost"                      className={`${
                        isPassed
                          ? 'text-success hover:text-success-dark'
                          : 'text-destructive hover:text-destructive-dark'
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
            (!isAssessmentStarted || (reattemptRequested && reattemptApproved)) && (              <div
                className={`w-full max-w-lg flex flex-col items-center justify-center rounded-lg bg-success-light border border-success p-5 text-center transition-all duration-[1500ms] ease-in-out shadow-8dp ${
                  showActiveCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
              >
                <div className="text-success-dark font-medium">
                  {assessmentDetails.endDatetime ? (
                    <>
                      <p>The assessment is now available to be taken until</p>
                      <p className="font-semibold">{formatToIST(assessmentDetails.endDatetime)}</p>
                    </>
                  ) : (
                    <p>The assessment is available now</p>
                  )}
                </div>                <Button
                  onClick={handleStartAssessment}
                  className="mt-4 sm:mt-5 rounded-md bg-primary hover:bg-primary-dark px-4 sm:px-6 py-2 text-primary-foreground w-full sm:w-auto text-sm sm:text-base shadow-hover"
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
            )}          {/* Closed assessment card */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'CLOSED' && (
            <div              className={`w-full max-w-lg flex justify-center items-center gap-x-2 rounded-lg bg-destructive-light border border-destructive px-4 sm:px-6 py-3 font-medium text-destructive-dark text-center transition-all duration-[1500ms] ease-in-out text-sm sm:text-base shadow-error ${
                showClosedCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <AlertOctagon size={18} className="flex-shrink-0 sm:w-5 sm:h-5" />
              <span className="break-words">Assessment is closed. You cannot attempt it anymore.</span>
            </div>
          )}

          {/* Published assessment countdown */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'PUBLISHED' && (
            <div              className={`w-full max-w-lg flex flex-col text-center justify-center items-center gap-y-3 sm:gap-y-4 rounded-lg bg-card-elevated border border-border p-4 sm:p-6 shadow-8dp transition-all duration-[1500ms] ease-in-out ${
                showPublishedCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-x-3 text-foreground">
                <Timer size={20} className="animate-pulse text-accent sm:w-6 sm:h-6" />
                <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-wider break-words">
                  Assessment Begins In
                </h3>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-widest break-all">
                {countdown}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2 break-words">
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