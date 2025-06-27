'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  remainingTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingTime }) => {
  const formatTime = (seconds: number): string => {
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
  };

  const getColorClass = (): string => {
    if (remainingTime <= 300) return 'text-red-600'; // Last 5 minutes
    if (remainingTime <= 600) return 'text-orange-600'; // Last 10 minutes
    return 'text-gray-800';
  };

  return (
    <div className={`flex items-center gap-2 font-mono text-xl ${getColorClass()}`}>
      <Clock size={20} />
      <span>{formatTime(remainingTime)}</span>
    </div>
  );
};

export default TimerDisplay; 