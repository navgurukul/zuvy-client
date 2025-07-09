import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Check
} from "lucide-react";
import useChapterCompletion from '@/hooks/useChapterCompletion';

interface Session {
  id: number;
  meetingId: string;
  hangoutLink: string;
  startTime: string;
  endTime: string;
  title: string;
  s3link: string;
  status: string;
  attendance: string;
  duration: number;
}

interface LiveClassContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    sessions?: Session[];
  };
  onChapterComplete: () => void;
}

const LiveClassContent: React.FC<LiveClassContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId, moduleId } = useParams();
  const [localIsCompleted, setLocalIsCompleted] = useState(false);
  
  // Get session data
  const session = chapterDetails.sessions?.[0] || null;
  
  // Chapter completion hook
  const { isCompleting, completeChapter } = useChapterCompletion({
    courseId: courseId as string,
    moduleId: moduleId as string,
    chapterId: chapterDetails.id.toString(),
    onSuccess: () => {
      setLocalIsCompleted(true);
      onChapterComplete();
    },
  });

  // Update local state when chapter status changes
  useEffect(() => {
    setLocalIsCompleted(chapterDetails.status === 'Completed');
  }, [chapterDetails.status]);

  // Chapter completion status
  const isCompleted = localIsCompleted || chapterDetails.status === 'Completed';

  // Helper function to format date and time
  const formatDateTime = (date: Date) => {
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

    return `${day}${getOrdinalSuffix(day)} ${month} ${year} at ${time}`;
  };

  // Helper function to get time remaining
  const getTimeRemaining = (scheduledDateTime: Date) => {
    const now = new Date();
    const diff = scheduledDateTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Starting now";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // If no session data, show empty state
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-heading font-bold mb-4">{chapterDetails.title}</h1>
        <p className="text-muted-foreground">No session has been scheduled yet</p>
      </div>
    );
  }

  // Map session data to expected format
  const item = {
    type: 'live-class',
    title: session.title || chapterDetails.title,
    description: chapterDetails.description,
    scheduledDateTime: session.startTime ? new Date(session.startTime) : null,
    status: session.status,
    duration: session.duration ? `${session.duration} mins` : '45 mins',
    hangoutLink: session.hangoutLink,
    s3link: session.s3link,
    attendance: session.attendance
  };

  if (item.type === 'live-class') {
    const isScheduled = item.scheduledDateTime && new Date() < item.scheduledDateTime;
    const isInProgress = item.scheduledDateTime && 
      new Date() >= new Date(item.scheduledDateTime.getTime() - 10 * 60 * 1000) &&
      new Date() < new Date(item.scheduledDateTime.getTime() + 60 * 60 * 1000);
    const isSessionCompleted = item.status === 'completed';

    if (isScheduled) {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-heading font-bold">{item.title}</h1>
            <Badge variant="outline" className="text-muted-foreground">
              Scheduled
            </Badge>
          </div>
          <p className="text-muted-foreground text-left mb-6">{item.description || "Join this live interactive session with your instructor and fellow students."}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div  className="text-left">
              <p className="text-sm text-muted-foreground">Scheduled Date & Time</p>
              <p className="font-medium">{item.scheduledDateTime ? formatDateTime(item.scheduledDateTime) : 'TBD'}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground"> Duration</p>
              <p className="font-medium">{item.duration || '45 mins'}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <Card className="bg-info-light border-info">
              <CardContent className="p-4">
                <p className="text-info font-semibold text-center">
                  Class starts in {getTimeRemaining(item.scheduledDateTime!)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (isInProgress) {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-heading text-left font-bold">{item.title}</h1>
            <Badge variant="outline" className="text-success border-success">
              Live Now
            </Badge>
          </div>
          <p className="text-muted-foreground text-left mb-6">{item.description || "Join this live interactive session with your instructor and fellow students."}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Scheduled Date & Time</p>
              <p className="font-medium">{item.scheduledDateTime ? formatDateTime(item.scheduledDateTime) : 'TBD'}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{item.duration || '45 mins'}</p>
            </div>
          </div>
          <div className="text-left">
            <Button 
              className="mb-6 text-left bg-primary hover:bg-primary-dark text-white"
              onClick={() => item.hangoutLink && window.open(item.hangoutLink, '_blank')}
              disabled={!item.hangoutLink || item.hangoutLink === 'not found'}
            >
              Join Class
            </Button>
          </div>
        </div>
      );
    }

    if (isSessionCompleted) {
      const hasRecording = Boolean(
        item.s3link && 
        item.s3link !== 'not found' && 
        item.s3link.trim() !== ''
      );

      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-heading font-bold">{item.title}</h1>
            <Badge variant="outline" className="text-success border-success">
              Completed
            </Badge>
          </div>
          <p className="text-muted-foreground text-left mb-6">{item.description || "This live class has been completed."}</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">{item.scheduledDateTime ? formatDateTime(item.scheduledDateTime) : 'TBD'}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Your Duration</p>
              <p className="font-medium">{item.duration || '45 mins'}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Attendance</p>
              <p className={`font-medium ${item.attendance === 'present' ? 'text-success' : 'text-destructive'}`}>
                {item.attendance === 'present' ? 'Present' : 'Absent'}
              </p>
            </div>
          </div>
          <p className="text-success mb-6 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Class completed
          </p>
          
          {hasRecording && (
            <div className="border-t border-border pt-6">
              <h2 className="text-xl text-left font-heading font-semibold mb-4">Recording available for the live class</h2>
              <div 
                className="bg-black rounded-lg aspect-video flex items-center justify-center cursor-pointer"
                onClick={() => item.s3link && window.open(item.s3link, '_blank')}
              >
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p>Class Recording</p>
                  {/* <p className="text-sm opacity-75">{item.duration || '45 mins'}</p> */}
                </div>
              </div>
              
              {!isCompleted && (
                <div className="mt-6">
                  <Button
                    onClick={completeChapter}
                    disabled={isCompleting}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                  >
                    {isCompleting ? 'Marking as Done...' : 'Mark as Done'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  }

  // Fallback return
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-heading font-bold">{chapterDetails.title}</h1>
      <p className="text-muted-foreground">Live class content</p>
    </div>
  );
};

export default LiveClassContent; 