import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Timer, AlertOctagon, Check, X, RotateCcw, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import  {AssessmentSkeleton} from "@/app/student/_components/Skeletons"
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
import { formatTimeLimit, calculateCountdown, startPolling, stopPolling } from '@/lib/utils';
import {AssessmentContentProps} from '@/app/student/_components/chapter-content/componentChapterType'


function formatToIST(dateString: string | undefined) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

const AssessmentContent: React.FC<AssessmentContentProps> = ({ chapterDetails, onChapterComplete }) => {
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
  const [chapterStatus, setChapterStatus] = useState(chapterDetails.status);
  // Memoize IDs to prevent unnecessary API calls
  const moduleId = useMemo(
    () => chapterDetails.moduleId?.toString() || moduleIdParam?.toString() || null,
    [chapterDetails.moduleId, moduleIdParam]
  );
  const bootcampId = useMemo(
    () => courseIdParam?.toString() || null,
    [courseIdParam]
  );
  const chapterId = useMemo(
    () => chapterDetails.id?.toString() || null,
    [chapterDetails.id]
  );

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
      const resultsUrl = `/student/course/${courseId}/modules/${currentModuleId}/assessmentResult/${submissionId}`;
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
        // Update chapter status to completed
        if (chapterStatus === 'Pending') {
          setChapterStatus('Completed');
        }
        if (typeof onChapterComplete === 'function') {
          onChapterComplete();
        }
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }

      if (event.data === 'assessment_tab_closed') {
        console.warn('Assessment tab was closed before submission');
        refetch();
        window.location.reload();
        toast({
          title: 'Assessment Tab Closed',
          description: 'You closed the assessment before submitting.',
        });
      }
    };

    return () => {
      channel.close();
    };
  }, [refetch, refetchChapter, onChapterComplete, chapterStatus]);

  // Assessment state transitions effect
  useEffect(() => {
    const cleanup = handleAssessmentStateTransitions();
    return cleanup;
  }, [assessmentDetails]);

  useEffect(() => {
    if (chapterStatus === 'Completed') {
      onChapterComplete?.()
    }
  }, [chapterStatus])



  if (loading) {
       return <AssessmentSkeleton/>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-heading font-bold mb-2 text-destructive">Error Loading Assessment</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Try Again</Button>
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
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8 mt-4 sm:mt-6 lg:mt-8">
        <div className="flex flex-col gap-y-4 text-left w-full max-w-lg sm:max-w-xl lg:max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 lg:pr-10 mb-8">
            <div className="min-w-0 flex-1">
              <div className="flex w-full justify-between items-center mb-6">
                <h5 className=" font-bold text-foreground break-words">
                  {assessmentDetails.ModuleAssessment?.title}
                </h5>
                <span className={`text-xs dark:text-white font-semibold px-4 py-1 rounded-full border ${chapterStatus === 'Pending' ? 'text-warning border-warning bg-warning-light' : 'text-success border-success bg-success-light'}`}>{chapterStatus === 'Pending' ? 'Not Attempted' : 'Completed'}</span>
              </div>
              {/* Meta Info Row */}
              <div className="flex flex-wrap gap-x-12 gap-y-2 mb-8">
                <span className="flex flex-col items-start gap-y-1 min-w-[120px]">
                  <span className="font-semibold text-sm text-muted-foreground">Start Date</span>
                  <span className="text-lg font-medium text-foreground">{formatToIST(assessmentDetails.startDatetime)}</span>
                </span>
                {assessmentDetails.endDatetime && <span className="flex flex-col items-start gap-y-1 min-w-[120px]">
                  <span className="font-semibold text-sm text-muted-foreground">End Date</span>
                  <span className="text-lg font-medium text-foreground">{formatToIST(assessmentDetails.endDatetime)}</span>
                </span>}

                <span className="flex flex-col items-start gap-y-1 min-w-[120px]">
                  <span className="font-semibold text-sm text-muted-foreground">Duration</span>
                  <span className="text-lg font-medium text-foreground">{formatTimeLimit(assessmentDetails.timeLimit)}</span>
                </span>
                <span className="flex flex-col items-start gap-y-1 min-w-[120px]">
                  <span className="font-semibold text-sm text-muted-foreground">Total Marks</span>
                  <span className="text-lg font-medium text-foreground">{assessmentDetails.weightageMcqQuestions + assessmentDetails.weightageCodingQuestions}</span>
                </span>
              </div>
              {/* Assessment State Badge (optional, can be removed if not needed) */}
              {/* {assessmentDetails.assessmentState && (
                <Badge
                  variant={
                    assessmentDetails.assessmentState.toUpperCase() === 'ACTIVE'
                      ? 'default'
                      : assessmentDetails.assessmentState.toUpperCase() === 'PUBLISHED'
                        ? 'outline'
                        : assessmentDetails.assessmentState.toUpperCase() === 'DRAFT'
                          ? 'outline'
                          : assessmentDetails.assessmentState.toUpperCase() === 'CLOSED'
                            ? 'destructive'
                            : 'destructive'
                  }
                  className={`text-xs sm:text-sm ${assessmentDetails.assessmentState.toUpperCase() === 'ACTIVE'
                    ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                    : ''
                    }`}
                >
                  {assessmentDetails.assessmentState.charAt(0).toUpperCase() +
                    assessmentDetails.assessmentState.slice(1).toLowerCase()}
                </Badge>
              )} */}
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {assessmentDetails.ModuleAssessment?.description ? assessmentDetails.ModuleAssessment?.description : 'No description available'}
            </p>
          </div>

          {/* Re-attempt request section */}
          {assessmentDetails.assessmentState?.toUpperCase() !== 'CLOSED' &&
            assessmentDetails.assessmentState?.toUpperCase() !== 'PUBLISHED' &&
            ((isAssessmentStarted && !reattemptRequested && !reattemptApproved) ||
              (isTimeOver && isAssessmentStarted && !reattemptRequested && !reattemptApproved)) && (<div className="flex bg-warning/15 flex-col items-center justify-center w-full max-w-lg sm:max-w-xl lg:max-w-4xl p-5 bg-card border border-border rounded-lg shadow-2dp">
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
                    <Button className="mt-4 bg-warning hover:bg-warning/50 text-black font-semibold">
                    <RotateCcw className=" h-3.5 mx-2" />
                    Request Re-Attempt</Button>
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
                      <Button className="sm:ml-4 w-full sm:w-auto bg-primary hover:bg-primary-dark text-primary-foreground" onClick={requestReattempt}>
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

          {/* Re-attempt requested status */}
          {reattemptRequested && !reattemptApproved && (<div className="flex flex-col items-center justify-center w-full max-w-lg sm:max-w-xl lg:max-w-4xl p-5 bg-card border border-border rounded-lg shadow-2dp">
            <h2 className="text-lg font-semibold text-foreground">
              Your re-attempt request has been sent.
            </h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ll notify you on email once it is approved.
            </p>
          </div>
          )}

          {/* Results display */}
          {isAssessmentStarted &&
            isSubmitedAt &&
            !(reattemptApproved && reattemptRequested && assessmentDetails.submitedOutsourseAssessments?.length > 0) && (
              <div
                className=''
              >
                <div
                  className={`  ${isPassed
                    ? 'bg-success-light border-success'
                    : 'bg-destructive-light border-destructive'
                    } flex flex-col items-center justify-between max-w-lg sm:max-w-xl lg:max-w-4xl py-8 rounded-lg border shadow-4dp`}
                >
                  <div className="flex gap-2 items-center">

                    <div className="md:text-lg text-sm space-y-2">


                      <p className={`${isPassed ? 'text-success' : 'text-destructive'} font-semibold flex items-center gap-3 dark:text-white`}>
                        {isPassed ? (
                          <>
                            <CheckCircle size={20} className="text-success" />
                            You passed this assessment successfully
                          </>
                        ) : (
                          <>
                            <X size={20} className="text-destructive dark:text-white" />
                            You needed at least {passPercentage}% to pass
                          </>
                        )}
                      </p>

                      <p className="font-semibold text-center">
                        Your Score: {(percentage.toFixed(2)) || 0}/100
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button
                      className={`${isPassed ? 'text-success bg-success text-white' : 'text-destructive bg-destructive text-white'} font-semibold mt-3 `}
                      onClick={handleViewResults}
                      disabled={chapterStatus === 'Pending' && !isSubmitedAt}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Active assessment card */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'ACTIVE' &&
            (!isAssessmentStarted || (reattemptRequested && reattemptApproved)) && (<div
              className={`w-full max-w-lg sm:max-w-xl lg:max-w-4xl flex flex-col items-center justify-center rounded-lg bg-success-light border border-success p-5 text-center transition-all duration-[1500ms] ease-in-out shadow-8dp ${showActiveCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
            >
              <div className="text-success-dark text-left w-full font-medium">
                {assessmentDetails.endDatetime ? (
                  <>
                    <p className="font-bold text-accent text-center mb-4">
                      Assessment is open. Please attempt it before end date
                    </p>
                    {/* <p className="font-semibold">{formatToIST(assessmentDetails.endDatetime)}</p> */}
                  </>
                ) : (
                  <p className='text-center text-accent font-semibold ' >The assessment is available now</p>
                )}
                <div className='text-center' >
                  <Button
                    onClick={handleStartAssessment}
                    className="mt-4 sm:mt-5 text-left rounded-md bg-primary hover:bg-primary-dark px-4 sm:px-6 py-2 text-primary-foreground w-full sm:w-auto text-sm sm:text-base shadow-hover"
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

              </div>
            </div>
            )}                     {/* Closed assessment card */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'CLOSED' && (
            <div className={`w-full max-w-lg sm:max-w-xl lg:max-w-4xl py-8 flex justify-center items-center gap-x-2 rounded-lg bg-destructive-light border border-destructive px-4 sm:px-6 py-3 font-medium text-destructive-dark text-center transition-all duration-[1500ms] ease-in-out text-sm sm:text-base shadow-error ${showClosedCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              
              <div className='flex flex-col items-center space-y-5' >
                <span className=" text-destructive flex items-center gap-x-2 font-semibold"><XCircle size={20} className='text-destructive' />Assessment expired and cannot be submitted.</span>
                <span className='text-destructive font-medium text-sm'>End Date: {formatToIST(assessmentDetails.endDatetime)}</span>
              </div>
            </div>
          )}

          {/* Published assessment countdown */}
          {assessmentDetails.assessmentState?.toUpperCase() === 'PUBLISHED' && (
            <div className={`w-full max-w-lg sm:max-w-xl lg:max-w-4xl flex flex-col text-center justify-center items-center gap-y-3 sm:gap-y-4 rounded-lg bg-card-elevated border border-border p-4 sm:p-6 shadow-8dp transition-all duration-[1500ms] ease-in-out ${showPublishedCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <div className="flex flex-col sm:flex-row w-full items-center gap-2 sm:gap-x-3 text-foreground">
                <Timer size={20} className="animate-pulse text-primary sm:w-6 sm:h-6" />
                <p className="text-muted-foreground text-left">
                  The Assessment Begins In
                </p>
              </div>
              <div className="text-2xl sm:text-3xl text-left w-full lg:text-4xl font-semibold text-primary tracking-widest break-all">
                {countdown}
              </div>
              {/* <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2 break-words">
                Get ready to showcase your skills! The assessment will begin soon.
              </p> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentContent; 










