import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Check, 
  Timer, 
  Calendar, 
  User, 
  Video, 
  Users, 
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  RadioIcon,
  Wifi,
  WifiOff,
  MonitorPlay,
  UserCheck,
  UserX,
  CalendarClock,
  Zap
} from "lucide-react";
import useChapterCompletion from '@/hooks/useChapterCompletion';
import { formatToIST, formatTimeLimit } from '@/lib/utils';

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
  const [showRecordingHint, setShowRecordingHint] = useState(true);
  
  
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

  // Chapter completion status (different from session status)
  const isCompleted = localIsCompleted || chapterDetails.status === 'Completed';
  
  // Helper functions with edge case handling
  const getSessionStatus = (): 'upcoming' | 'ongoing' | 'completed' => {
    if (!session) return 'upcoming'; // Default to upcoming if no session
    
    try {
      // session.status can be: 'upcoming', 'ongoing', or 'completed'
      const status = session.status as 'upcoming' | 'ongoing' | 'completed';
      
      // Validate that we have one of the expected values
      if (status === 'upcoming' || status === 'ongoing' || status === 'completed') {
        return status;
      }
      
      // Log unexpected status and default to upcoming
      console.warn(`Unexpected session status: "${session.status}". Expected: 'upcoming', 'ongoing', or 'completed'. Defaulting to 'upcoming'.`);
      return 'upcoming';
    } catch (error) {
      console.error('Error determining session status:', error);
      return 'upcoming';
    }
  };

  const getDuration = () => {
    if (!session) return 60; // Default 60 minutes
    
    // Use provided duration if valid
    if (session.duration && session.duration > 0) {
      return session.duration;
    }
    
    try {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 60; // Default duration
      }
      
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return durationMinutes > 0 ? durationMinutes : 60;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 60;
    }
  };

  const getTimeUntilClass = () => {
    if (!session || !session.startTime) return null;
    
    try {
      const now = new Date();
      const startTime = new Date(session.startTime);
      
      if (isNaN(startTime.getTime())) return null;
      
      const diff = startTime.getTime() - now.getTime();
      
      if (diff <= 0) return null;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return { days, hours, minutes };
    } catch (error) {
      console.error('Error calculating time until class:', error);
      return null;
    }
  };

  const hasRecording = Boolean(
    session?.s3link && 
    session.s3link !== 'not found' && 
    session.s3link.trim() !== ''
  );
  
  const canJoinClass = Boolean(
    session?.hangoutLink && 
    session.hangoutLink.trim() !== '' &&
    session.hangoutLink !== 'not found'
  );

  // Get session status from session.status field, not chapterDetails.status
  const sessionStatus = getSessionStatus();
  const timeUntil = getTimeUntilClass();

  // If no session data, show creative empty state
  if (!session) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-card-light to-background">
        <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 h-full">
          <Card className="w-full max-w-2xl bg-card-elevated border-muted shadow-16dp">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-6 shadow-8dp">
                <CalendarClock className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {chapterDetails.title}
              </h1>
              <p className="text-muted-foreground text-lg">No session has been scheduled yet</p>
              <div className="mt-8 p-4 bg-info-light rounded-lg border border-info/20">
                <Sparkles className="w-5 h-5 text-info-dark inline-block mr-2" />
                <span className="text-info-dark font-medium">Check back later for updates</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-background via-card-light to-background overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Hero Section with Session Info */}
        <Card className={`mb-6 shadow-16dp border-0 overflow-hidden relative ${
          sessionStatus === 'ongoing' ? 'bg-gradient-to-br from-primary-light via-primary/10 to-card' :
          isCompleted ? 'bg-gradient-to-br from-success-light via-success/10 to-card' :
          'bg-gradient-to-br from-card-elevated via-card to-card-light'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full -ml-24 -mb-24 blur-3xl" />
          
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-full shadow-8dp ${
                    sessionStatus === 'ongoing' ? 'bg-primary text-primary-foreground animate-pulse' :
                    isCompleted ? 'bg-success text-success-foreground' :
                    'bg-card-elevated text-primary'
                  }`}>
                    {sessionStatus === 'ongoing' ? <Wifi className="w-6 h-6" /> :
                     isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                     <Video className="w-6 h-6" />}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {session.title || chapterDetails.title}
                  </h1>
                </div>
                
                {chapterDetails.description && (
                  <p className="text-muted-foreground mb-4 text-base sm:text-lg">
                    {chapterDetails.description}
                  </p>
                )}

                {/* Live Session Countdown */}
                {sessionStatus === 'upcoming' && timeUntil && (
                  <div className="bg-card-elevated rounded-lg p-4 shadow-4dp mb-4 inline-block">
                    <p className="text-sm text-muted-foreground mb-2">Class starts in</p>
                    <div className="flex gap-4">
                      {timeUntil.days > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{timeUntil.days}</div>
                          <div className="text-xs text-muted-foreground">days</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{timeUntil.hours}</div>
                        <div className="text-xs text-muted-foreground">hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{timeUntil.minutes}</div>
                        <div className="text-xs text-muted-foreground">mins</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {sessionStatus === 'ongoing' && (
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 fill-destructive text-destructive animate-pulse" />
                    <span className="text-sm font-medium text-destructive">LIVE</span>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className={`px-4 py-2 text-sm shadow-4dp ${
                    sessionStatus === 'completed' ? 'bg-success text-success-foreground border-success' :
                    sessionStatus === 'ongoing' ? 'bg-primary text-primary-foreground border-primary' :
                    'bg-card-elevated text-foreground border-border'
                  }`}
                >
                  {sessionStatus === 'completed' ? 'Completed' : sessionStatus === 'ongoing' ? 'In Progress' : 'Upcoming'}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-background/50 backdrop-blur rounded-lg p-3 shadow-2dp">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Date</span>
                </div>
                <p className="font-medium text-sm">{new Date(session.startTime).toLocaleDateString()}</p>
              </div>
              
              <div className="bg-background/50 backdrop-blur rounded-lg p-3 shadow-2dp">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Time</span>
                </div>
                <p className="font-medium text-sm">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              
              <div className="bg-background/50 backdrop-blur rounded-lg p-3 shadow-2dp">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs">Duration</span>
                </div>
                <p className="font-medium text-sm">{getDuration()} min</p>
              </div>
              
              {sessionStatus === 'completed' && (
                <div className="bg-background/50 backdrop-blur rounded-lg p-3 shadow-2dp">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {session.attendance === 'present' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    <span className="text-xs">Attendance</span>
                  </div>
                  <p className={`font-medium text-sm ${
                    session.attendance === 'present' ? 'text-success' : 'text-destructive'
                  }`}>
                    {session.attendance === 'present' ? 'Present' : 'Absent'}
                  </p>
                </div>
              )}
            </div>

            {/* Join Button for Live Sessions */}
            {sessionStatus === 'ongoing' && !isCompleted && canJoinClass && (
              <div className="mt-6">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark shadow-hover group"
                  onClick={() => window.open(session.hangoutLink, '_blank')}
                >
                  <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Join Live Class Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recording Section */}
        {hasRecording && (
          <Card className="shadow-16dp border-0 bg-card-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 sm:p-8 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-light rounded-full">
                    <MonitorPlay className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Class Recording</h2>
                  {showRecordingHint && (
                    <Badge variant="outline" className="ml-auto text-xs bg-info-light text-info-dark border-info">
                      Click to watch
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div 
                  className="aspect-video bg-gradient-to-br from-gray-900 to-black cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setShowRecordingHint(false);
                    session.s3link && window.open(session.s3link, '_blank');
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center group-hover:scale-110 transition-transform duration-300">
                      <div className="bg-primary/90 backdrop-blur-sm rounded-full p-6 mb-4 mx-auto w-fit shadow-24dp group-hover:bg-primary transition-colors">
                        <Play className="w-12 h-12 text-primary-foreground" fill="currentColor" />
                      </div>
                      <p className="text-white font-semibold text-lg mb-1">Watch Recording</p>
                      <p className="text-white/80 text-sm">{getDuration()} minutes</p>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <Circle className="w-2 h-2 fill-destructive text-destructive" />
                    <span className="text-white text-xs font-medium">REC</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mark as Done Section - Separate and Prominent */}
        {hasRecording && !isCompleted && (
          <Card className="mt-6 shadow-8dp border-0 bg-gradient-to-r from-primary-light via-card to-primary-light">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Ready to Complete?</h3>
                    <p className="text-sm text-muted-foreground">
                      Watch the recording above and mark this chapter as complete
                    </p>
                  </div>
                </div>
                <Button
                  onClick={completeChapter}
                  disabled={isCompleting}
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark shadow-hover"
                >
                  {isCompleting ? 'Marking as Done...' : 'Mark as Done'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Recording Yet */}
        {sessionStatus === 'completed' && !hasRecording && (
          <Card className="shadow-8dp border-dashed border-2 border-muted bg-card-light">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <WifiOff className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Recording in Progress</h3>
              <p className="text-muted-foreground">
                The class recording is being processed and will be available soon
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-info">
                <Sparkles className="w-4 h-4" />
                <span>Usually takes 1-2 hours after class ends</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Class Info */}
        {sessionStatus === 'upcoming' && (
          <Card className="mt-6 shadow-8dp border-0 bg-gradient-to-r from-info-light via-card to-info-light">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-info rounded-full">
                <CalendarClock className="w-6 h-6 text-info-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-info-dark">Reminder Set!</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive a notification 10 minutes before the class starts
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveClassContent; 