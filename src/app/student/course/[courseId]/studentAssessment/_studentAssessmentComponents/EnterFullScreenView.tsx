'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import TimerDisplay from './TimerDisplay';
import { requestFullScreen } from './utils/fullscreenUtils';

interface EnterFullScreenViewProps {
  onEnterFullScreen: () => void;
  remainingTime: number;
}

const EnterFullScreenView: React.FC<EnterFullScreenViewProps> = ({
  onEnterFullScreen,
  remainingTime
}) => {
  const handleFullScreenRequest = () => {
    requestFullScreen(document.documentElement);
    onEnterFullScreen();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      {remainingTime > 0 && (
        <div className="fixed top-4 right-4 bg-white p-2 rounded-md shadow-md font-bold text-xl">
          <TimerDisplay remainingTime={remainingTime} />
        </div>
      )}

      <div className="text-center max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">
          Enter Full Screen to Start Your Assessment
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Warning:</strong> If you exit fullscreen during the test, 
            your assessment will be submitted automatically to ensure fair testing.
          </p>
        </div>

        <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Assessment Rules:</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Stay in full-screen mode throughout the test</li>
            <li>No tab switching or window changes allowed</li>
            <li>Violations may lead to automatic submission</li>
            <li>Complete all sections in one session</li>
          </ul>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg" className="px-8 py-3">
              Enter Full Screen & Start Assessment
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogDescription className="text-base">
                You must stay in full-screen mode during the test.
                <strong className="block mt-2">
                  No tab switching, window changes, or exiting full-screen allowed.
                </strong>
                <span className="block mt-2 text-red-600">
                  Violations may lead to auto-submission of your assessment.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleFullScreenRequest}
              >
                I Understand - Proceed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EnterFullScreenView; 