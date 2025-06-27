'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios.config';
import EnterFullScreenView from './EnterFullScreenView';
import AssessmentMainView from './AssessmentMainView';
import QuizQuestions from './QuizQuestions';
import OpenEndedQuestions from './OpenEndedQuestions';
import IDE from './IDE';
import TimerDisplay from './TimerDisplay';
import ProctoringProvider from './ProctoringProvider';

interface AssessmentData {
  id: number;
  timeLimit: number;
  deadline: string | null;
  submission: {
    id: number;
    startedAt: string;
  };
  canTabChange: boolean;
  canScreenExit: boolean;
  canCopyPaste: boolean;
  canEyeTrack: boolean;
  codingQuestions: any[];
  totalMcqQuestions: number;
  hardMcqQuestions: number;
  easyMcqQuestions: number;
  mediumMcqQuestions: number;
  weightageMcqQuestions: number;
  IsQuizzSubmission: boolean;
  easyCodingMark: number;
  mediumCodingMark: number;
  hardCodingMark: number;
  bootcampId: number;
  moduleId: number;
  chapterId: number;
}

const AssessmentProvider: React.FC = () => {
  const router = useRouter();
  const { courseId } = useParams();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  const chapterId = searchParams.get('chapterId');
  const moduleId = searchParams.get('moduleId');

  // Core state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assessment flow state
  const [isSolving, setIsSolving] = useState(false);
  const [selectedQuesType, setSelectedQuesType] = useState<'quiz' | 'open-ended' | 'coding'>('quiz');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectedCodingOutsourseId, setSelectedCodingOutsourseId] = useState<any>(null);

  // Question data
  const [quizQuestions, setQuizQuestions] = useState<any>(null);
  const [openEndedQuestions, setOpenEndedQuestions] = useState<any>([]);

  // Submission and proctoring
  const [assessmentSubmitId, setAssessmentSubmitId] = useState<number | null>(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [runCodeLanguageId, setRunCodeLanguageId] = useState<number>(0);
  const [runSourceCode, setRunSourceCode] = useState<string>('');

  // Timer ref
  const intervalIdRef = useRef<number | null>(null);

  // Check if user has already started or submitted assessment
  const checkAssessmentStatus = async () => {
    if (!assessmentId || !moduleId || !courseId || !chapterId) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(
        `Content/students/assessmentId=${assessmentId}?moduleId=${moduleId}&bootcampId=${courseId}&chapterId=${chapterId}`
      );

      const submissions = res.data.submitedOutsourseAssessments;
      
      if (submissions.length > 0 && submissions[0].submitedAt && !submissions[0].reattemptApproved) {
        // Already submitted and no re-attempt approved
        router.push(`/student/course/${courseId}/modules/${moduleId}?chapterId=${chapterId}`);
        return;
      }

      if (submissions.length > 0 && submissions[0].startedAt && !submissions[0].reattemptApproved) {
        // Already started, continue assessment
        await getAssessmentData();
      } else {
        // New assessment or re-attempt
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking assessment status:', error);
      setError('Failed to check assessment status');
      setLoading(false);
    }
  };

  // Fetch assessment data and start timer
  const getAssessmentData = async (isNewStart: boolean = false) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/Content/startAssessmentForStudent/assessmentOutsourseId=${assessmentId}/newStart=${isNewStart}`
      );

      const data = res.data.data;
      setAssessmentData(data);
      setAssessmentSubmitId(data.submission.id);
      setIsFullScreen(true);

      // Calculate and start timer
      const startTime = new Date(data.submission.startedAt).getTime();
      const endTime = startTime + data.timeLimit * 1000;
      startTimer(endTime);

      // Fetch question data in parallel
      await Promise.all([
        fetchQuizQuestions(),
        fetchOpenEndedQuestions()
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      setError('Failed to load assessment');
      setLoading(false);
    }
  };

  // Timer management
  const startTimer = (endTime: number) => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = window.setInterval(() => {
      const currentTime = Date.now();
      const newRemainingTime = Math.max(Math.floor((endTime - currentTime) / 1000), 0);
      setRemainingTime(newRemainingTime);

      // 5 minute warning
      if (newRemainingTime === 300) {
        toast({
          title: 'WARNING',
          description: 'Hurry up, less than 5 minutes remaining now!',
          variant: 'destructive'
        });
      }

      // Auto-submit when time is up
      if (newRemainingTime === 0) {
        submitAssessment();
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      }
    }, 1000);
  };

  // Fetch quiz questions
  const fetchQuizQuestions = async () => {
    try {
      const res = await api.get(`/Content/assessmentDetailsOfQuiz/${assessmentId}`);
      setQuizQuestions(res.data);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  // Fetch open-ended questions
  const fetchOpenEndedQuestions = async () => {
    try {
      const res = await api.get(`/Content/assessmentDetailsOfOpenEnded/${assessmentId}`);
      setOpenEndedQuestions(res.data);
    } catch (error) {
      console.error('Error fetching open-ended questions:', error);
    }
  };

  // Get coding submission data
  const getCodingSubmissionsData = async (codingOutsourseId: any, questionId: any) => {
    try {
      const res = await api.get(
        `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmitId}&codingOutsourseId=${codingOutsourseId}`
      );
      const action = res?.data?.data?.action;
      setRunCodeLanguageId(res?.data?.data?.languageId || 0);
      setRunSourceCode(res?.data?.data?.sourceCode || '');
      return action;
    } catch (error) {
      console.error('Error fetching coding submissions data:', error);
      return null;
    }
  };

  // Handle question solving
  const handleSolveChallenge = async (
    type: 'quiz' | 'open-ended' | 'coding',
    id?: number,
    codingQuestionId?: number,
    codingOutsourseId?: number
  ) => {
    setSelectedQuesType(type);
    setIsSolving(true);

    if (type === 'coding' && id) {
      const action = await getCodingSubmissionsData(codingOutsourseId, id);
      if (action !== 'submit') {
        setSelectedQuestionId(id);
        setSelectedCodingOutsourseId(codingOutsourseId);
      }
    } else if (type === 'quiz' && assessmentData?.IsQuizzSubmission) {
      // Already submitted
      return;
    } else if (type === 'open-ended' && openEndedQuestions[0]?.submissionsData?.length > 0) {
      toast({
        title: 'Open Ended Questions Already Submitted',
        description: 'You have already submitted the open ended questions',
      });
      return;
    }
  };

  // Submit assessment
  const submitAssessment = async () => {
    if (!assessmentSubmitId) return;

    setDisableSubmit(true);
    try {
      await api.patch(
        `/submission/assessment/submit?assessmentSubmissionId=${assessmentSubmitId}`,
        {
          typeOfsubmission: 'studentSubmit',
        }
      );

      toast({
        title: 'Assessment Submitted',
        description: 'Your assessment has been submitted successfully',
      });

      // Complete chapter
      await api.post(
        `tracking/updateChapterStatus/${courseId}/${moduleId}?chapterId=${chapterId}`
      );

      // Navigate back and close window
      const channel = new BroadcastChannel('assessment_channel');
      channel.postMessage('assessment_submitted');
      channel.close();

      setTimeout(() => {
        router.push(`/student/course/${courseId}/modules/${moduleId}?chapterId=${chapterId}`);
        window.close();
      }, 2000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setDisableSubmit(false);
    }
  };

  // Handle going back from question solving
  const handleBack = () => {
    setIsSolving(false);
    setSelectedQuestionId(null);
    setSelectedCodingOutsourseId(null);
  };

  // Initialize assessment
  useEffect(() => {
    checkAssessmentStatus();
    
    // Handle tab close
    const handleTabClose = () => {
      const channel = new BroadcastChannel('assessment_channel');
      channel.postMessage('assessment_tab_closed');
      channel.close();
    };

    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading Assessment...</h1>
          <p className="text-muted-foreground">Please wait while we prepare your assessment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Render appropriate view based on state
  if (!isFullScreen || !assessmentData) {
    return (
      <EnterFullScreenView
        onEnterFullScreen={() => getAssessmentData(true)}
        remainingTime={remainingTime}
      />
    );
  }

  if (isSolving) {
    return (
      <ProctoringProvider
        assessmentData={assessmentData}
        assessmentSubmitId={assessmentSubmitId}
        onSubmit={submitAssessment}
        setIsFullScreen={setIsFullScreen}
      >
        {selectedQuesType === 'quiz' && !assessmentData.IsQuizzSubmission && (
          <QuizQuestions
            onBack={handleBack}
            weightage={assessmentData}
            remainingTime={remainingTime}
            questions={quizQuestions}
            assessmentSubmitId={assessmentSubmitId}
            getQuizQuestions={fetchQuizQuestions}
            getAssessmentData={getAssessmentData}
          />
        )}
        
        {selectedQuesType === 'open-ended' && !(openEndedQuestions[0]?.submissionsData?.length > 0) && (
          <OpenEndedQuestions
            onBack={handleBack}
            remainingTime={remainingTime}
            questions={openEndedQuestions}
            assessmentSubmitId={assessmentSubmitId}
            getOpenEndedQuestions={fetchOpenEndedQuestions}
            getAssessmentData={getAssessmentData}
          />
        )}
        
        {selectedQuesType === 'coding' && selectedQuestionId !== null && (
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
        )}
      </ProctoringProvider>
    );
  }

  return (
    <ProctoringProvider
      assessmentData={assessmentData}
      assessmentSubmitId={assessmentSubmitId}
      onSubmit={submitAssessment}
      setIsFullScreen={setIsFullScreen}
    >
      <AssessmentMainView
        assessmentData={assessmentData}
        remainingTime={remainingTime}
        onSolveChallenge={handleSolveChallenge}
        onSubmitAssessment={submitAssessment}
        disableSubmit={disableSubmit}
        quizQuestions={quizQuestions}
        openEndedQuestions={openEndedQuestions}
      />
    </ProctoringProvider>
  );
};

export default AssessmentProvider; 