'use client';
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Video, BookOpen, FileText, Clock, Calendar, Users, Lock, Timer } from "lucide-react";
import Image from "next/image";
import { useBootcampProgress } from '@/hooks/useBootcampProgress';
import { useAllModulesForStudents } from '@/hooks/useAllModulesForStudents';
import { useUpcomingEvents, Event as UpcomingEvent } from '@/hooks/useUpcomingEvents';
import { useCompletedClasses, CompletedClass } from '@/hooks/useCompletedClasses';
import { useLatestUpdatedCourse } from '@/hooks/useLatestUpdatedCourse';
import CourseDashboardSkeleton from '@/app/student/_components/CourseDashboardSkeleton';
import TruncatedDescription from "@/app/student/_components/TruncatedDescription";
import { ellipsis } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";



const CourseDashboard = ({ courseId }: { courseId: string }) => {

  const [showAllModules, setShowAllModules] = useState(false);
  const { progressData, loading: progressLoading, error: progressError } = useBootcampProgress(courseId);
  const { modules: apiModules, loading: modulesLoading, error: modulesError } = useAllModulesForStudents(courseId);
  const { upcomingEventsData, loading: eventsLoading, error: eventsError } = useUpcomingEvents();
  const { completedClassesData, loading: classesLoading, error: classesError } = useCompletedClasses(courseId);
  const { latestCourseData, loading: latestCourseLoading, error: latestCourseError } = useLatestUpdatedCourse();

  // Show loading skeleton while fetching API data
  if (progressLoading || modulesLoading || eventsLoading || classesLoading || latestCourseLoading) {
    return (
      <CourseDashboardSkeleton />
    );
  }

  // Show error state if API fails
  if (progressError || modulesError || eventsError || classesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Failed to Load Course Data</h1>
          <p className="text-muted-foreground mb-4">{progressError || modulesError || eventsError || classesError}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Use real progress data if available, otherwise fall back to mock data
  const currentProgress = progressData?.data?.progress || 0;
  const batchName = progressData?.batchInfo?.batchName || '';
  const totalStudents = progressData?.batchInfo?.totalEnrolledStudents || 0;
  const instructorName = progressData?.instructorDetails?.instructorName || '';
  const instructorAvatar = progressData?.instructorDetails?.instructorProfilePicture || '';
  const courseName = progressData?.data?.bootcampTracking?.name || '';
  const courseDescription = progressData?.data?.bootcampTracking?.description || '';
  const courseCoverImage = progressData?.data?.bootcampTracking?.coverImage || '';
  const collaborator = progressData?.data?.bootcampTracking?.collaborator || '';
  const duration = progressData?.data?.bootcampTracking?.duration || 0;

  // Use API modules if available, otherwise fall back to mock modules
  const modulesToDisplay = apiModules || [];
  const modulesToShow = showAllModules ? modulesToDisplay : modulesToDisplay.slice(0, 7);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  };

  const formatDateRange = () => {
    const today = new Date();
    const seventhDay = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };

    return `From ${today.toLocaleDateString('en-US', formatOptions)} to ${seventhDay.toLocaleDateString('en-US', formatOptions)}`;
  };

  const getEventType = (type: string): 'Live Class' | 'Assessment' | 'Assignment' | 'unknown' => {
    if (type.toLowerCase().includes('class')) return 'Live Class';
    if (type.toLowerCase().includes('assessment')) return 'Assessment';
    if (type.toLowerCase().includes('assignment')) return 'Assignment';
    return 'unknown';
  }

  const getItemIcon = (type: string) => {
    switch (getEventType(type)) {
      case 'Live Class': return <Video className="w-5 h-5 text-primary" />;
      case 'Assessment': return <BookOpen className="w-5 h-5 text-warning" />;
      case 'Assignment': return <FileText className="w-5 h-5 text-info" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getItemIconWithBackground = (type: string) => {
    switch (getEventType(type)) {
      case 'Live Class':
        return (
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
        );
      case 'Assessment':
        return (
          <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-warning" />
          </div>
        );
      case 'Assignment':
        return (
          <div className="w-10 h-10 rounded-full bg-info-light flex items-center justify-center">
            <FileText className="w-5 h-5 text-info" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-muted-light flex items-center justify-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
        );
    }
  };

  const getTimeRemaining = (eventDate: string) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const timeDiff = eventTime.getTime() - now.getTime();

    if (timeDiff <= 0) return "Event Started";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      const dayString = `${days} day${days > 1 ? 's' : ''}`;
      const hourString = hours > 0 ? ` and ${hours} hour${hours > 1 ? 's' : ''}` : '';
      return `Starts in ${dayString}${hourString}`;
    }

    if (hours > 0) {
      const hourString = `${hours} hour${hours > 1 ? 's' : ''}`;
      const minuteString = minutes > 0 ? ` and ${minutes} minute${minutes > 1 ? 's' : ''}` : '';
      return `Starts in ${hourString}${minuteString}`;
    }

    if (minutes > 0) {
      return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return "Starting soon";
  };

  const canStartEvent = (eventDate: string) => {
    return new Date(eventDate).getTime() <= new Date().getTime();
  };

  const getEventActionText = (type: string) => {
    switch (getEventType(type)) {
      case 'Live Class': return 'Join Class';
      case 'Assessment': return 'Start Assessment';
      case 'Assignment': return 'View Assignment';
      default: return 'View Event';
    }
  }

  const getModuleCTA = (module: any, progress: number) => {
    if (module.isLock) {
      return "Module Locked";
    } else if (progress === 0) {
      return "Start Learning";
    } else if (progress === 100) {
      return "Revise Module";
    } else {
      return "Continue Learning";
    }
  };

  const getModuleProgress = (module: any) => {
    return module.progress || 0;
  };

  const getModuleDescription = (module: any) => {
    return module.description || "Learn essential concepts and build practical skills.";
  };

  const formatTimeAlloted = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''}`;
    }
  };

  const getContentCount = (module: any) => {
    const counts = [];
    if (module.quizCount > 0) counts.push(`${module.quizCount} Quiz${module.quizCount > 1 ? 'zes' : ''}`);
    if (module.assignmentCount > 0) counts.push(`${module.assignmentCount} Assignment${module.assignmentCount > 1 ? 's' : ''}`);
    if (module.codingProblemsCount > 0) counts.push(`${module.codingProblemsCount} Coding Problem${module.codingProblemsCount > 1 ? 's' : ''}`);
    if (module.articlesCount > 0) counts.push(`${module.articlesCount} Article${module.articlesCount > 1 ? 's' : ''}`);
    if (module.formCount > 0) counts.push(`${module.formCount} Form${module.formCount > 1 ? 's' : ''}`);

    return counts.join(' • ');
  };

  const AttendanceModal = ({ classes }: { classes: CompletedClass[] }) => (
    <>
      {/* Desktop Dialog */}
      <div className="hidden lg:block">
        <Dialog>
          <DialogTrigger asChild>
            {classes.length > 2 ? (
              <Button variant="link" className="p-0 h-auto text-primary mx-auto">
                View Full Attendance({classes.length})
              </Button>
            ) : ( // if classes length is less than 2, don't show the button    
              <></>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Full Attendance Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
              {classes.map((classItem, index, array) => (
                <div key={classItem.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1 text-left">
                      <h4 className="text-lg font-bold">{classItem.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(classItem.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge variant="outline" className={classItem.attendanceStatus === 'present' ? "text-success border-success" : "text-destructive border-destructive"}>
                        {classItem.attendanceStatus === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                      <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                                {classItem.s3Link === null || classItem.s3Link === 'not found' ? <button disabled={classItem.s3Link === null || classItem.s3Link === 'not found'} onClick={() => handleRecording(classItem.s3Link)} className="text-red-500    text-sm ">
                                <Video className="w-4 h-4 " />
                              </button> : <button disabled={classItem.s3Link === null || classItem.s3Link === 'not found'} onClick={() => handleRecording(classItem.s3Link)} className="text-primary  text-sm ">
                                <Video className="w-4 h-4 " />
                              </button>}

                            </TooltipTrigger>
                            <TooltipContent className="mr-24">
                              {classItem.s3Link === null || classItem.s3Link === 'not found' ? <p>Recording not found</p> : <p>Watch Recording</p>}
                            </TooltipContent>
                          </Tooltip>

                        </TooltipProvider>
                    </div>
                  </div>
                  {index < array.length - 1 && <div className="border-t border-border"></div>}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            {classes.length > 2 ? (
              <Button variant="link" className="p-0 h-auto text-primary mx-auto">
                View Full Attendance({classes.length})
              </Button>
            ) : ( // if classes length is less than 2, don't show the button    
              <></>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="text-xl">Full Attendance Record</SheetTitle>
            </SheetHeader>
            <div className="space-y-1 mt-4 overflow-y-auto">
              {classes.map((classItem, index, array) => (
                <div key={classItem.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold">{classItem.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(classItem.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={classItem.attendanceStatus === 'present' ? "text-success border-success" : "text-destructive border-destructive"}>
                        {classItem.attendanceStatus === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                       <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                                {classItem.s3Link === null || classItem.s3Link === 'not found' ? <button disabled={classItem.s3Link === null || classItem.s3Link === 'not found'} onClick={() => handleRecording(classItem.s3Link)} className="text-red-500 bg-primary-light text-sm border-primary">
                                <Video className="w-4 h-4 " />
                              </button> : <button disabled={classItem.s3Link === null || classItem.s3Link === 'not found'} onClick={() => handleRecording(classItem.s3Link)} className="text-primary bg-primary-light text-sm border-primary">
                                <Video className="w-4 h-4 " />
                              </button>}

                            </TooltipTrigger>
                            <TooltipContent>
                              {classItem.s3Link === null || classItem.s3Link === 'not found' ? <p>Recording not found</p> : <p>Watch Recording</p>}
                            </TooltipContent>
                          </Tooltip>

                        </TooltipProvider>
                    </div>
                  </div>
                  {index < array.length - 1 && <div className="border-t border-border"></div>}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );

  const EventsModal = ({ events }: { events: UpcomingEvent[] }) => (
    <>
      {/* Desktop Dialog */}
      <div className="hidden lg:block">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-primary mx-auto">
              View All Upcoming Events({events.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">All Upcoming Events</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
              {events.map((item, index, array) => {
                const eventType = getEventType(item.type);
                const isEventReady = canStartEvent(item.eventDate);
                return (
                  <div key={item.id}>
                    <div className="flex items-start gap-4 py-4">
                      <div className="flex-shrink-0 mt-1">
                        {getItemIconWithBackground(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-base">{item.title}</h4>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium">
                            {eventType === 'Live Class' && `Scheduled on ${formatDate(item.eventDate)}`}
                            {eventType === 'Assessment' && `Starts on ${formatDate(item.eventDate)}`}
                            {eventType === 'Assignment' && `Due on ${formatDate(item.eventDate)}`}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="link"
                            disabled={!isEventReady}
                            className="text-primary p-0 h-auto"
                          >
                            {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}

                          </Button>

                        </div>
                      </div>
                    </div>
                    {index < array.length - 1 && <div className="border-t border-border"></div>}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-primary mx-auto">
              View All Upcoming Events({events.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="text-xl">All Upcoming Events</SheetTitle>
            </SheetHeader>
            <div className="space-y-1 mt-4 overflow-y-auto">
              {events.map((item, index, array) => {
                const eventType = getEventType(item.type);
                const isEventReady = canStartEvent(item.eventDate);
                return (
                  <div key={item.id}>
                    <div className="flex items-start gap-4 py-4">
                      <div className="flex-shrink-0 mt-1">
                        {getItemIconWithBackground(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-base">{item.title}</h4>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium">
                            {eventType === 'Live Class' && `Scheduled on ${formatDate(item.eventDate)}`}
                            {eventType === 'Assessment' && `Starts on ${formatDate(item.eventDate)}`}
                            {eventType === 'Assignment' && `Due on ${formatDate(item.eventDate)}`}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="link"
                            disabled={!isEventReady}
                            className="text-primary p-0 h-auto"
                          >
                            {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < array.length - 1 && <div className="border-t border-border"></div>}
                  </div>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );

  const handleRecording = (s3Link: string) => {
    if (s3Link) {
      window.open(s3Link, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        {/* Course Information Banner - Full Width */}
        <div className="w-full rounded-b-lg shadow-8dp bg-gradient-to-br from-primary/8 via-background to-accent/8 border-b border-border/50">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <Image
                  src={courseCoverImage || '/logo.PNG'}
                  alt={courseName}
                  width={128}
                  height={128}
                  className="rounded-lg object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-left">{courseName}</h1>
                    <TruncatedDescription text={courseDescription} maxLength={250} className="text-base md:text-lg text-muted-foreground mb-4 text-left" />
                    <div className="flex items-center gap-2 mb-4">
                        {/* <Avatar className="w-8 h-8">
                          <AvatarImage src={instructorAvatar || '/logo.PNG'} />
                          <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
                        </Avatar> */}
                      <span className="font-medium capitalize text-sm ">Instructor:- {instructorName}</span>
                    </div>
                  </div>
                  {collaborator && <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                    <Image
                            src={collaborator || '/logo.PNG'}
                      alt="Collaborator Brand"
                      width={75}
                      height={56}
                      className="h-12"
                    />
                  </div>}

                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden mb-6">
              <Image
                src={courseCoverImage || '/logo.PNG'}
                alt={courseName}
                width={400}
                height={160}
                className="w-full h-40 rounded-lg object-cover mb-4"
              />
              <h1 className="text-2xl font-heading font-bold mb-2 text-left">{courseName}</h1>
              <TruncatedDescription text={courseDescription} maxLength={150} className="text-base text-muted-foreground mb-4 text-left" />
              <div className="flex items-center gap-2 mb-4">
                {/* <Avatar className="w-8 h-8">
                  <AvatarImage src={instructorAvatar || '/logo.PNG'} />
                  <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
                </Avatar> */}
                <span className="font-medium capitalize text-sm ">Instructor:- {instructorName}</span>
              </div>
              {collaborator && <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                <Image
                  src={collaborator || '/logo.PNG'}
                  alt="Collaborator Brand"
                  width={48}
                  height={48}
                  className="h-12"
                />
              </div>}
            </div>

            {/* Progress Bar - Updated with primary-light background */}
            <div className="mb-6">
              <div className="relative bg-primary-light rounded-full h-2 w-full">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 relative"
                  style={{ width: `${currentProgress}%` }}
                >
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 bg-card text-card-foreground px-2 py-0.5 rounded shadow-sm border text-xs font-medium whitespace-nowrap"
                    style={{
                      right: currentProgress === 100 ? '0' : currentProgress === 0 ? 'auto' : '-12px',
                      left: currentProgress === 0 ? '0' : 'auto'
                    }}
                  >
                    {currentProgress}%
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <BookOpen className="w-4 h-4" />
                </Badge>
                <div>
                  <p className="text-sm text-muted-foreground text-left">Batch</p>
                  <p className="font-medium text-left">{batchName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <Users className="w-4 h-4" />
                </Badge>
                <div>
                  <p className="text-sm text-muted-foreground text-left">Students</p>
                  <p className="font-medium text-left">{totalStudents} enrolled</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <Timer className="w-4 h-4" />
                </Badge>
                <div>
                  <p className="text-sm text-muted-foreground text-left">Duration</p>
                  <p className="font-medium text-left">{duration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Modules */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Modules Section */}
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-6 text-left">Course Content</h2>

                <div className="space-y-6">
                  {modulesToShow.map((module: any) => {
                    const moduleProgress = getModuleProgress(module);
                    const isCurrentModule = latestCourseData?.moduleId === module.id;
                    const isCompleted = moduleProgress === 100;
                    const isLocked = module.isLock;
                    const upcomingChapterId = latestCourseData?.newChapter?.id || 1 ;

                    return (
                        <Card className={`shadow-4dp   ${isCurrentModule ? 'border-2 border-primary my-4' : 'my-4'} ${isLocked ? 'opacity-60' : ''} ${!isLocked ? 'cursor-pointer hover:shadow-8dp transition-shadow' : 'cursor-not-allowed'}`}>
                          <CardContent className="p-6 ">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                              <div className="flex-1 text-left">
                                {isCurrentModule && (
                                  <Badge className="mb-2 bg-primary-light text-primary border-primary/20 self-start hover:bg-primary-light/80">Current Module</Badge>
                                )}
                                {isCompleted && (
                                  <Badge className="mb-2 bg-success-light text-success border-success/20 self-start hover:bg-success-light/80">Completed</Badge>
                                )}
                                {isLocked && (
                                  <Badge className="mb-2 bg-muted text-muted-foreground border-muted/20 self-start flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </Badge>
                                )}
                                <h3 className="text-xl font-heading font-semibold mb-2 text-left">
                                  Module {module.order}: {module.name}
                                </h3>
                                <TruncatedDescription text={getModuleDescription(module)} maxLength={250} className="text-muted-foreground mb-3 text-sm text-left " />
                                {/* <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">
                                  {formatTimeAlloted(module.timeAlloted)}
                                </Badge>
                                {getContentCount(module) && (
                                  <Badge variant="outline" className="text-xs">
                                    {getContentCount(module)}
                                  </Badge>
                                )}
                              </div> */}
                              </div>

                              {/* Action Button - Desktop: top right, Mobile: bottom */}
                              <Link key={module.id} href={`${isCurrentModule ? `/student/course/${courseId}/modules/${module.id}?chapterId=${upcomingChapterId}` : `/student/course/${courseId}/modules/${module.id}?chapterId=${module.ChapterId}`}`}>

                                <Button
                                  className={`px-6 ${isLocked ? 'bg-muted text-muted-foreground cursor-not-allowed' : `bg-white text-primary hover:underline ${isCurrentModule ? 'border-2 border-primary bg-primary text-white hover:no-underline' : ''} `}`}
                                  disabled={isLocked}
                                  onClick={(e) => {
                                    if (isLocked) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  {getModuleCTA(module, moduleProgress)}
                                </Button>
                              </Link>
                            </div>

                            {/* Module Progress - Updated with primary-light background */}
                            <div className="mb-4 lg:mb-0">
                              <div className="relative bg-primary-light rounded-full h-2 w-full">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 relative ${isLocked ? 'bg-muted' : 'bg-primary'}`}
                                  style={{ width: `${moduleProgress}%` }}
                                >
                                  <div
                                    className="absolute top-1/2 transform -translate-y-1/2 bg-card text-card-foreground px-2 py-0.5 rounded shadow-sm border text-xs font-medium whitespace-nowrap"
                                    style={{
                                      right: moduleProgress === 100 ? '0' : moduleProgress === 0 ? 'auto' : '-12px',
                                      left: moduleProgress === 0 ? '0' : 'auto'
                                    }}
                                  >
                                    {moduleProgress}%
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Button - Mobile: bottom */}
                            <div className="lg:hidden mt-4">
                              <Button
                                className={`w-full ${isLocked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary-dark'}`}
                                disabled={isLocked}
                                onClick={(e) => {
                                  if (isLocked) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                {getModuleCTA(module, moduleProgress)}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                    );
                  })}

                  {modulesToDisplay.length > 7 && !showAllModules && (
                    <div className="flex justify-center">
                      <Button
                        variant="link"
                        onClick={() => setShowAllModules(true)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Show More Modules
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - What's Next & Attendance */}
            <div className="space-y-8">
              {/* What's Next Section */}
              <Card className="shadow-4dp text-left">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl ">What&apos;s Next?</CardTitle>
                  {/* <p className="text-sm text-muted-foreground">
                    {formatDateRange()}
                  </p> */}
                </CardHeader>
                <CardContent className="pt-0">
                  {upcomingEventsData && upcomingEventsData.events.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEventsData.events.slice(0, 3).map((item: UpcomingEvent, index: number) => {
                        const eventType = getEventType(item.type);
                        const isEventReady = canStartEvent(item.eventDate);

                        return (
                          <a key={item.id} target={item.status === 'ongoing' ? '_blank' : '_self'} href={`${item.status === 'ongoing' ? (item as any).hangoutLink : `/student/course/${courseId}/modules/${item.moduleId}?chapterId=${item.chapterId}`}`}>
                            <div>
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  {getItemIconWithBackground(item.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <h4 className="font-medium text-base">{item.title}

                                    </h4>
                                  </div>
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium">
                                      {eventType === 'Live Class' && `Scheduled on ${formatDate(item.eventDate)}`}
                                      {eventType === 'Assessment' && `Starts on ${formatDate(item.eventDate)}`}
                                      {eventType === 'Assignment' && `Due on ${formatDate(item.eventDate)}`}
                                    </p>
                                  </div>
                                  {/* CTA - Bottom right */}
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      variant="link"
                                      disabled={!isEventReady}
                                      className="text-primary p-0 h-auto"
                                    >
                                      {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}
                                      <p>

                                        {item.status === 'ongoing' && <span className="w-2 h-2 ml-1 inline-block bg-green-500 animate-pulse rounded-full" />}
                                      </p>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {index < upcomingEventsData.events.slice(0, 3).length - 1 && (
                                <div className="border-t border-border mt-4"></div>
                              )}
                            </div>
                          </a>
                        )
                      })}

                      {/* View All Events Button - Only show if there are more than 3 events */}
                      {upcomingEventsData.events.length > 3 && (
                        <div className="flex justify-center pt-4">
                          <EventsModal events={upcomingEventsData.events} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12  mr-3">
                      {/* Illustration */}
                      <div className="mb-6 max-w-[200px] w-full">
                        <Image
                          src="/emptyStates/emptyStateforWhatsNext.svg"
                          alt="No upcoming events"
                          width={200}
                          height={120}
                          className="w-full h-auto opacity-80"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="text-left w-6/7 space-y-3 ">
                        <h3 className="text-lg font-semibold text-muted-foreground">
                          No Upcoming Events
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Stay tuned! Your upcoming assignments, live sessions, and deadlines will appear here to help you stay on track.
                        </p>
                        
                        {/* Optional CTA */}
                        <div className="pt-2">
                          <p className="text-xs text-left w-full text-muted-foreground flex  gap-1">
                            <Calendar className="w-3 h-3" />
                            Check back later for updates
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance */}
              <Card className=" text-left shadow-4dp">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Attendance</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {(completedClassesData?.classes || []).length > 0 ? (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {completedClassesData?.attendanceStats?.attendancePercentage || 0}%      
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {completedClassesData?.attendanceStats?.presentCount || 0} of {completedClassesData?.totalClasses || 0} classes attended
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <h4 className="font-medium text-sm">Recent Classes</h4>
                        {(completedClassesData?.classes || []).slice(0, 4).map((classItem: CompletedClass) => (
                          <div key={classItem.id} className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm  ">{ellipsis(classItem.title, 20)}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(classItem.startTime)}
                              </p>
                            </div>
                            <Badge variant="outline" className={classItem.attendanceStatus === 'present' ? "text-success border-success" : "text-destructive border-destructive"}>
                              {classItem.attendanceStatus === 'present' ? 'Present' : 'Absent'}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                    {classItem.s3Link === null || classItem.s3Link === 'not found' ? <button disabled={classItem.s3Link === null || classItem.s3Link === 'not found'} onClick={() => handleRecording(classItem.s3Link)} className="text-red-500  text-sm ">
                                    <Video className="w-4 h-4 " />
                                  </button> : <button disabled={classItem.s3Link === null || classItem.s3Link === 'not found'} onClick={() => handleRecording(classItem.s3Link)} className="text-primary  text-sm ">
                                    <Video className="w-4 h-4 " />
                                  </button>}

                                </TooltipTrigger>
                                <TooltipContent>
                                  {classItem.s3Link === null || classItem.s3Link === 'not found' ? <p>Recording not found</p> : <p>Watch Recording</p>}
                                </TooltipContent>
                              </Tooltip>

                            </TooltipProvider>

                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <AttendanceModal classes={completedClassesData?.classes || []} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12  mr-3">
                      {/* Illustration */}
                      <div className="mb-6 max-w-[200px] w-full">
                        <Image
                          src="/emptyStates/emptyStateforWhatsNext.svg"
                          alt="No classes attended"
                          width={200}
                          height={120}
                          className="w-full h-auto opacity-80"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="text-left w-6/7 space-y-3 ">
                        <h3 className="text-lg font-semibold text-muted-foreground">
                        Classes are yet to start
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Your attendance record will appear here once you start attending live classes. Stay engaged to track your progress!
                        </p>
                        
                        {/* Optional CTA */}
                        <div className="pt-2">
                          <p className="text-xs text-left w-full text-muted-foreground flex  gap-1">
                            <Calendar className="w-3 h-3" />
                            Check back after your first class
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;