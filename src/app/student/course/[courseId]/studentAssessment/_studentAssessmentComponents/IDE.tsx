'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import TimerDisplay from './TimerDisplay';

interface IDEProps {
  params: { editor: string };
  onBack: () => void;
  remainingTime: number;
  assessmentSubmitId: number | null;
  selectedCodingOutsourseId: any;
  getAssessmentData: () => void;
  runCodeLanguageId: number;
  runSourceCode: string;
}

const IDE: React.FC<IDEProps> = ({
  onBack,
  remainingTime,
  params,
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Coding Challenge - Question {params.editor}</h1>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <p className="text-purple-800">
              IDE component is under development. 
              This will contain the code editor, problem statement, test cases, and submission logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDE; 