"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  handleFullScreenChange,
  handleVisibilityChange,
  requestFullScreen,
  updateProctoringData,
  getProctoringData,
} from "@/utils/students";
import QuizQuestions from "./QuizQuestions";
import OpenEndedQuestions from "./OpenEndedQuestions";
import IDE from "./IDE";
import { useCodingSubmissions } from "@/app/student/hooks/useCodingSubmissions";
import useStartAssessment from "@/app/student/hooks/useStartAssessment";
import useChapterCompletion from "@/app/student/hooks/useChapterCompletion";
import useAssessmentQuizQuestions from "@/app/student/hooks/useAssessmentQuizQuestions";
import useAssessmentOpenEndedQuestions from "@/app/student/hooks/useAssessmentOpenEndedQuestions";
import useAssessmentSubmissions from "@/app/student/hooks/useAssessmentSubmissions";
import useSubmitAssessment from "@/app/student/hooks/useSubmitAssessment";

import { toast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { AlertProvider } from "./ProctoringAlerts";

import PreventBackNavigation from "./PreventBackNavigation";
import useWindowSize from "@/hooks/useHeightWidth";
import {
  AssessmentData,
  CodingQuestion,
  PageParams,
  QType,
} from "@/app/student/course/[courseId]/org/[orgId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType";

import {
  TopBar,
  FullscreenPrompt,
  AssessmentHeader,
  CodingSection,
  McqSection,
  OpenEndedSection,
  SubmitAssessmentDialog,
} from "@/app/student/course/[courseId]/org/[orgId]/studentAssessment/_studentAssessmentComponents/utils/assessmentUtils";


function Page({ params }: PageParams) {
  // -------- params/derived --------
  const decodedAssessmentId = useMemo(
    () => parseInt(decodeURIComponent(params.assessmentOutSourceId).replace(/\[|\]/g, "")),
    [params.assessmentOutSourceId]
  );
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const orgId = params.orgId;

  // -------- state --------
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isOpeningdialogOpen, setIsOpeningdialogOpen] = useState(false);
  const [selectedQuesType, setSelectedQuesType] = useState<QType>("quiz");
  const [isSolving, setIsSolving] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentSubmitId, setAssessmentSubmitId] = useState<number | null>(null);
  const [selectedCodingOutsourseId, setSelectedCodingOutsourseId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  const [runCodeLanguageId, setRunCodeLanguageId] = useState<number>(0);
  const [runSourceCode, setRunSourceCode] = useState<string>("");

  const [isTabProctorOn, setIsTabProctorOn] = useState(false);
  const [isFullScreenProctorOn, setIsFullScreenProctorOn] = useState(false);
  const [isCopyPasteProctorOn, setIsCopyPasteProctorOn] = useState(false);

  const [disableSubmit, setDisableSubmit] = useState(false);
  const intervalIdRef = useRef<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // -------- hooks --------
  const { startAssessment } = useStartAssessment();

  const { quizQuestions: separateQuizQuestions, refetch: refetchQuizQuestions } =
    useAssessmentQuizQuestions(decodedAssessmentId);

  const { openEndedQuestions: separateOpenEndedQuestions, refetch: refetchOpenEndedQuestions } =
    useAssessmentOpenEndedQuestions(decodedAssessmentId);

  const { fetchSubmissions } = useAssessmentSubmissions({
    assessmentId: decodedAssessmentId,
    moduleId: params.moduleID,
    bootcampId: params.viewcourses,
    chapterId: params.chapterId,
  });

  const { submitAssessment: submitAssessmentApi } = useSubmitAssessment();

  const { completeChapter } = useChapterCompletion({
    courseId: params.viewcourses,
    moduleId: params.moduleID,
    chapterId: chapterId ? String(chapterId) : params.chapterId,
  });

  const { fetchCodingSubmissions } = useCodingSubmissions({
    codingOutsourseId: null,
    assessmentSubmissionId: null,
    questionId: null,
    enabled: false,
  });

  // -------- helpers --------
  const isCurrentPageSubmitAssessment = useCallback(() => {
    const base = `/student/course/${params.viewcourses}/org/${params.orgId}/studentAssessment`;
    return pathname === base || pathname === `${base}/`;
  }, [params.viewcourses, params.orgId, pathname]);

  const handleFullScreenRequest = useCallback(() => {
    requestFullScreen(document.documentElement);
    setIsFullScreen(true);
  }, []);

  const startTimer = useCallback((endTime: number) => {
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    intervalIdRef.current = window.setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(Math.floor((endTime - now) / 1000), 0);
      setRemainingTime(secondsLeft);
      if (secondsLeft === 300) {
        toast.warning({ title: "WARNING", description: "Hurry up, less than 5 minutes remaining now!" });
      }
      if (secondsLeft === 0) {
        submitAssessment();
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      }
    }, 1000);
  }, []);

  const navigateToChapter = useCallback(
    (bootcampId: any, moduleId: any, chId: any) => {
      router.push(`/student/course/${bootcampId}/org/${orgId}/modules/${moduleId}?chapterId=${chId}`);
    },
    [router, orgId]
  );

  // -------- data fetchers --------
  const fetchAndApplyAssessmentData = useCallback(
    async (isNewStart: boolean = false) => {
      const data = await startAssessment(decodedAssessmentId, isNewStart);
      if (!data) return;
      setIsFullScreen(true);
      setAssessmentData(data);
      setStartedAt(new Date(data.submission?.startedAt).getTime());
      setIsTabProctorOn(!!data.canTabChange);
      setIsFullScreenProctorOn(!!data.canScreenExit);
      setIsCopyPasteProctorOn(!!data.canCopyPaste);
      setAssessmentSubmitId(data.submission?.id ?? null);
      setChapterId(data.chapterId ?? null);
    },
    [decodedAssessmentId, startAssessment]
  );

  const getAssessmentSubmissionsData = useCallback(async () => {
    const startPageUrl = `/student/courses/${params.viewcourses}/org/${orgId}/modules/${params.moduleID}/chapters/${params.chapterId}`;
    const data = await fetchSubmissions();
    if (!data) return;
    const sub = data.submitedOutsourseAssessments?.[0];
    if (sub?.submitedAt && sub?.reattemptApproved === false) {
      router.push(startPageUrl);
    } else if (sub?.startedAt && sub?.reattemptApproved === false) {
      fetchAndApplyAssessmentData();
    }
  }, [fetchSubmissions, fetchAndApplyAssessmentData, orgId, params.chapterId, params.moduleID, params.viewcourses, router]);

  // -------- effects --------
  useEffect(() => {
    getAssessmentSubmissionsData();
    setIsOpeningdialogOpen(true);
  }, [getAssessmentSubmissionsData]);

  useEffect(() => {
    if (isFullScreen) fetchAndApplyAssessmentData();
    refetchQuizQuestions();
    refetchOpenEndedQuestions();
  }, [decodedAssessmentId, fetchAndApplyAssessmentData, refetchOpenEndedQuestions, refetchQuizQuestions, isFullScreen]);

  useEffect(() => {
    if (assessmentData) {
      refetchQuizQuestions();
      refetchOpenEndedQuestions();
    }
  }, [assessmentData, refetchOpenEndedQuestions, refetchQuizQuestions]);

  useEffect(() => {
    if (!assessmentSubmitId && !assessmentData) return;
    if (startedAt && assessmentData?.timeLimit) {
      const endTime = startedAt + (assessmentData.timeLimit as number) * 1000;
      startTimer(endTime);
    }

    const visibilityChangeHandler = () =>
      handleVisibilityChange(submitAssessment, isCurrentPageSubmitAssessment, assessmentSubmitId!);
    const fullscreenChangeHandler = () =>
      handleFullScreenChange(submitAssessment, isCurrentPageSubmitAssessment, setIsFullScreen, assessmentSubmitId!);

    if (isTabProctorOn) document.addEventListener("visibilitychange", visibilityChangeHandler);
    if (isFullScreenProctorOn) document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      if (isTabProctorOn) document.removeEventListener("visibilitychange", visibilityChangeHandler);
      if (isFullScreenProctorOn) document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [assessmentData, assessmentSubmitId, isCurrentPageSubmitAssessment, isFullScreenProctorOn, isTabProctorOn, startTimer, startedAt]);

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries?.[0]?.type === "reload") {
      toast.info({ title: "Page Reloaded", description: "The page has been reloaded." });
    }
    const handleTabClose = () => {
      const channel = new BroadcastChannel("assessment_channel");
      channel.postMessage("assessment_tab_closed");
      channel.close();
    };
    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, []);

  // -------- handlers --------
  const handleCopyPasteAttempt = useCallback(async () => {
    if (!assessmentSubmitId || !isCopyPasteProctorOn) return;
    const { tabChange, copyPaste, fullScreenExit, eyeMomentCount } = await getProctoringData(assessmentSubmitId);
    updateProctoringData(assessmentSubmitId, tabChange, copyPaste + 1, fullScreenExit, eyeMomentCount);
  }, [assessmentSubmitId, isCopyPasteProctorOn]);

  const submitAssessment = useCallback(
    async (typeOfsubmission: "studentSubmit" | "auto-submit" = "studentSubmit") => {
      setDisableSubmit(true);
      if (!assessmentSubmitId) return;
      const { tabChange, copyPaste, fullScreenExit, eyeMomentCount } = await getProctoringData(assessmentSubmitId);
      const success = await submitAssessmentApi(assessmentSubmitId, {
        tabChange,
        copyPaste,
        fullScreenExit,
        eyeMomentCount,
        typeOfsubmission,
      });
      if (!success) return;
      toast.success({ title: "Assessment Submitted", description: "Your assessment has been submitted successfully" });
      completeChapter();
      navigateToChapter(assessmentData?.bootcampId, assessmentData?.moduleId, assessmentData?.chapterId);
      const channel = new BroadcastChannel("assessment_channel");
      channel.postMessage("assessment_submitted");
      channel.close();
      setTimeout(() => window.close(), 2000);
    },
    [assessmentData?.bootcampId, assessmentData?.chapterId, assessmentData?.moduleId, assessmentSubmitId, completeChapter, navigateToChapter, submitAssessmentApi]
  );

  const handleSolveChallenge = useCallback(
    async (type: QType, id?: number, codingQuestion?: CodingQuestion) => {
      setSelectedQuesType(type);
      setIsSolving(true);

      if (type === "coding" && id && assessmentSubmitId) {
        const responseData = await fetchCodingSubmissions(
          codingQuestion!.codingOutsourseId,
          assessmentSubmitId,
          id
        );
        const payload = responseData?.data;
        const action = payload?.action as "submit" | null;
        setRunCodeLanguageId(payload?.languageId || 0);
        setRunSourceCode(payload?.sourceCode || "");
        if (action !== "submit") {
          setSelectedQuestionId(id);
          setSelectedCodingOutsourseId(codingQuestion?.codingOutsourseId ?? null);
          requestFullScreen(document.documentElement);
        }
        return;
      }
      if (type === "quiz" && assessmentData?.IsQuizzSubmission) return;
      if (type === "open-ended" && separateOpenEndedQuestions?.[0]?.submissionsData?.length > 0) {
        toast.info({ title: "Open Ended Questions Already Submitted", description: "You have already submitted the open ended questions" });
        return;
      }
      requestFullScreen(document.documentElement);
    },
    [assessmentData?.IsQuizzSubmission, assessmentSubmitId, fetchCodingSubmissions, separateOpenEndedQuestions]
  );

  const handleBack = useCallback(() => {
    setIsSolving(false);
    setSelectedQuestionId(null);
  }, []);

  // -------- UI switches --------
  const showCoding = isSolving && isFullScreen && selectedQuesType === "coding" && selectedQuestionId !== null;
  const showQuiz =
    isSolving &&
    isFullScreen &&
    selectedQuesType === "quiz" &&
    !assessmentData?.IsQuizzSubmission &&
    ((assessmentData?.hardMcqQuestions ?? 0) + (assessmentData?.easyMcqQuestions ?? 0) + (assessmentData?.mediumMcqQuestions ?? 0) > 0);
  const showOpenEnded =
    isSolving &&
    isFullScreen &&
    selectedQuesType === "open-ended" &&
    !(separateOpenEndedQuestions?.[0]?.submissionsData?.length > 0);
  const submitDisabled = disableSubmit || (!!assessmentData?.totalMcqQuestions && assessmentData?.IsQuizzSubmission === false);

  // -------- early routes (solving views) --------
  if (showQuiz) {
    return (
      <>
        <PreventBackNavigation />
        <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
          <QuizQuestions
            onBack={handleBack}
            weightage={assessmentData as any}
            remainingTime={remainingTime}
            questions={separateQuizQuestions}
            assessmentSubmitId={assessmentSubmitId as number}
            getSeperateQuizQuestions={refetchQuizQuestions}
            getAssessmentData={fetchAndApplyAssessmentData}
          />
        </AlertProvider>
      </>
    );
  }
  if (showOpenEnded) {
    return (
      <>
        <PreventBackNavigation />
        <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
          <OpenEndedQuestions
            onBack={handleBack}
            remainingTime={remainingTime}
            questions={separateOpenEndedQuestions}
            assessmentSubmitId={assessmentSubmitId as number}
            getSeperateOpenEndedQuestions={refetchOpenEndedQuestions}
            getAssessmentData={fetchAndApplyAssessmentData}
          />
        </AlertProvider>
      </>
    );
  }
  if (showCoding) {
    return (
      <>
        <PreventBackNavigation />
        <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
          <IDE
            params={{ editor: String(selectedQuestionId) }}
            onBack={handleBack}
            remainingTime={remainingTime}
            assessmentSubmitId={assessmentSubmitId as number}
            selectedCodingOutsourseId={selectedCodingOutsourseId as number}
            getAssessmentData={fetchAndApplyAssessmentData}
            runCodeLanguageId={runCodeLanguageId}
            runSourceCode={runSourceCode}
          />
        </AlertProvider>
      </>
    );
  }

  // -------- main render --------
  return (
    <div onPaste={handleCopyPasteAttempt} onCopy={handleCopyPasteAttempt}>
      <PreventBackNavigation />
      <AlertProvider requestFullScreen={handleFullScreenRequest} setIsFullScreen={setIsFullScreen}>
        <div className="h-screen mb-24">
          {!isFullScreen && !remainingTime ? (
            <FullscreenPrompt
              open={isOpeningdialogOpen}
              onOpenChange={setIsOpeningdialogOpen}
              onProceed={() => {
                handleFullScreenRequest();
                fetchAndApplyAssessmentData(true);
              }}
              onCancel={() => window.close()}
              remainingTime={remainingTime}
            />
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
              <TopBar remainingTime={remainingTime} />
              <div className="max-w-4xl mx-auto p-6 pt-20">
                <AssessmentHeader title={assessmentData?.ModuleAssessment.title} />
                <CodingSection
                  assessmentData={assessmentData}
                  isMobile={isMobile}
                  assessmentSubmitId={assessmentSubmitId}
                  setIsCodingSubmitted={() => {}}
                  onSolve={(id, cq) => handleSolveChallenge("coding", id, cq)}
                />
                <McqSection
                  assessmentData={assessmentData}
                  onSolveQuiz={() => handleSolveChallenge("quiz")}
                />
                <OpenEndedSection
                  questions={separateOpenEndedQuestions}
                  onSolveOpenEnded={() => handleSolveChallenge("open-ended")}
                />
                <SubmitAssessmentDialog disabled={submitDisabled} onSubmit={submitAssessment} />
              </div>
            </div>
          )}
        </div>
      </AlertProvider>
    </div>
  );
}

export default Page;
