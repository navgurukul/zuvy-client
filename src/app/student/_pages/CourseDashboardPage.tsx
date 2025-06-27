'use client';
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Video, BookOpen, FileText, Clock, Calendar, Users, Lock } from "lucide-react";
import Image from "next/image";
import { useBootcampProgress } from '@/hooks/useBootcampProgress';
import { useAllModulesForStudents } from '@/hooks/useAllModulesForStudents';
import { useUpcomingEvents, Event as UpcomingEvent } from '@/hooks/useUpcomingEvents';
import { useCompletedClasses, CompletedClass } from '@/hooks/useCompletedClasses';
import CourseDashboardSkeleton from '@/app/student/_components/CourseDashboardSkeleton';

const CourseDashboard = ({ courseId }: { courseId: string }) => {

  const [showAllModules, setShowAllModules] = useState(false);
    const { progressData, loading: progressLoading, error: progressError } = useBootcampProgress(courseId);
    const { modules: apiModules, loading: modulesLoading, error: modulesError } = useAllModulesForStudents(courseId);
    const { upcomingEventsData, loading: eventsLoading, error: eventsError } = useUpcomingEvents();
    const { completedClassesData, loading: classesLoading, error: classesError } = useCompletedClasses(courseId);

    // Show loading skeleton while fetching API data
    if (progressLoading || modulesLoading || eventsLoading || classesLoading) {
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

    const getEventType = (type: string): 'class' | 'assessment' | 'assignment' | 'unknown' => {
        if (type.toLowerCase().includes('class')) return 'class';
        if (type.toLowerCase().includes('assessment')) return 'assessment';
        if (type.toLowerCase().includes('assignment')) return 'assignment';
        return 'unknown';
    }

  const getItemIcon = (type: string) => {
        switch (getEventType(type)) {
      case 'class': return <Video className="w-5 h-5 text-primary" />;
      case 'assessment': return <BookOpen className="w-5 h-5 text-warning" />;
      case 'assignment': return <FileText className="w-5 h-5 text-info" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getItemIconWithBackground = (type: string) => {
        switch (getEventType(type)) {
      case 'class':
        return (
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
          </div>
        );
      case 'assessment':
        return (
          <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-warning" />
          </div>
        );
      case 'assignment':
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
            case 'class': return 'Join Class';
            case 'assessment': return 'Start Assessment';
            case 'assignment': return 'View Assignment';
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
            <Button variant="link" className="p-0 h-auto text-primary mx-auto">
              View Full Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                    <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={classItem.attendanceStatus === 'present' ? "text-success border-success" : "text-destructive border-destructive"}>
                                                {classItem.attendanceStatus === 'present' ? 'Present' : 'Absent'}
                      </Badge>
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
            <Button variant="link" className="p-0 h-auto text-primary mx-auto">
              View Full Attendance
            </Button>
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
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                                        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-left">{courseName}</h1>
                                        <p className="text-base md:text-lg text-muted-foreground mb-4 text-left">{courseDescription}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="w-8 h-8">
                                                <AvatarImage src={instructorAvatar || '/logo.PNG'} />
                                                <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
                      </Avatar>
                                            <span className="font-medium">{instructorName}</span>
                    </div>
                  </div>
                                    {collaborator && <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                                        <Image
                                            src={collaborator}
                                            alt="Collaborator Brand"
                                            width={48}
                                            height={48}
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
                            <p className="text-base text-muted-foreground mb-4 text-left">{courseDescription}</p>
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="w-8 h-8">
                                    <AvatarImage src={instructorAvatar || '/logo.PNG'} />
                                    <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
                </Avatar>
                                <span className="font-medium">{instructorName}</span>
              </div>
                            {collaborator && <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                                <Image
                                    src={collaborator}
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
                    className="absolute top-1/2 transform -translate-y-1/2 bg-white px-2 py-0.5 rounded shadow-sm border text-xs font-medium whitespace-nowrap"
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
                  <p className="text-sm text-muted-foreground">Batch</p>
                                    <p className="font-medium">{batchName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <Users className="w-4 h-4" />
                </Badge>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                                    <p className="font-medium">{totalStudents} enrolled</p>
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
                                <h2 className="text-2xl font-heading font-semibold mb-6 text-left">Course Modules</h2>
                
                <div className="space-y-4">
                                    {modulesToShow.map((module: any) => {
                                        const moduleProgress = getModuleProgress(module);
                                        const isCurrentModule = moduleProgress > 0 && moduleProgress < 100;
                    const isCompleted = moduleProgress === 100;
                                        const isLocked = module.isLock;
                    
                    return (
                                            <Link href={`/student/course/${courseId}/modules/${module.id}?chapterId=${module.ChapterId}`}>
                                                <Card key={module.id} className={`shadow-4dp ${isCurrentModule ? 'border-2 border-primary my-4' : 'my-4'} ${isLocked ? 'opacity-60' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                                            <div className="flex-1 text-left">
                              {isCurrentModule && (
                                                                    <Badge className="mb-2 bg-primary-light text-primary border-primary/20 self-start">Current Module</Badge>
                              )}
                              {isCompleted && (
                                                                    <Badge className="mb-2 bg-success-light text-success border-success/20 self-start">Completed</Badge>
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
                                                                <p className="text-muted-foreground mb-3 text-sm text-left">
                                                                    {getModuleDescription(module)}
                                                                </p>
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
                            <div className="hidden lg:flex flex-shrink-0">
                                                                <Button
                                                                    className={`px-6 ${isLocked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary-dark'}`}
                                                                    disabled={isLocked}
                                                                    asChild={!isLocked}
                                                                >
                                                                    {isLocked ? (
                                                                        <span>Module Locked</span>
                                                                    ) : (
                                                                        <Link href={`/student/course/${courseId}/modules/${module.id}?chapterId=${module.ChapterId}`}>
                                                                            {getModuleCTA(module, moduleProgress)}
                                </Link>
                                                                    )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Module Progress - Updated with primary-light background */}
                          <div className="mb-4 lg:mb-0">
                            <div className="relative bg-primary-light rounded-full h-2 w-full">
                              <div 
                                                                    className={`h-2 rounded-full transition-all duration-300 relative ${isLocked ? 'bg-muted' : 'bg-primary'}`}
                                style={{ width: `${moduleProgress}%` }}
                              >
                                <div 
                                  className="absolute top-1/2 transform -translate-y-1/2 bg-white px-2 py-0.5 rounded shadow-sm border text-xs font-medium whitespace-nowrap"
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
                                                                asChild={!isLocked}
                                                            >
                                                                {isLocked ? (
                                                                    <span>Module Locked</span>
                                                                ) : (
                                                                    <Link href={`/student/course/${courseId}/modules/${module.id}?chapterId=${module.ChapterId}`}>
                                                                        {getModuleCTA(module, moduleProgress)}
                              </Link>
                                                                )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                                            </Link>
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
                  <CardTitle className="text-xl">What's Next?</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange()}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                                    {upcomingEventsData && upcomingEventsData.events.length > 0 ? (
                    <div className="space-y-4">
                                            {upcomingEventsData.events.map((item: UpcomingEvent, index: number) => {
                                                const eventType = getEventType(item.type);
                                                const isEventReady = canStartEvent(item.eventDate);

                                                return (
                        <div key={item.id}>
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {getItemIconWithBackground(item.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h4 className="font-medium text-base">{item.title}</h4>
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium">
                                                                        {eventType === 'class' && `Scheduled on ${formatDate(item.eventDate)}`}
                                                                        {eventType === 'assessment' && `Starts on ${formatDate(item.eventDate)}`}
                                                                        {eventType === 'assignment' && `Due on ${formatDate(item.eventDate)}`}
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
                                </Button>
                              </div>
                            </div>
                          </div>
                                                        {index < upcomingEventsData.events.length - 1 && (
                            <div className="border-t border-border mt-4"></div>
                          )}
                        </div>
                                                )
                                            })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming items</p>
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
                                        {(completedClassesData?.classes || []).slice(0, 3).map((classItem: CompletedClass) => (
                      <div key={classItem.id} className="flex items-center justify-between">
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-sm">{classItem.title}</p>
                          <p className="text-xs text-muted-foreground">
                                                        {formatDate(classItem.startTime)}
                          </p>
                        </div>
                                                <Badge variant="outline" className={classItem.attendanceStatus === 'present' ? "text-success border-success" : "text-destructive border-destructive"}>
                                                    {classItem.attendanceStatus === 'present' ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                                        <AttendanceModal classes={completedClassesData?.classes || []} />
                  </div>
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