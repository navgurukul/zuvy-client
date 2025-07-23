'use client';
import type {TimerDisplayProps} from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/courseStudentAssesmentStudentTypes';

import React from 'react';
import { Clock } from 'lucide-react';



const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingTime }) => {
  const formatTime = (seconds: number): string => {
    // Handle null, undefined, NaN, or negative values
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '00:00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };  const getColorClass = (): string => {
    // Handle null, undefined, NaN, or negative values
    if (!remainingTime || isNaN(remainingTime) || remainingTime < 0) {
      return 'text-muted-foreground'; // Muted color when timer is not available
    }
    
    if (remainingTime <= 300) return 'text-destructive'; // Last 5 minutes - red
    if (remainingTime <= 600) return 'text-warning-dark'; // Last 10 minutes - orange
    return 'text-foreground'; // Normal time - primary text color
  };

  return (
    <div className={`flex items-center gap-2 font-mono text-xl font-semibold ${getColorClass()} bg-card border border-border rounded-lg px-3 py-2 shadow-4dp`}>
      <Clock size={20} />
      <span>{formatTime(remainingTime)}</span>
    </div>
  );
};

export default TimerDisplay; 