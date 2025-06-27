'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Timer, AlertCircle } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import TimerDisplay from './TimerDisplay';
import QuestionCard from './QuestionCard';

interface AssessmentMainViewProps {
  assessmentData: any;
  remainingTime: number;
  onSolveChallenge: (type: 'quiz' | 'open-ended' | 'coding', id?: number, codingQuestionId?: number, codingOutsourseId?: number) => void;
  onSubmitAssessment: () => void;
  disableSubmit: boolean;
  quizQuestions: any;
  openEndedQuestions: any;
}

const AssessmentMainView: React.FC<AssessmentMainViewProps> = ({
  assessmentData,
  remainingTime,
  onSolveChallenge,
  onSubmitAssessment,
  disableSubmit,
  quizQuestions,
  openEndedQuestions
}) => {
  const formatTimeLimit = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} Hours ${minutes} Minutes`;
  };

  return (
    <div className="h-screen overflow-y-auto">
      {/* Fixed Timer */}
      <div className="fixed top-4 right-4 bg-white p-2 rounded-md shadow-md font-bold text-xl z-10">
        <TimerDisplay remainingTime={remainingTime} />
      </div>

      <div className="flex justify-center pt-10 pb-20">
        <div className="flex flex-col gap-5 w-full max-w-2xl text-left px-4">
          {/* Assessment Overview */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="font-bold text-xl mb-4">Testing Your Knowledge</h2>
            
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700">
                <Clock size={18} />
                Deadline: {assessmentData?.deadline || 'No Deadline For This Assessment'}
              </p>
              
              <p className="flex items-center gap-2 text-gray-700">
                <Timer size={18} />
                Test Time: {formatTimeLimit(assessmentData?.timeLimit)}
              </p>
            </div>

            <p className="text-gray-600 mt-4">
              Timer has started. Questions will disappear if you exit full screen. 
              All the problems i.e. coding challenges, MCQs and open-ended questions 
              have to be completed all at once.
            </p>
          </div>

          {/* Proctoring Rules */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-bold text-lg mb-3 text-blue-900">Proctoring Rules</h3>
            <p className="text-blue-800 mb-3">
              To ensure fair assessments, the assessments are proctored for the 
              following cases below. Please avoid violating the rules:
            </p>
            <ul className="list-disc ml-5 text-blue-800 space-y-1">
              <li>Copy and pasting</li>
              <li>Tab switching</li>
              <li>Assessment screen exit</li>
            </ul>
          </div>

          {/* Coding Challenges */}
          {assessmentData?.codingQuestions?.length > 0 && (
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="font-bold text-xl mb-4">Coding Challenges</h2>
              
              <div className="flex gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                <p className="text-yellow-800">
                  You may run your code multiple times after making changes, but 
                  you are allowed to submit it only once.
                </p>
              </div>

              <div className="space-y-4">
                {assessmentData.codingQuestions.map((question: any) => (
                  <QuestionCard
                    key={question.codingQuestionId}
                    id={question.codingQuestionId}
                    title={question.title}
                    description={question.difficulty}
                    easyCodingMark={assessmentData?.easyCodingMark}
                    mediumCodingMark={assessmentData?.mediumCodingMark}
                    hardCodingMark={assessmentData?.hardCodingMark}
                    assessmentSubmitId={assessmentData?.submission?.id}
                    codingOutsourseId={question.codingOutsourseId}
                    codingQuestions={true}
                    onSolveChallenge={(id: any) =>
                      onSolveChallenge(
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
          )}

          {/* MCQs */}
          {(assessmentData?.hardMcqQuestions + assessmentData?.easyMcqQuestions + assessmentData?.mediumMcqQuestions) > 0 && (
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="font-bold text-xl mb-4">MCQs</h2>
              <QuestionCard
                id={1}
                title="Quiz"
                weightage={assessmentData?.weightageMcqQuestions}
                description={`${
                  assessmentData?.hardMcqQuestions +
                  assessmentData?.easyMcqQuestions +
                  assessmentData?.mediumMcqQuestions || 0
                } questions`}
                onSolveChallenge={() => onSolveChallenge('quiz')}
                isQuizSubmitted={assessmentData?.IsQuizzSubmission}
              />
            </div>
          )}

          {/* Open-Ended Questions */}
          {openEndedQuestions?.length > 0 && (
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="font-bold text-xl mb-4">Open-Ended Questions</h2>
              <QuestionCard
                id={1}
                title="Open-Ended Questions"
                description={`${openEndedQuestions.length || 0} questions`}
                onSolveChallenge={() => onSolveChallenge('open-ended')}
              />
            </div>
          )}

          {/* Submit Assessment */}
          <div className="flex justify-center mt-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="px-8 py-3"
                  disabled={
                    disableSubmit ||
                    (assessmentData?.totalMcqQuestions > 0 &&
                      assessmentData?.IsQuizzSubmission === false)
                  }
                >
                  Submit Assessment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will submit your whole assessment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={onSubmitAssessment}
                  >
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentMainView; 