'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import TimerDisplay from './TimerDisplay';

interface OpenEndedQuestionsProps {
  onBack: () => void;
  remainingTime: number;
  questions: any;
  assessmentSubmitId: number | null;
  getOpenEndedQuestions: () => void;
  getAssessmentData: () => void;
}

const OpenEndedQuestions: React.FC<OpenEndedQuestionsProps> = ({
  onBack,
  remainingTime,
}) => {
  return (
    <div className="h-screen bg-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b p-4 flex justify-between items-center z-10">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={20} />
          Back to Assessment
        </Button>
        <TimerDisplay remainingTime={remainingTime} />
      </div>

      {/* Content */}
      <div className="pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Open-Ended Questions</h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-green-800">
              Open-ended questions component is under development. 
              This will contain text areas for long-form answers using the Remirror editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenEndedQuestions; 