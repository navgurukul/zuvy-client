'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Video, BookOpen, FileText, Clock, Calendar, Users, Lock, Timer, User, Star, X, CalendarDays, ChevronRight,
  Search,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { useBootcampProgress } from '@/hooks/useBootcampProgress';
import { useAllModulesForStudents } from '@/hooks/useAllModulesForStudents';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
import { MentorSessionEvent, UpcomingEvent } from '@/hooks/hookType';
import { useCompletedClasses } from '@/hooks/useCompletedClasses';
import { CompletedClass, Module } from '@/hooks/hookType';
import { useLatestUpdatedCourse } from '@/hooks/useLatestUpdatedCourse';
import { useMentors } from '@/hooks/useMentors';
import TruncatedDescription from "@/app/student/_components/TruncatedDescription";
import { ellipsis } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useWindowSize from "@/hooks/useHeightWidth";
import { useIsStudentEnrolledInOneCourseStore } from "@/store/store";
import { ModuleContentCounts, TopicItem } from '@/app/student/_pages/pageStudentType'
import { formatUpcomingItem } from "@/utils/students"
import { CourseDashboardSkeleton, CourseDashboardEventsSkeleton } from '@/app/student/_components/Skeletons';
import { cn } from "@/lib/utils";
import { getMentorsHref, getSessionJoinHref, getSessionsHref } from "@/utils/studentMentorshipRoutes";
// import Leaderboard from '@/components/Leaderboard';
// import { useLeaderboard } from '@/hooks/useLeaderboard';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type WhatsNextItem = UpcomingEvent | MentorSessionEvent;


const CourseDashboard = ({ courseId }: { courseId: string }) => {
  const params = useParams();
  const orgId = params.orgId;

  const [showAllModules, setShowAllModules] = useState(false);
  const { setIsStudentEnrolledInOneCourse } = useIsStudentEnrolledInOneCourseStore()
  const { progressData, loading: progressLoading, error: progressError } = useBootcampProgress(courseId);
  const { modules: apiModules, loading: modulesLoading, error: modulesError } = useAllModulesForStudents(courseId);
  const { upcomingEventsData, loading: eventsLoading, error: eventsError } = useUpcomingEvents(courseId);
  const { completedClassesData, loading: classesLoading, error: classesError } = useCompletedClasses(courseId);
  const { latestCourseData, loading: latestCourseLoading, error: latestCourseError } = useLatestUpdatedCourse(courseId);
  const { mentors: mentorshipMentors } = useMentors('', Boolean(latestCourseData?.mentorshipEnabled), 1000, 0, orgId as string | undefined);
  // const { topEntries: leaderboardEntries, selfEntry: leaderboardSelfEntry, isSelfInTopFive, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(courseId);
  const { width } = useWindowSize();
  const isMobile = width < 768;


  const mentorshipSessionCount = upcomingEventsData?.mentorSessions?.length ?? 0;
  const availableMentorCount = mentorshipMentors.filter(
    (mentor) => mentor.availabilityStatus?.toLowerCase() === 'available'
  ).length;

  const QUICK_ACTIONS = [
    {
      label: "Find a Mentor",
      sub: availableMentorCount > 0 ? `${availableMentorCount} mentor available now` : "No mentors available now",
      href: getMentorsHref({ courseId, orgId: orgId as string | undefined }),
      icon: Search,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "My Sessions",
      sub: `${mentorshipSessionCount} upcoming`,
      href: getSessionsHref({ courseId, orgId: orgId as string | undefined }),
      icon: CalendarDays,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];
  
  useEffect(()=> {
    setIsStudentEnrolledInOneCourse(false)
  },[])


  // Show loading skeleton while fetching essential API data (excluding events)
  if (progressLoading || modulesLoading || classesLoading || latestCourseLoading) {
    return (
      <CourseDashboardSkeleton />
    );
  }


  // Show error state if essential APIs fail (excluding events)
  if (progressError || modulesError || classesError || latestCourseError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Failed to Load Course Data</h1>
          <p className="text-muted-foreground mb-4">{progressError || modulesError || classesError || latestCourseError}</p>
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
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
  };
  const validInstructorAvatar = isValidImageUrl(instructorAvatar) ? instructorAvatar : '';
  const courseName = progressData?.data?.bootcampTracking?.name || '';
  const courseDescription = progressData?.data?.bootcampTracking?.description || '';
  const courseCoverImage = progressData?.data?.bootcampTracking?.coverImage || '';
  const validCourseCoverImage = isValidImageUrl(courseCoverImage) ? courseCoverImage : '/logo.PNG';
  const collaborator = progressData?.data?.bootcampTracking?.collaborator || '';
  const validCollaborator = isValidImageUrl(collaborator) ? collaborator : '';
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

  const getEventType = (type: string): 'Live Class' | 'Assessment' | 'Assignment' | 'Mentor Session' | 'unknown' => {
    if (type.toLowerCase().includes('mentor session')) return 'Mentor Session';
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
      case 'Mentor Session': return <Video className="w-5 h-5 text-primary" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getItemIconWithBackground = (type: string) => {
    switch (getEventType(type)) {
      case 'Live Class':
        return (
          <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
        );
      case 'Assessment':
        return (
          <div className="w-5 h-5 rounded-full bg-warning-light flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-warning" />
          </div>
        );
      case 'Assignment':
        return (
          <div className="w-5 h-5 rounded-full bg-info-light flex items-center justify-center">
            <FileText className="w-5 h-5 text-info" />
          </div>
        );
      case 'Mentor Session':
        return (
          <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-muted-light flex items-center justify-center">
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

  const parseDateValue = (value?: string | null) => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date;
  };

  const isMentorSessionJoinWindowOpen = (
    startTime?: string | null,
    endTime?: string | null,
    nowTimestamp: number = Date.now()
  ) => {
    const startDate = parseDateValue(startTime);
    if (!startDate) return false;

    const tenMinutesBeforeStart = startDate.getTime() - 10 * 60 * 1000;
    const endDate = parseDateValue(endTime);

    if (!endDate) {
      return nowTimestamp >= tenMinutesBeforeStart;
    }

    return nowTimestamp >= tenMinutesBeforeStart && nowTimestamp <= endDate.getTime();
  };

  const getMentorSessionJoinHref = (item: MentorSessionEvent) => {
    if (!item.meetingLink) return null;

    return getSessionJoinHref(item.id, item.meetingLink, { courseId, orgId: orgId as string | undefined });
  };

  const getEventActionText = (type: string) => {
    switch (getEventType(type)) {
      case 'Live Class': return 'Join Class';
      case 'Assessment': return 'Start Assessment';
      case 'Assignment': return 'View Assignment';
      case 'Mentor Session': return 'Join Session';
      default: return 'View Event';
    }
  }

  const isMentorSession = (item: WhatsNextItem): item is MentorSessionEvent => {
    return getEventType(item.type) === 'Mentor Session';
  };

  const isRegularUpcomingEvent = (item: WhatsNextItem): item is UpcomingEvent => {
    return !isMentorSession(item);
  };

  const mergedUpcomingItems: WhatsNextItem[] = [
    ...(upcomingEventsData?.events || []),
    ...(latestCourseData?.mentorshipEnabled ? (upcomingEventsData?.mentorSessions || []) : []),
  ].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const getModuleCTA = (module:Module , progress: number) => {
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

  const getModuleProgress = (module:Module) => {
    return module.progress || 0;
  };

  const getModuleDescription = (module:Module) => {
    return module.description || "Learn essential concepts and build practical skills.";
  };

  const getModuleHref = (module: Module, isCurrentModule: boolean, upcomingChapterId: number | null) => {
    const chapterId = isCurrentModule ? upcomingChapterId : module.ChapterId;
    return `/student/course/${courseId}/org/${orgId}/modules/${module.id}?chapterId=${chapterId}`;
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

  const getContentCount = (module: ModuleContentCounts) => {
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
              <Button
                variant="link"
                className="p-0 h-auto text-primary mx-auto"
              >
                View Full Attendance({classes.length})
              </Button>
            ) : (
              // if classes length is less than 2, don't show the button
              <></>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Full Attendance Record{' '}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
              {classes.map((classItem, index, array) => (
                <div key={classItem.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1 text-left">
                      {classItem.moduleId === null ||
                        classItem.chapterId == null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-left font-manrope text-lg  font-bold cursor-default underline-offset-[5px]">
                              {classItem.title}
                            </TooltipTrigger>
                            <TooltipContent className=" text-left">
                              The chapter isn’t
                              included in the
                              module yet,
                              {(classItem.s3Link !==
                                null ||
                                classItem.s3Link !==
                                'not found') &&
                                'but you can still view the recording'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Link
                          className="w-fit font-manrope text-lg  font-bold hover:text-primary hover:underline underline-offset-[5px]"
                          href={`/student/course/${courseId}/org/${orgId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}`}
                        >
                          {classItem.title}
                        </Link>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          classItem.startTime
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge
                        variant="outline"
                        className={
                          classItem.s3Link === null ||
                            classItem.s3Link ===
                            'not found'
                            ? 'text-warning border-warning'
                            : classItem.s3Link &&
                              classItem.attendanceStatus ===
                              'absent'
                              ? 'text-destructive border-destructive'
                              : 'text-success border-success'
                        }
                      >
                        {classItem.s3Link === null ||
                          classItem.s3Link === 'not found'
                          ? 'Processing'
                          : classItem.s3Link &&
                            classItem.attendanceStatus ===
                            'absent'
                            ? 'Absent'
                            : 'Present'}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {classItem.s3Link ===
                              null ||
                              classItem.s3Link ===
                              'not found' ? (
                              <button
                                disabled={
                                  classItem.s3Link ===
                                  null ||
                                  classItem.s3Link ===
                                  'not found'
                                }
                                onClick={() =>
                                  handleRecording(
                                    classItem.s3Link
                                  )
                                }
                                className="text-red-500    text-sm "
                              >
                                <Video className="w-4 h-4 " />
                              </button>
                            ) : (
                              <button
                                disabled={
                                  classItem.s3Link ===
                                  null ||
                                  classItem.s3Link ===
                                  'not found'
                                }
                                onClick={() =>
                                  handleRecording(
                                    classItem.s3Link
                                  )
                                }
                                className="text-primary  text-sm "
                              >
                                <Video className="w-4 h-4 " />
                              </button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent className="mr-24">
                            {classItem.s3Link ===
                              null ||
                              classItem.s3Link ===
                              'not found' ? (
                              <p>
                                Recording not
                                found
                              </p>
                            ) : (
                              <p>
                                Watch Recording
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {index < array.length - 1 && (
                    <div className="border-t border-border"></div>
                  )}
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
              <Button
                variant="link"
                className="p-0 h-auto text-primary mx-auto"
              >
                View Full Attendance({classes.length})
              </Button>
            ) : (
              // if classes length is less than 2, don't show the button
              <></>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="text-xl text-left">
                Full Attendance Record
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-1  h-full overflow-y-scroll">
              {classes.map((classItem, index, array) => (
                <div key={classItem.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1 text-left">
                      {classItem.moduleId === null ||
                        classItem.chapterId == null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-left font-manrope text-lg  font-bold cursor-default underline-offset-[5px]">
                              {classItem.title}
                            </TooltipTrigger>
                            <TooltipContent className=" text-left">
                              The chapter isn’t
                              included in the
                              module yet,
                              {(classItem.s3Link !==
                                null ||
                                classItem.s3Link !==
                                'not found') &&
                                'but you can still view the recording'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Link
                          className="w-fit font-manrope text-lg  font-bold hover:text-primary hover:underline underline-offset-[5px]"
                          href={`/student/course/${courseId}/org/${orgId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}`}
                        >
                          {classItem.title}
                        </Link>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          classItem.startTime
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          classItem.s3Link === null ||
                            classItem.s3Link ===
                            'not found'
                            ? 'text-warning border-warning'
                            : classItem.s3Link &&
                              classItem.attendanceStatus ===
                              'absent'
                              ? 'text-destructive border-destructive'
                              : 'text-success border-success'
                        }
                      >
                        {classItem.s3Link === null ||
                          classItem.s3Link === 'not found'
                          ? 'Processing'
                          : classItem.s3Link &&
                            classItem.attendanceStatus ===
                            'absent'
                            ? 'Absent'
                            : 'Present'}{' '}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {classItem.s3Link ===
                              null ||
                              classItem.s3Link ===
                              'not found' ? (
                              <button
                                disabled={
                                  classItem.s3Link ===
                                  null ||
                                  classItem.s3Link ===
                                  'not found'
                                }
                                onClick={() =>
                                  handleRecording(
                                    classItem.s3Link
                                  )
                                }
                                className="text-red-500 bg-primary-light text-sm border-primary"
                              >
                                <Video className="w-4 h-4 " />
                              </button>
                            ) : (
                              <button
                                disabled={
                                  classItem.s3Link ===
                                  null ||
                                  classItem.s3Link ===
                                  'not found'
                                }
                                onClick={() =>
                                  handleRecording(
                                    classItem.s3Link
                                  )
                                }
                                className="text-primary bg-primary-light text-sm border-primary"
                              >
                                <Video className="w-4 h-4 " />
                              </button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {classItem.s3Link ===
                              null ||
                              classItem.s3Link ===
                              'not found' ? (
                              <p>
                                Recording not
                                found
                              </p>
                            ) : (
                              <p>
                                Watch Recording
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {index < array.length - 1 && (
                    <div className="border-t border-border"></div>
                  )}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )

  const EventsModal = ({ events }: { events: WhatsNextItem[] }) => (
    <>
      {/* Desktop Dialog */}
      <div className="hidden lg:block">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="link"
              className="p-0 h-auto text-primary mx-auto"
            >
              View All Upcoming Events({events.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                All Upcoming Events
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
              {events.map((item, index, array) => {
                const eventType = getEventType(item.type)
                const isEventReady = canStartEvent(
                  item.eventDate
                )
                return (
                  <div key={`${item.type}-${item.id}`}>
                    <div className="flex items-start gap-4 py-4">
                      <div className="flex-shrink-0 mt-1">
                        {getItemIconWithBackground(
                          item.type
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-base">
                            {item.title}
                          </h4>
                        </div>
                        {eventType === 'Mentor Session' && isMentorSession(item) && (
                          <p className="text-sm text-muted-foreground mb-2 text-left">Mentor: {item.mentorName}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium">
                            {/* {eventType ===
                                                            'Live Class' &&
                                                            `Scheduled on ${formatDate(
                                                                item.eventDate
                                                            )}`}
                                                        {eventType ===
                                                            'Assessment' &&
                                                            `Starts on ${formatDate(
                                                                item.eventDate
                                                            )}`}
                                                        {eventType ===
                                                            'Assignment' &&
                                                            `Due on ${formatDate(
                                                                item.eventDate
                                                            )}`} */}
                            {formatUpcomingItem(item)}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          {eventType === 'Live Class' && isRegularUpcomingEvent(item) ? (
                            <Button
                              size="sm"
                              variant="link"
                              disabled={!isEventReady}
                              className="text-primary p-0 h-auto"
                              onClick={() => window.open(item.hangoutLink || '', '_blank')}
                            >
                              {isEventReady
                                ? getEventActionText(
                                  item.type
                                )
                                : getTimeRemaining(
                                  item.eventDate
                                )}
                            </Button>
                          ) : eventType === 'Mentor Session' && isMentorSession(item) ? (
                            (() => {
                              const canJoinNow = isMentorSessionJoinWindowOpen(item.startTime, item.endTime)
                              const joinHref = getMentorSessionJoinHref(item)

                              if (canJoinNow && joinHref) {
                                return (
                                  <Button asChild size="sm" variant="link" className="text-primary p-0 h-auto">
                                    <Link href={joinHref} target="_blank" rel="noopener noreferrer">
                                      {getEventActionText(item.type)}
                                    </Link>
                                  </Button>
                                )
                              }

                              return (
                                <div className="flex flex-col items-end gap-1">
                                  <Button size="sm" variant="link" disabled className="text-primary p-0 h-auto">
                                    Join Session
                                  </Button>
                                  <p className="text-xs text-muted-foreground text-right">
                                    Join opens 10 minutes before start.
                                  </p>
                                </div>
                              )
                            })()
                          ) : isRegularUpcomingEvent(item) ? (
                            <Link
                              href={`/student/course/${courseId}/org/${orgId}/modules/${item.moduleId}?chapterId=${item.chapterId}`}
                              className="text-primary text-sm font-medium hover:underline"
                            >
                              {isEventReady
                                ? getEventActionText(
                                  item.type
                                )
                                : getTimeRemaining(
                                  item.eventDate
                                )}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {index < array.length - 1 && (
                      <div className="border-t border-border"></div>
                    )}
                  </div>
                )
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
                  <div key={`${item.type}-${item.id}`}>
                    <div className="flex items-start gap-4 py-4">
                      <div className="flex-shrink-0 mt-1">
                        {getItemIconWithBackground(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-base">{item.title}</h4>
                        </div>
                        {eventType === 'Mentor Session' && isMentorSession(item) && (
                          <p className="text-sm text-muted-foreground mb-2">Mentor: {item.mentorName}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium">
                            {eventType === 'Live Class' && `Scheduled on ${formatDate(item.eventDate)}`}
                            {eventType === 'Assessment' && `Starts on ${formatDate(item.eventDate)}`}
                            {eventType === 'Assignment' && `Due on ${formatDate(item.eventDate)}`}
                            {eventType === 'Mentor Session' && `Scheduled on ${formatDate(item.eventDate)}`}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          {eventType === 'Live Class' && isRegularUpcomingEvent(item) ? (
                            <Button
                              size="sm"
                              variant="link"
                              disabled={!isEventReady}
                              className="text-primary p-0 h-auto"
                              onClick={() => window.open(item.hangoutLink || '', '_blank')}
                            >
                              {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}
                            </Button>
                          ) : eventType === 'Mentor Session' && isMentorSession(item) ? (
                            (() => {
                              const canJoinNow = isMentorSessionJoinWindowOpen(item.startTime, item.endTime)
                              const joinHref = getMentorSessionJoinHref(item)

                              if (canJoinNow && joinHref) {
                                return (
                                  <Button asChild size="sm" variant="link" className="text-primary p-0 h-auto">
                                    <Link href={joinHref} target="_blank" rel="noopener noreferrer">
                                      {getEventActionText(item.type)}
                                    </Link>
                                  </Button>
                                )
                              }

                              return (
                                <div className="flex flex-col items-end gap-1">
                                  <Button size="sm" variant="link" disabled className="text-primary p-0 h-auto">
                                    Join Session
                                  </Button>
                                  <p className="text-xs text-muted-foreground text-right">
                                    Join opens 10 minutes before start.
                                  </p>
                                </div>
                              )
                            })()
                          ) : isRegularUpcomingEvent(item) ? (
                            <Link
                              href={`/student/course/${courseId}/org/${orgId}/modules/${item.moduleId}?chapterId=${item.chapterId}`}
                              className="text-primary text-sm font-medium hover:underline"
                            >
                              {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}
                            </Link>
                          ) : null}
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
          <div className="w-full rounded-b-lg shadow-8dp bg-gradient-to-br from-primary/8 via-background to-accent/8  border-border/50">
            <div className="max-w-[89rem] mx-auto p-6 md:p-8">
              {/* Desktop Layout */}
              <div className="hidden border md:flex flex-col md:flex-row items-start gap-6 mb-0 rounded-lg bg-white p-6 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <Image
                      src={validCourseCoverImage}
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
                          <AvatarImage src={validInstructorAvatar || '/logo.PNG'} />
                          <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
                        </Avatar> */}
                          <span className="font-medium capitalize text-sm ">Instructor:- {instructorName}</span>
                        </div>
                      </div>
                      {validCollaborator ? <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                          <Image
                            src={validCollaborator}
                            alt="Collaborator Brand"
                            width={75}
                            height={56}
                            className="h-12"
                          />
                        </div> : collaborator ?
                        <div className="flex  items-center gap-2">
                          <p className="text-sm font-bold text-muted-foreground ">In Collaboration With</p>
                          <p className="text-sm font-bold text-primary">{collaborator}</p>
                        </div> : ''}
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden mb-3">
                  <Image
                    src={validCourseCoverImage}
                    alt={courseName}
                    width={400}
                    height={160}
                    className="w-full h-40 rounded-lg object-cover mb-4"
                  />
                  <h1 className="text-2xl font-heading font-bold mb-2 text-left">{courseName}</h1>
                  <TruncatedDescription text={courseDescription} maxLength={150} className="text-base text-muted-foreground mb-4 text-left" />
                  <div className="flex items-center gap-2 mb-4">
                    {/* <Avatar className="w-8 h-8">
                      <AvatarImage src={validInstructorAvatar || '/logo.PNG'} />
                      <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
                    </Avatar> */}
                    <span className="font-medium capitalize text-sm ">Instructor:- {instructorName}</span>
                  </div>
                  {validCollaborator && <div className="flex items-center gap-2 mb-4">
                      <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                      <Image
                        src={validCollaborator}
                        alt="Collaborator Brand"
                        width={48}
                        height={48}
                        className="h-12"
                      />
                    </div>}
                    </div>
                </div>
              </div>

              <div className="max-w-[88rem] mx-auto px-4 md:px-6 pt-4 pb-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(260px,1fr)] lg:items-start">
            {/* Left Column - Stats and Course Modules */}
            <div className="space-y-6 min-w-0">
              <div className="w-full rounded-lg bg-white p-4 md:p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative bg-primary-light rounded-full h-1.5 flex-1">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>

                    <span className="w-10 text-right text-xs font-semibold text-foreground/70">
                      {currentProgress}%
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                    <div className="flex items-center gap-2.5 text-foreground/80">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <BookOpen size={16} className="text-foreground/60" />
                      </div>
                      <div>
                        <div className="text-[11px] leading-4 text-muted-foreground text-left">Batch</div>
                        <div className="text-sm font-semibold leading-5">{batchName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-foreground/80">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Users size={16} className="text-foreground/60" />
                      </div>
                      <div>
                        <div className="text-[11px] leading-4 text-muted-foreground text-left">Students</div>
                        <div className="text-sm font-semibold leading-5">{totalStudents} enrolled</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-foreground/80">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Clock size={16} className="text-foreground/60" />
                      </div>
                      <div>
                        <div className="text-[11px] leading-4 text-muted-foreground text-left">Duration</div>
                        <div className="text-sm font-semibold leading-5">{(+duration) > 1 ? `${duration} weeks` : `${duration} week`}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Modules Section */}
              <div className="w-full">
                <h2 className="text-xl font-heading font-semibold mb-4 text-left">Course Content</h2>

                <div className="space-y-4">
                  {modulesToShow.length > 0 ? modulesToShow.map((module: Module) => {
                    const moduleProgress = getModuleProgress(module);
                    const isCurrentModule = latestCourseData?.moduleId === module.id;
                    const isCompleted = moduleProgress === 100;
                    const isLocked = module.isLock;
                    const upcomingChapterId = latestCourseData?.newChapter?.id || 1;

                    return (
                      <Card key={module.id} className={`w-full rounded-lg border p-0 transition-all duration-300 my-3 ${isCurrentModule ? 'border-2 border-primary' : ''} ${isLocked ? 'opacity-60' : ''} ${!isLocked ? 'cursor-pointer hover:shadow-8dp transition-shadow' : 'cursor-not-allowed'} min-h-[166px]`}>
                        <CardContent className={`flex h-full flex-col p-4 md:p-4 ${isLocked ? ' cursor-not-allowed' : ''}`}>
                          <div className="flex flex-1 flex-col lg:flex-row lg:justify-between lg:items-start gap-3 min-w-0">
                            <div className="flex-1 min-w-0 text-left">
                              {isCurrentModule && (
                                <Badge className="mb-2 self-start rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary dark:text-white border-primary/20 hover:bg-primary-light/80">Current Module</Badge>
                              )}
                              {isCompleted && (
                                <Badge className="mb-2 self-start rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold tracking-wide text-success border-success/20 hover:bg-success-light/80">Completed</Badge>
                              )}
                              {/* {isLocked && (
                                  <Badge className="mb-2 bg-muted text-muted-foreground border-muted/20 self-start flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </Badge>
                                )} */}
                              <h3 className="text-sm md:text-[1rem] font-heading font-semibold mb-2 leading-tight text-left">
                                {module.typeId === 2 ? 'Project' : 'Module'}  {module.order}: {module.name}
                              </h3>
                              <TruncatedDescription text={getModuleDescription(module)} maxLength={150} className="mb-2 text-sm leading-6 text-muted-foreground text-left" />
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
                              {module.typeId === 2 && <span className="text-sm text-muted-foreground" >Due: January 20, 2025</span>}
                            </div>

                            {/* Action Button - Desktop: top right, Mobile: bottom */}
                            {!isMobile && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="lg:self-start lg:pt-1">

                                      <Button
                                        className={`h-9 px-4 text-sm font-semibold bg- hover:text-white  ${(isLocked || (module.typeId !== 2 && !module.ChapterId)) ? 'text-muted-foreground cursor-not-allowed' : ` text-primary hover:underline hover:underline-offset-4 ${isCurrentModule ? 'border-2 border-primary bg-primary text-white hover:no-underline  ' : ''} `}`}
                                        disabled={isLocked || (module.typeId !== 2 && !module.ChapterId)}
                                        onClick={(e) => {
                                          if (isLocked || (module.typeId !== 2 && !module.ChapterId)) {
                                            e.preventDefault();
                                          }
                                        }}
                                      >
                                        {module.typeId !== 2 ? <Link key={module.id} className="" href={getModuleHref(module, isCurrentModule, upcomingChapterId)}>
                                          {getModuleCTA(module, moduleProgress)}
                                        </Link> : <Link href={`/student/course/${courseId}/org/${orgId}/projects?moduleId=${module.id}&projectId=${module.projectId}`} className={`${isCurrentModule ? 'text-white' : ''} text-sm  hover:underline`} >View Project</Link>}
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  {!module.ChapterId && module.typeId !== 2 && (
                                    <TooltipContent className="font-semibold" >
                                      <p>No chapter is created inside this module yet</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>

                          {/* Module Progress - Updated with primary-light background */}
                          {module.typeId !== 2 && <div className="mt-auto pt-3 mb-0">
                            <div className="relative bg-primary-light rounded-full h-1.5 w-full">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 relative ${isLocked ? 'bg-muted' : 'bg-primary'}`}
                                style={{ width: `${moduleProgress}%` }}
                              >
                                <div
                                  className="absolute top-1/2 transform -translate-y-1/2 bg-card text-card-foreground px-1.5 py-0.5 rounded shadow-sm border text-[10px] font-medium whitespace-nowrap"
                                  style={{
                                    right: moduleProgress === 100 ? '0' : moduleProgress === 0 ? 'auto' : '-12px',
                                    left: moduleProgress === 0 ? '0' : 'auto'
                                  }}
                                >
                                  {moduleProgress}%
                                </div>
                              </div>
                            </div>
                          </div>}

                          {/* A
                          
                          tion Button - Mobile: bottom */}
                          {isMobile && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="mt-2">

                                    <Button
                                      className={`h-9 px-4 mb-0 font-semibold bg- ${(isLocked || (module.typeId !== 2 && !module.ChapterId)) ? 'text-muted-foreground cursor-not-allowed' : ` text-primary hover:underline  ${isCurrentModule ? 'border-2 border-primary bg-primary text-white hover:no-underline w-full' : ''} `}`}
                                      disabled={isLocked || (module.typeId !== 2 && !module.ChapterId)}
                                      onClick={(e) => {
                                        if (isLocked || (module.typeId !== 2 && !module.ChapterId)) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      {module.typeId !== 2 ? <Link key={module.id} href={getModuleHref(module, isCurrentModule, upcomingChapterId)}>
                                        {getModuleCTA(module, moduleProgress)}
                                      </Link> : <Link href={`/student/course/${courseId}/org/${orgId}/projects?moduleId=${module.id}&projectId=${module.projectId}`} className={` text-sm  text-primary hover:underline`} >View Project</Link>}
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                {!module.ChapterId && module.typeId !== 2 && (
                                  <TooltipContent className="font-semibold" >
                                    <p>No chapter is created inside this module yet</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </CardContent>
                      </Card>

                    );
                  }) :
                    <div className="mb-6 text-left flex flex-col justify-end w-full items-center">
                      <Image
                        src="/emptyStates/greendog.svg"
                        alt="No upcoming events"
                        width={50}
                        height={50}
                        className="w-1/2 h-auto opacity-80"
                      />
                      <h3 className="text-lg text-left w-full font-semibold text-muted-foreground">
                        No Modules Found
                      </h3>
                      <p className="text-sm text-left w-full text-muted-foreground leading-relaxed">
                        No modules created for this course yet, Please check back later.
                      </p>

                    </div>}

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

            {/* Right Column - Mentorship */}
            <div className="space-y-4 min-w-0 w-full lg:max-w-[300px] lg:justify-self-end">
              {latestCourseData?.mentorshipEnabled && (
                // <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3 text-left shadow-sm">
                //   <div className="-mx-4 mb-3 flex items-center justify-between border-b border-gray-200 px-4 pb-3">
                //     <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-primary">Mentorship</p>
                //   </div>
                //   <div>
                //   </div>
                //   {QUICK_ACTIONS.map((a) => (
                //     <Link
                //       key={a.href}
                //       href={a.href}
                //       className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors group"
                //     >
                //       <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", a.bg)}>
                //         <a.icon className={cn("h-3.5 w-3.5", a.color)} />
                //       </div>
                //       <div className="flex-1 min-w-0">
                //         <p className="text-sm font-semibold leading-5 text-text-primary">{a.label}</p>
                //         <p className="text-xs leading-4 text-text-muted">{a.sub}</p>
                //       </div>
                //       <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-text-secondary" />
                //     </Link>
                //   ))}
                // </div>
                <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3 text-left shadow-sm">
                    <div className="-mx-4 mb-3 flex items-center justify-between border-b border-gray-200 px-4 pb-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-primary">
                        Mentorship
                      </p>
                    </div>

                    {QUICK_ACTIONS.map((a) => (
                      <Link
                        key={a.href}
                        href={a.href}
                        className="group flex items-center gap-3 rounded-xl border border-[#E7ECE8] bg-white px-3 py-3 transition-all duration-200 hover:border-[#CFE5D3] hover:bg-[#F4FBF5]"
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF7F0] transition-colors duration-200 group-hover:bg-[#DDF3E2]"
                          )}
                        >
                          <a.icon className="h-4 w-4 text-[#2F6F3E]" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-5 text-[#1F2937]">
                            {a.label}
                          </p>

                          <p className="text-xs leading-4 text-[#6B7280]">
                            {a.sub}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF] transition-all duration-200 group-hover:text-[#2F6F3E]" />
                      </Link>
                    ))}
                  </div>
              )}

              {/* What's Next Section */}
              <Card className="w-full shadow-4dp text-left rounded-lg bg-white border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">What&apos;s Next?</CardTitle>
                  {/* <p className="text-sm text-muted-foreground">
                    {formatDateRange()}
                  </p> */}
                </CardHeader>
                <CardContent className="pt-0">
                  {eventsLoading ? (
                    <CourseDashboardEventsSkeleton/>
                  ) : mergedUpcomingItems.length > 0 ? (
                    <div className="space-y-4">
                      {mergedUpcomingItems.slice(0, 3).map((item: WhatsNextItem, index: number) => {
                        const eventType = getEventType(item.type);
                        const isEventReady = canStartEvent(item.eventDate);

                        return (
                          <div key={`${item.type}-${item.id}`}>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                {getItemIconWithBackground(item.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h4 className="font-medium text-base hover:text-primary hover:underline underline-offset-[4px]">
                                    {eventType === 'Mentor Session' ? (
                                      <Link
                                        href={getSessionsHref({ courseId, orgId: orgId as string | undefined })}
                                        target="_self"
                                        className="hover:text-primary hover:underline underline-offset-[4px]"
                                      >
                                        {item.title}
                                      </Link>
                                    ) : isRegularUpcomingEvent(item) ? (
                                      <Link
                                        href={`/student/course/${courseId}/org/${orgId}/modules/${item.moduleId}?chapterId=${item.chapterId}`}
                                        target="_self"
                                        className="hover:text-primary hover:underline underline-offset-[4px]"
                                      >
                                        {item.title}
                                      </Link>
                                    ) : null}
                                  </h4>
                                </div>
                                {eventType === 'Mentor Session' && isMentorSession(item) && (
                                  <p className="text-sm text-muted-foreground mb-2">Mentor: {item.mentorName}</p>
                                )}
                                <Badge className={`my-2 hover:text-white ${item.type === 'Live Class' || item.type === 'Mentor Session' ? 'bg-primary-light text-primary border-primary/20 ' : item.type === 'Assessment' ? 'bg-warning-light text-warning border-warning/20 hover:bg-warning' : 'bg-info-light text-info border-info/20 hover:bg-info'} `} >{item.type}</Badge>
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium">
                                    {eventType === 'Mentor Session' && isMentorSession(item)
                                      ? 'Join Session'
                                      : formatUpcomingItem(item)}
                                  </p>
                                </div>
                                {/* CTA - Bottom right */}
                                {eventType === 'Live Class' && isRegularUpcomingEvent(item) && (
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      variant="link"
                                      disabled={!isEventReady}
                                      className="text-primary p-0 h-auto"
                                      onClick={() => window.open(item.hangoutLink || '', '_blank')}
                                    >
                                      {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}

                                      {item.status === 'ongoing' && <span className="w-2 h-2 ml-1 inline-block bg-green-500 animate-pulse rounded-full" />}
                                    </Button>
                                  </div>
                                )}
                                {eventType === 'Mentor Session' && isMentorSession(item) && (() => {
                                  const canJoinNow = isMentorSessionJoinWindowOpen(item.startTime, item.endTime)
                                  const joinHref = getMentorSessionJoinHref(item)

                                  return (
                                    <div className="flex flex-col items-end gap-1">
                                      {canJoinNow && joinHref ? (
                                        <Button asChild size="sm" variant="link" className="text-primary p-0 h-auto">
                                          <Link href={joinHref} target="_blank" rel="noopener noreferrer">
                                            {getEventActionText(item.type)}
                                          </Link>
                                        </Button>
                                      ) : (
                                        <Button size="sm" variant="link" disabled className="text-primary p-0 h-auto">
                                          Join Session
                                        </Button>
                                      )}
                                      {!canJoinNow && (
                                        <p className="text-xs text-muted-foreground text-right">
                                          Join opens 10 minutes before start.
                                        </p>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                            {index < mergedUpcomingItems.slice(0, 3).length - 1 && (
                              <div className="border-t border-border mt-4"></div>
                            )}
                          </div>
                        )
                      })}

                      {/* View All Events Button - Only show if there are more than 3 events */}
                      {mergedUpcomingItems.length > 3 && (
                        <div className="flex justify-center pt-4">
                          <EventsModal events={mergedUpcomingItems} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12  mr-3">
                      {/* Illustration */}
                      <div className="mb-6 max-w-[200px] w-full">
                        <Image
                          src="/emptyStates/whatsnext.svg"
                          alt="No upcoming events"
                          width={200}
                          height={120}
                          className="w-full h-auto opacity-80"
                        />
                      </div>

                      {/* Content */}
                      <div className="text-left w-full max-w-[220px] space-y-2.5 ">
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

              {/* {latestCourseData?.leaderboardEnabled && (
                <Card className="w-full shadow-4dp text-left rounded-lg bg-white border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <Leaderboard
                        entries={leaderboardEntries}
                        loading={leaderboardLoading}
                        error={leaderboardError}
                        selfEntry={leaderboardSelfEntry}
                        showSelfEntry={!isSelfInTopFive}
                      />
                    </div>
                  </CardContent>
                </Card>
              )} */}

              {/* Attendance */}
              <Card className="w-full text-left rounded-lg border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-3">
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
                        <h4 className="font-medium text-sm">
                          Recent Classes
                        </h4>
                        {(
                          completedClassesData?.classes ||
                          []
                        )
                          .slice(0, 4)
                          .map(
                            (
                              classItem: CompletedClass
                            ) => (
                              <div
                                key={
                                  classItem.id
                                }
                                className="flex items-center justify-between gap-4"
                              >
                                {/* <div className="flex-1 text-left">
                                                                    <Link
                                                                        className=" hover:text-primary"
                                                                        href={`/student/course/${courseId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}`}
                                                                    >
                                                                        <p className="font-medium text-sm ">
                                                                            {ellipsis(
                                                                                classItem.title,
                                                                                35
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDate(
                                                                                classItem.startTime
                                                                            )}
                                                                        </p>
                                                                    </Link>
                                                                </div> */}
                                <div className="flex-1 text-left">
                                  {classItem.moduleId ===
                                    null ||
                                    classItem.chapterId ==
                                    null ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger className="text-left font-manrope text-sm cursor-default underline-offset-[5px]">
                                          {
                                            classItem.title
                                          }
                                        </TooltipTrigger>
                                        <TooltipContent className="w-1/3 ml-96 text-left">
                                          The
                                          chapter
                                          isn’t
                                          included
                                          in
                                          the
                                          module
                                          yet,
                                          {(classItem.s3Link !==
                                            null ||
                                            classItem.s3Link !==
                                            'not found') &&
                                            'but you can still view the recording'}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <Link
                                      className="w-fit font-manrope text-sm  hover:text-primary hover:underline underline-offset-[5px]"
                                      href={`/student/course/${courseId}/org/${orgId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}`}
                                    >
                                      {ellipsis(
                                        classItem.title,
                                        35
                                      )}
                                    </Link>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(
                                      classItem.startTime
                                    )}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    classItem.s3Link ===
                                      null ||
                                      classItem.s3Link ===
                                      'not found'
                                      ? 'text-warning border-warning'
                                      : classItem.s3Link &&
                                        classItem.attendanceStatus ===
                                        'absent'
                                        ? 'text-destructive border-destructive'
                                        : 'text-success border-success'
                                  }
                                >
                                  {classItem.s3Link ===
                                    null ||
                                    classItem.s3Link ===
                                    'not found'
                                    ? 'Processing'
                                    : classItem.s3Link &&
                                      classItem.attendanceStatus ===
                                      'absent'
                                      ? 'Absent'
                                      : 'Present'}{' '}
                                </Badge>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {classItem.s3Link ===
                                        null ||
                                        classItem.s3Link ===
                                        'not found' ? (
                                        <button
                                          disabled={
                                            classItem.s3Link ===
                                            null ||
                                            classItem.s3Link ===
                                            'not found'
                                          }
                                          onClick={() =>
                                            handleRecording(
                                              classItem.s3Link
                                            )
                                          }
                                          className="text-red-500  text-sm "
                                        >
                                          <Video className="w-4 h-4 " />
                                        </button>
                                      ) : (
                                        <button
                                          disabled={
                                            classItem.s3Link ===
                                            null ||
                                            classItem.s3Link ===
                                            'not found'
                                          }
                                          onClick={() =>
                                            handleRecording(
                                              classItem.s3Link
                                            )
                                          }
                                          className="text-primary  text-sm "
                                        >
                                          <Video className="w-4 h-4 " />
                                        </button>
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {classItem.s3Link ===
                                        null ||
                                        classItem.s3Link ===
                                        'not found' ? (
                                        <p>
                                          Recording
                                          not
                                          found
                                        </p>
                                      ) : (
                                        <p>
                                          Watch
                                          Recording
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )
                          )}
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
                          src="/emptyStates/undraw_not-found_6bgl.svg"
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


















// 'use client';
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import {
//   Video, BookOpen, FileText, Clock, Calendar, Users, Lock, Timer, User, Star, X, CalendarDays, ChevronRight,
//   Search,
//   CheckCircle2,
// } from "lucide-react";
// import Image from "next/image";
// import { useBootcampProgress } from '@/hooks/useBootcampProgress';
// import { useAllModulesForStudents } from '@/hooks/useAllModulesForStudents';
// import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
// import { MentorSessionEvent, UpcomingEvent } from '@/hooks/hookType';
// import { useCompletedClasses } from '@/hooks/useCompletedClasses';
// import { CompletedClass, Module } from '@/hooks/hookType';
// import { useLatestUpdatedCourse } from '@/hooks/useLatestUpdatedCourse';
// import { useMentors } from '@/hooks/useMentors';
// import TruncatedDescription from "@/app/student/_components/TruncatedDescription";
// import { ellipsis } from "@/lib/utils";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import useWindowSize from "@/hooks/useHeightWidth";
// import { useIsStudentEnrolledInOneCourseStore } from "@/store/store";
// import { ModuleContentCounts, TopicItem } from '@/app/student/_pages/pageStudentType'
// import { formatUpcomingItem } from "@/utils/students"
// import { CourseDashboardSkeleton, CourseDashboardEventsSkeleton } from '@/app/student/_components/Skeletons';
// import { cn } from "@/lib/utils";
// import Leaderboard from '@/components/Leaderboard';
// import { useLeaderboard } from '@/hooks/useLeaderboard';

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// type WhatsNextItem = UpcomingEvent | MentorSessionEvent;


// const CourseDashboard = ({ courseId }: { courseId: string }) => {
//   const searchParams = useSearchParams();
//   const orgId = searchParams.get('orgId');

//   const [showAllModules, setShowAllModules] = useState(false);
//   const { setIsStudentEnrolledInOneCourse } = useIsStudentEnrolledInOneCourseStore()
//   const { progressData, loading: progressLoading, error: progressError } = useBootcampProgress(courseId);
//   const { modules: apiModules, loading: modulesLoading, error: modulesError } = useAllModulesForStudents(courseId);
//   const { upcomingEventsData, loading: eventsLoading, error: eventsError } = useUpcomingEvents(courseId);
//   const { completedClassesData, loading: classesLoading, error: classesError } = useCompletedClasses(courseId);
//   const { latestCourseData, loading: latestCourseLoading, error: latestCourseError } = useLatestUpdatedCourse(courseId);
//   const { mentors: mentorshipMentors } = useMentors('', Boolean(latestCourseData?.mentorshipEnabled), 1000, 0);
//   const { topEntries: leaderboardEntries, selfEntry: leaderboardSelfEntry, isSelfInTopFive, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(courseId);
//   const { width } = useWindowSize();
//   const isMobile = width < 768;


//   const mentorshipSessionCount = upcomingEventsData?.mentorSessions?.length ?? 0;
//   const availableMentorCount = mentorshipMentors.filter(
//     (mentor) => mentor.availabilityStatus?.toLowerCase() === 'available'
//   ).length;

//   const QUICK_ACTIONS = [
//     {
//       label: "Find a Mentor",
//       sub: availableMentorCount > 0 ? `${availableMentorCount} mentor available now` : "No mentors available now",
//       href: `/student/mentors?courseId=${courseId}`,
//       icon: Search,
//       color: "text-primary",
//       bg: "bg-primary/10",
//     },
//     {
//       label: "My Sessions",
//       sub: `${mentorshipSessionCount} upcoming`,
//       href: `/student/sessions?courseId=${courseId}`,
//       icon: CalendarDays,
//       color: "text-accent",
//       bg: "bg-accent/10",
//     },
//   ];
  
//   useEffect(()=> {
//     setIsStudentEnrolledInOneCourse(false)
//   },[])


//   // Show loading skeleton while fetching essential API data (excluding events)
//   if (progressLoading || modulesLoading || classesLoading || latestCourseLoading) {
//     return (
//       <CourseDashboardSkeleton />
//     );
//   }


//   // Show error state if essential APIs fail (excluding events)
//   if (progressError || modulesError || classesError || latestCourseError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-heading font-bold mb-2">Failed to Load Course Data</h1>
//           <p className="text-muted-foreground mb-4">{progressError || modulesError || classesError || latestCourseError}</p>
//           <Button onClick={() => window.location.reload()}>
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }
//   // Use real progress data if available, otherwise fall back to mock data
//   const currentProgress = progressData?.data?.progress || 0;
//   const batchName = progressData?.batchInfo?.batchName || '';
//   const totalStudents = progressData?.batchInfo?.totalEnrolledStudents || 0;
//   const instructorName = progressData?.instructorDetails?.instructorName || '';
//   const instructorAvatar = progressData?.instructorDetails?.instructorProfilePicture || '';
//   const isValidImageUrl = (url: string) => {
//     if (!url) return false;
//     return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
//   };
//   const validInstructorAvatar = isValidImageUrl(instructorAvatar) ? instructorAvatar : '';
//   const courseName = progressData?.data?.bootcampTracking?.name || '';
//   const courseDescription = progressData?.data?.bootcampTracking?.description || '';
//   const courseCoverImage = progressData?.data?.bootcampTracking?.coverImage || '';
//   const validCourseCoverImage = isValidImageUrl(courseCoverImage) ? courseCoverImage : '/logo.PNG';
//   const collaborator = progressData?.data?.bootcampTracking?.collaborator || '';
//   const validCollaborator = isValidImageUrl(collaborator) ? collaborator : '';
//   const duration = progressData?.data?.bootcampTracking?.duration || 0;

//   // Use API modules if available, otherwise fall back to mock modules
//   const modulesToDisplay = apiModules || [];
//   const modulesToShow = showAllModules ? modulesToDisplay : modulesToDisplay.slice(0, 7);

//   const formatDate = (date: Date | string) => {
//     const dateObj = typeof date === 'string' ? new Date(date) : date;
//     return new Intl.DateTimeFormat('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true
//     }).format(dateObj);
//   };

//   const formatDateRange = () => {
//     const today = new Date();
//     const seventhDay = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

//     const formatOptions: Intl.DateTimeFormatOptions = {
//       month: 'short',
//       day: 'numeric'
//     };

//     return `From ${today.toLocaleDateString('en-US', formatOptions)} to ${seventhDay.toLocaleDateString('en-US', formatOptions)}`;
//   };

//   const getEventType = (type: string): 'Live Class' | 'Assessment' | 'Assignment' | 'Mentor Session' | 'unknown' => {
//     if (type.toLowerCase().includes('mentor session')) return 'Mentor Session';
//     if (type.toLowerCase().includes('class')) return 'Live Class';
//     if (type.toLowerCase().includes('assessment')) return 'Assessment';
//     if (type.toLowerCase().includes('assignment')) return 'Assignment';
//     return 'unknown';
//   }

//   const getItemIcon = (type: string) => {
//     switch (getEventType(type)) {
//       case 'Live Class': return <Video className="w-5 h-5 text-primary" />;
//       case 'Assessment': return <BookOpen className="w-5 h-5 text-warning" />;
//       case 'Assignment': return <FileText className="w-5 h-5 text-info" />;
//       case 'Mentor Session': return <Video className="w-5 h-5 text-primary" />;
//       default: return <Clock className="w-5 h-5 text-muted-foreground" />;
//     }
//   };

//   const getItemIconWithBackground = (type: string) => {
//     switch (getEventType(type)) {
//       case 'Live Class':
//         return (
//           <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
//             <Video className="w-5 h-5 text-primary" />
//           </div>
//         );
//       case 'Assessment':
//         return (
//           <div className="w-5 h-5 rounded-full bg-warning-light flex items-center justify-center">
//             <BookOpen className="w-5 h-5 text-warning" />
//           </div>
//         );
//       case 'Assignment':
//         return (
//           <div className="w-5 h-5 rounded-full bg-info-light flex items-center justify-center">
//             <FileText className="w-5 h-5 text-info" />
//           </div>
//         );
//       case 'Mentor Session':
//         return (
//           <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
//             <Video className="w-5 h-5 text-primary" />
//           </div>
//         );
//       default:
//         return (
//           <div className="w-5 h-5 rounded-full bg-muted-light flex items-center justify-center">
//             <Clock className="w-5 h-5 text-muted-foreground" />
//           </div>
//         );
//     }
//   };

//   const getTimeRemaining = (eventDate: string) => {
//     const now = new Date();
//     const eventTime = new Date(eventDate);
//     const timeDiff = eventTime.getTime() - now.getTime();

//     if (timeDiff <= 0) return "Event Started";

//     const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));


//     if (days > 0) {
//       const dayString = `${days} day${days > 1 ? 's' : ''}`;
//       const hourString = hours > 0 ? ` and ${hours} hour${hours > 1 ? 's' : ''}` : '';
//       return `Starts in ${dayString}${hourString}`;
//     }

//     if (hours > 0) {
//       const hourString = `${hours} hour${hours > 1 ? 's' : ''}`;
//       const minuteString = minutes > 0 ? ` and ${minutes} minute${minutes > 1 ? 's' : ''}` : '';
//       return `Starts in ${hourString}${minuteString}`;
//     }

//     if (minutes > 0) {
//       return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`;
//     }

//     return "Starting soon";
//   };

//   const canStartEvent = (eventDate: string) => {
//     return new Date(eventDate).getTime() <= new Date().getTime();
//   };

//   const parseDateValue = (value?: string | null) => {
//     if (!value) return null;

//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return null;

//     return date;
//   };

//   const isMentorSessionJoinWindowOpen = (
//     startTime?: string | null,
//     endTime?: string | null,
//     nowTimestamp: number = Date.now()
//   ) => {
//     const startDate = parseDateValue(startTime);
//     if (!startDate) return false;

//     const tenMinutesBeforeStart = startDate.getTime() - 10 * 60 * 1000;
//     const endDate = parseDateValue(endTime);

//     if (!endDate) {
//       return nowTimestamp >= tenMinutesBeforeStart;
//     }

//     return nowTimestamp >= tenMinutesBeforeStart && nowTimestamp <= endDate.getTime();
//   };

//   const getMentorSessionJoinHref = (item: MentorSessionEvent) => {
//     if (!item.meetingLink) return null;

//     return `/student/sessions/${item.id}/join?joinUrl=${encodeURIComponent(item.meetingLink)}`;
//   };

//   const getEventActionText = (type: string) => {
//     switch (getEventType(type)) {
//       case 'Live Class': return 'Join Class';
//       case 'Assessment': return 'Start Assessment';
//       case 'Assignment': return 'View Assignment';
//       case 'Mentor Session': return 'Join Session';
//       default: return 'View Event';
//     }
//   }

//   const isMentorSession = (item: WhatsNextItem): item is MentorSessionEvent => {
//     return getEventType(item.type) === 'Mentor Session';
//   };

//   const isRegularUpcomingEvent = (item: WhatsNextItem): item is UpcomingEvent => {
//     return !isMentorSession(item);
//   };

//   const mergedUpcomingItems: WhatsNextItem[] = [
//     ...(upcomingEventsData?.events || []),
//     ...(latestCourseData?.mentorshipEnabled ? (upcomingEventsData?.mentorSessions || []) : []),
//   ].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

//   const getModuleCTA = (module:Module , progress: number) => {
//     if (module.isLock) {
//       return "Module Locked";
//     } else if (progress === 0) {
//       return "Start Learning";
//     } else if (progress === 100) {
//       return "Revise Module";
//     } else {
//       return "Continue Learning";
//     }
//   };

//   const getModuleProgress = (module:Module) => {
//     return module.progress || 0;
//   };

//   const getModuleDescription = (module:Module) => {
//     return module.description || "Learn essential concepts and build practical skills.";
//   };

//   const getModuleHref = (module: Module, isCurrentModule: boolean, upcomingChapterId: number | null) => {
//     const chapterId = isCurrentModule ? upcomingChapterId : module.ChapterId;
//     return `/student/course/${courseId}/modules/${module.id}?chapterId=${chapterId}${orgId ? `&orgId=${orgId}` : ''}`;
//   };

//   const formatTimeAlloted = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const days = Math.floor(hours / 24);

//     if (days > 0) {
//       return `${days} day${days > 1 ? 's' : ''}`;
//     } else if (hours > 0) {
//       return `${hours} hour${hours > 1 ? 's' : ''}`;
//     } else {
//       return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''}`;
//     }
//   };

//   const getContentCount = (module: ModuleContentCounts) => {
//     const counts = [];
//     if (module.quizCount > 0) counts.push(`${module.quizCount} Quiz${module.quizCount > 1 ? 'zes' : ''}`);
//     if (module.assignmentCount > 0) counts.push(`${module.assignmentCount} Assignment${module.assignmentCount > 1 ? 's' : ''}`);
//     if (module.codingProblemsCount > 0) counts.push(`${module.codingProblemsCount} Coding Problem${module.codingProblemsCount > 1 ? 's' : ''}`);
//     if (module.articlesCount > 0) counts.push(`${module.articlesCount} Article${module.articlesCount > 1 ? 's' : ''}`);
//     if (module.formCount > 0) counts.push(`${module.formCount} Form${module.formCount > 1 ? 's' : ''}`);

//     return counts.join(' • ');
//   };

//   const AttendanceModal = ({ classes }: { classes: CompletedClass[] }) => (
//     <>
//       {/* Desktop Dialog */}
//       <div className="hidden lg:block">
//         <Dialog>
//           <DialogTrigger asChild>
//             {classes.length > 2 ? (
//               <Button
//                 variant="link"
//                 className="p-0 h-auto text-primary mx-auto"
//               >
//                 View Full Attendance({classes.length})
//               </Button>
//             ) : (
//               // if classes length is less than 2, don't show the button
//               <></>
//             )}
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="text-xl">
//                 Full Attendance Record{' '}
//               </DialogTitle>
//             </DialogHeader>
//             <div className="space-y-1">
//               {classes.map((classItem, index, array) => (
//                 <div key={classItem.id}>
//                   <div className="flex items-center justify-between py-4">
//                     <div className="flex-1 text-left">
//                       {classItem.moduleId === null ||
//                         classItem.chapterId == null ? (
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger className="text-left font-manrope text-lg  font-bold cursor-default underline-offset-[5px]">
//                               {classItem.title}
//                             </TooltipTrigger>
//                             <TooltipContent className=" text-left">
//                               The chapter isn’t
//                               included in the
//                               module yet,
//                               {(classItem.s3Link !==
//                                 null ||
//                                 classItem.s3Link !==
//                                 'not found') &&
//                                 'but you can still view the recording'}
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                       ) : (
//                         <Link
//                           className="w-fit font-manrope text-lg  font-bold hover:text-primary hover:underline underline-offset-[5px]"
//                           href={`/student/course/${courseId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}${orgId ? `&orgId=${orgId}` : ''}`}
//                         >
//                           {classItem.title}
//                         </Link>
//                       )}
//                       <p className="text-sm text-muted-foreground">
//                         {formatDate(
//                           classItem.startTime
//                         )}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-6">
//                       <Badge
//                         variant="outline"
//                         className={
//                           classItem.s3Link === null ||
//                             classItem.s3Link ===
//                             'not found'
//                             ? 'text-warning border-warning'
//                             : classItem.s3Link &&
//                               classItem.attendanceStatus ===
//                               'absent'
//                               ? 'text-destructive border-destructive'
//                               : 'text-success border-success'
//                         }
//                       >
//                         {classItem.s3Link === null ||
//                           classItem.s3Link === 'not found'
//                           ? 'Processing'
//                           : classItem.s3Link &&
//                             classItem.attendanceStatus ===
//                             'absent'
//                             ? 'Absent'
//                             : 'Present'}
//                       </Badge>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger>
//                             {classItem.s3Link ===
//                               null ||
//                               classItem.s3Link ===
//                               'not found' ? (
//                               <button
//                                 disabled={
//                                   classItem.s3Link ===
//                                   null ||
//                                   classItem.s3Link ===
//                                   'not found'
//                                 }
//                                 onClick={() =>
//                                   handleRecording(
//                                     classItem.s3Link
//                                   )
//                                 }
//                                 className="text-red-500    text-sm "
//                               >
//                                 <Video className="w-4 h-4 " />
//                               </button>
//                             ) : (
//                               <button
//                                 disabled={
//                                   classItem.s3Link ===
//                                   null ||
//                                   classItem.s3Link ===
//                                   'not found'
//                                 }
//                                 onClick={() =>
//                                   handleRecording(
//                                     classItem.s3Link
//                                   )
//                                 }
//                                 className="text-primary  text-sm "
//                               >
//                                 <Video className="w-4 h-4 " />
//                               </button>
//                             )}
//                           </TooltipTrigger>
//                           <TooltipContent className="mr-24">
//                             {classItem.s3Link ===
//                               null ||
//                               classItem.s3Link ===
//                               'not found' ? (
//                               <p>
//                                 Recording not
//                                 found
//                               </p>
//                             ) : (
//                               <p>
//                                 Watch Recording
//                               </p>
//                             )}
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </div>
//                   {index < array.length - 1 && (
//                     <div className="border-t border-border"></div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Mobile Sheet */}
//       <div className="lg:hidden">
//         <Sheet>
//           <SheetTrigger asChild>
//             {classes.length > 2 ? (
//               <Button
//                 variant="link"
//                 className="p-0 h-auto text-primary mx-auto"
//               >
//                 View Full Attendance({classes.length})
//               </Button>
//             ) : (
//               // if classes length is less than 2, don't show the button
//               <></>
//             )}
//           </SheetTrigger>
//           <SheetContent side="bottom" className="h-[80vh]">
//             <SheetHeader>
//               <SheetTitle className="text-xl text-left">
//                 Full Attendance Record
//               </SheetTitle>
//             </SheetHeader>
//             <div className="space-y-1  h-full overflow-y-scroll">
//               {classes.map((classItem, index, array) => (
//                 <div key={classItem.id}>
//                   <div className="flex items-center justify-between py-4">
//                     <div className="flex-1 text-left">
//                       {classItem.moduleId === null ||
//                         classItem.chapterId == null ? (
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger className="text-left font-manrope text-lg  font-bold cursor-default underline-offset-[5px]">
//                               {classItem.title}
//                             </TooltipTrigger>
//                             <TooltipContent className=" text-left">
//                               The chapter isn’t
//                               included in the
//                               module yet,
//                               {(classItem.s3Link !==
//                                 null ||
//                                 classItem.s3Link !==
//                                 'not found') &&
//                                 'but you can still view the recording'}
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                       ) : (
//                         <Link
//                           className="w-fit font-manrope text-lg  font-bold hover:text-primary hover:underline underline-offset-[5px]"
//                           href={`/student/course/${courseId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}${orgId ? `&orgId=${orgId}` : ''}`}
//                         >
//                           {classItem.title}
//                         </Link>
//                       )}
//                       <p className="text-sm text-muted-foreground">
//                         {formatDate(
//                           classItem.startTime
//                         )}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Badge
//                         variant="outline"
//                         className={
//                           classItem.s3Link === null ||
//                             classItem.s3Link ===
//                             'not found'
//                             ? 'text-warning border-warning'
//                             : classItem.s3Link &&
//                               classItem.attendanceStatus ===
//                               'absent'
//                               ? 'text-destructive border-destructive'
//                               : 'text-success border-success'
//                         }
//                       >
//                         {classItem.s3Link === null ||
//                           classItem.s3Link === 'not found'
//                           ? 'Processing'
//                           : classItem.s3Link &&
//                             classItem.attendanceStatus ===
//                             'absent'
//                             ? 'Absent'
//                             : 'Present'}{' '}
//                       </Badge>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger>
//                             {classItem.s3Link ===
//                               null ||
//                               classItem.s3Link ===
//                               'not found' ? (
//                               <button
//                                 disabled={
//                                   classItem.s3Link ===
//                                   null ||
//                                   classItem.s3Link ===
//                                   'not found'
//                                 }
//                                 onClick={() =>
//                                   handleRecording(
//                                     classItem.s3Link
//                                   )
//                                 }
//                                 className="text-red-500 bg-primary-light text-sm border-primary"
//                               >
//                                 <Video className="w-4 h-4 " />
//                               </button>
//                             ) : (
//                               <button
//                                 disabled={
//                                   classItem.s3Link ===
//                                   null ||
//                                   classItem.s3Link ===
//                                   'not found'
//                                 }
//                                 onClick={() =>
//                                   handleRecording(
//                                     classItem.s3Link
//                                   )
//                                 }
//                                 className="text-primary bg-primary-light text-sm border-primary"
//                               >
//                                 <Video className="w-4 h-4 " />
//                               </button>
//                             )}
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             {classItem.s3Link ===
//                               null ||
//                               classItem.s3Link ===
//                               'not found' ? (
//                               <p>
//                                 Recording not
//                                 found
//                               </p>
//                             ) : (
//                               <p>
//                                 Watch Recording
//                               </p>
//                             )}
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </div>
//                   {index < array.length - 1 && (
//                     <div className="border-t border-border"></div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </SheetContent>
//         </Sheet>
//       </div>
//     </>
//   )

//   const EventsModal = ({ events }: { events: WhatsNextItem[] }) => (
//     <>
//       {/* Desktop Dialog */}
//       <div className="hidden lg:block">
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button
//               variant="link"
//               className="p-0 h-auto text-primary mx-auto"
//             >
//               View All Upcoming Events({events.length})
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="text-xl">
//                 All Upcoming Events
//               </DialogTitle>
//             </DialogHeader>
//             <div className="space-y-1">
//               {events.map((item, index, array) => {
//                 const eventType = getEventType(item.type)
//                 const isEventReady = canStartEvent(
//                   item.eventDate
//                 )
//                 return (
//                   <div key={`${item.type}-${item.id}`}>
//                     <div className="flex items-start gap-4 py-4">
//                       <div className="flex-shrink-0 mt-1">
//                         {getItemIconWithBackground(
//                           item.type
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between gap-4 mb-2">
//                           <h4 className="font-medium text-base">
//                             {item.title}
//                           </h4>
//                         </div>
//                         {eventType === 'Mentor Session' && isMentorSession(item) && (
//                           <p className="text-sm text-muted-foreground mb-2 text-left">Mentor: {item.mentorName}</p>
//                         )}
//                         <div className="flex items-center justify-between mb-3">
//                           <p className="text-sm font-medium">
//                             {/* {eventType ===
//                                                             'Live Class' &&
//                                                             `Scheduled on ${formatDate(
//                                                                 item.eventDate
//                                                             )}`}
//                                                         {eventType ===
//                                                             'Assessment' &&
//                                                             `Starts on ${formatDate(
//                                                                 item.eventDate
//                                                             )}`}
//                                                         {eventType ===
//                                                             'Assignment' &&
//                                                             `Due on ${formatDate(
//                                                                 item.eventDate
//                                                             )}`} */}
//                             {formatUpcomingItem(item)}
//                           </p>
//                         </div>
//                         <div className="flex justify-end">
//                           {eventType === 'Live Class' && isRegularUpcomingEvent(item) ? (
//                             <Button
//                               size="sm"
//                               variant="link"
//                               disabled={!isEventReady}
//                               className="text-primary p-0 h-auto"
//                               onClick={() => window.open(item.hangoutLink || '', '_blank')}
//                             >
//                               {isEventReady
//                                 ? getEventActionText(
//                                   item.type
//                                 )
//                                 : getTimeRemaining(
//                                   item.eventDate
//                                 )}
//                             </Button>
//                           ) : eventType === 'Mentor Session' && isMentorSession(item) ? (
//                             (() => {
//                               const canJoinNow = isMentorSessionJoinWindowOpen(item.startTime, item.endTime)
//                               const joinHref = getMentorSessionJoinHref(item)

//                               if (canJoinNow && joinHref) {
//                                 return (
//                                   <Button asChild size="sm" variant="link" className="text-primary p-0 h-auto">
//                                     <Link href={joinHref} target="_blank" rel="noopener noreferrer">
//                                       {getEventActionText(item.type)}
//                                     </Link>
//                                   </Button>
//                                 )
//                               }

//                               return (
//                                 <div className="flex flex-col items-end gap-1">
//                                   <Button size="sm" variant="link" disabled className="text-primary p-0 h-auto">
//                                     Join Session
//                                   </Button>
//                                   <p className="text-xs text-muted-foreground text-right">
//                                     Join opens 10 minutes before start.
//                                   </p>
//                                 </div>
//                               )
//                             })()
//                           ) : isRegularUpcomingEvent(item) ? (
//                             <Link
//                               href={`/student/course/${courseId}/modules/${item.moduleId}?chapterId=${item.chapterId}${orgId ? `&orgId=${orgId}` : ''}`}
//                               className="text-primary text-sm font-medium hover:underline"
//                             >
//                               {isEventReady
//                                 ? getEventActionText(
//                                   item.type
//                                 )
//                                 : getTimeRemaining(
//                                   item.eventDate
//                                 )}
//                             </Link>
//                           ) : null}
//                         </div>
//                       </div>
//                     </div>
//                     {index < array.length - 1 && (
//                       <div className="border-t border-border"></div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Mobile Sheet */}
//       <div className="lg:hidden">
//         <Sheet>
//           <SheetTrigger asChild>
//             <Button variant="link" className="p-0 h-auto text-primary mx-auto">
//               View All Upcoming Events({events.length})
//             </Button>
//           </SheetTrigger>
//           <SheetContent side="bottom" className="h-[80vh]">
//             <SheetHeader>
//               <SheetTitle className="text-xl">All Upcoming Events</SheetTitle>
//             </SheetHeader>
//             <div className="space-y-1 mt-4 overflow-y-auto">
//               {events.map((item, index, array) => {
//                 const eventType = getEventType(item.type);
//                 const isEventReady = canStartEvent(item.eventDate);
//                 return (
//                   <div key={`${item.type}-${item.id}`}>
//                     <div className="flex items-start gap-4 py-4">
//                       <div className="flex-shrink-0 mt-1">
//                         {getItemIconWithBackground(item.type)}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between gap-4 mb-2">
//                           <h4 className="font-medium text-base">{item.title}</h4>
//                         </div>
//                         {eventType === 'Mentor Session' && isMentorSession(item) && (
//                           <p className="text-sm text-muted-foreground mb-2">Mentor: {item.mentorName}</p>
//                         )}
//                         <div className="flex items-center justify-between mb-3">
//                           <p className="text-sm font-medium">
//                             {eventType === 'Live Class' && `Scheduled on ${formatDate(item.eventDate)}`}
//                             {eventType === 'Assessment' && `Starts on ${formatDate(item.eventDate)}`}
//                             {eventType === 'Assignment' && `Due on ${formatDate(item.eventDate)}`}
//                             {eventType === 'Mentor Session' && `Scheduled on ${formatDate(item.eventDate)}`}
//                           </p>
//                         </div>
//                         <div className="flex justify-end">
//                           {eventType === 'Live Class' && isRegularUpcomingEvent(item) ? (
//                             <Button
//                               size="sm"
//                               variant="link"
//                               disabled={!isEventReady}
//                               className="text-primary p-0 h-auto"
//                               onClick={() => window.open(item.hangoutLink || '', '_blank')}
//                             >
//                               {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}
//                             </Button>
//                           ) : eventType === 'Mentor Session' && isMentorSession(item) ? (
//                             (() => {
//                               const canJoinNow = isMentorSessionJoinWindowOpen(item.startTime, item.endTime)
//                               const joinHref = getMentorSessionJoinHref(item)

//                               if (canJoinNow && joinHref) {
//                                 return (
//                                   <Button asChild size="sm" variant="link" className="text-primary p-0 h-auto">
//                                     <Link href={joinHref} target="_blank" rel="noopener noreferrer">
//                                       {getEventActionText(item.type)}
//                                     </Link>
//                                   </Button>
//                                 )
//                               }

//                               return (
//                                 <div className="flex flex-col items-end gap-1">
//                                   <Button size="sm" variant="link" disabled className="text-primary p-0 h-auto">
//                                     Join Session
//                                   </Button>
//                                   <p className="text-xs text-muted-foreground text-right">
//                                     Join opens 10 minutes before start.
//                                   </p>
//                                 </div>
//                               )
//                             })()
//                           ) : isRegularUpcomingEvent(item) ? (
//                             <Link
//                               href={`/student/course/${courseId}/modules/${item.moduleId}?chapterId=${item.chapterId}${orgId ? `&orgId=${orgId}` : ''}`}
//                               className="text-primary text-sm font-medium hover:underline"
//                             >
//                               {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}
//                             </Link>
//                           ) : null}
//                         </div>
//                       </div>
//                     </div>
//                     {index < array.length - 1 && <div className="border-t border-border"></div>}
//                   </div>
//                 );
//               })}
//             </div>
//           </SheetContent>
//         </Sheet>
//       </div>
//     </>
//   );
//   const handleRecording = (s3Link: string) => {
//     if (s3Link) {
//       window.open(s3Link, '_blank');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-[88rem] mx-auto px-4 md:px-6 pt-4 pb-8">
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(260px,1fr)] lg:items-start">
//             {/* Left Column - Stats and Course Modules */}
//             <div className="space-y-6 min-w-0">
//               <div className="w-full rounded-lg border bg-white p-4 md:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
//                 <div className="hidden md:flex flex-col md:flex-row items-start gap-6 mb-0">
//                   <div className="flex-shrink-0">
//                     <Image
//                       src={validCourseCoverImage}
//                       alt={courseName}
//                       width={128}
//                       height={128}
//                       className="rounded-lg object-contain"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="flex-1">
//                         <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-left">{courseName}</h1>
//                         <TruncatedDescription text={courseDescription} maxLength={250} className="text-base md:text-lg text-muted-foreground mb-4 text-left" />
//                         <div className="flex items-center gap-2 mb-4">
//                           {/* <Avatar className="w-8 h-8">
//                           <AvatarImage src={validInstructorAvatar || '/logo.PNG'} />
//                           <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
//                         </Avatar> */}
//                           <span className="font-medium capitalize text-sm ">Instructor:- {instructorName}</span>
//                         </div>
//                       </div>
//                       {validCollaborator ? <div className="flex items-center gap-2">
//                           <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
//                           <Image
//                             src={validCollaborator}
//                             alt="Collaborator Brand"
//                             width={75}
//                             height={56}
//                             className="h-12"
//                           />
//                         </div> : collaborator ?
//                         <div className="flex  items-center gap-2">
//                           <p className="text-sm font-bold text-muted-foreground ">In Collaboration With</p>
//                           <p className="text-sm font-bold text-primary">{collaborator}</p>
//                         </div> : ''}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="md:hidden mb-0">
//                   <Image
//                     src={validCourseCoverImage}
//                     alt={courseName}
//                     width={400}
//                     height={160}
//                     className="w-full h-40 rounded-lg object-cover mb-4"
//                   />
//                   <h1 className="text-2xl font-heading font-bold mb-2 text-left">{courseName}</h1>
//                   <TruncatedDescription text={courseDescription} maxLength={150} className="text-base text-muted-foreground mb-4 text-left" />
//                   <div className="flex items-center gap-2 mb-4">
//                     {/* <Avatar className="w-8 h-8">
//                       <AvatarImage src={validInstructorAvatar || '/logo.PNG'} />
//                       <AvatarFallback>{instructorName ? instructorName[0] : 'U'}</AvatarFallback>
//                     </Avatar> */}
//                     <span className="font-medium capitalize text-sm ">Instructor:- {instructorName}</span>
//                   </div>
//                   {validCollaborator && <div className="flex items-center gap-2 mb-4">
//                       <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
//                       <Image
//                         src={validCollaborator}
//                         alt="Collaborator Brand"
//                         width={48}
//                         height={48}
//                         className="h-12"
//                       />
//                     </div>}
//                 </div>
//               </div>

//               <div className="w-full rounded-lg bg-white p-4 md:p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3 w-full">
//                     <div className="relative bg-primary-light rounded-full h-1.5 flex-1">
//                       <div
//                         className="bg-primary h-1.5 rounded-full transition-all duration-300"
//                         style={{ width: `${currentProgress}%` }}
//                       />
//                     </div>

//                     <span className="w-10 text-right text-xs font-semibold text-foreground/70">
//                       {currentProgress}%
//                     </span>
//                   </div>

//                   <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
//                     <div className="flex items-center gap-2.5 text-foreground/80">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
//                         <BookOpen size={16} className="text-foreground/60" />
//                       </div>
//                       <div>
//                         <div className="text-[11px] leading-4 text-muted-foreground text-left">Batch</div>
//                         <div className="text-sm font-semibold leading-5">{batchName}</div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2.5 text-foreground/80">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
//                         <Users size={16} className="text-foreground/60" />
//                       </div>
//                       <div>
//                         <div className="text-[11px] leading-4 text-muted-foreground text-left">Students</div>
//                         <div className="text-sm font-semibold leading-5">{totalStudents} enrolled</div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2.5 text-foreground/80">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
//                         <Clock size={16} className="text-foreground/60" />
//                       </div>
//                       <div>
//                         <div className="text-[11px] leading-4 text-muted-foreground text-left">Duration</div>
//                         <div className="text-sm font-semibold leading-5">{(+duration) > 1 ? `${duration} weeks` : `${duration} week`}</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Course Modules Section */}
//               <div className="w-full">
//                 <h2 className="text-xl font-heading font-semibold mb-4 text-left">Course Content</h2>

//                 <div className="space-y-4">
//                   {modulesToShow.length > 0 ? modulesToShow.map((module: Module) => {
//                     const moduleProgress = getModuleProgress(module);
//                     const isCurrentModule = latestCourseData?.moduleId === module.id;
//                     const isCompleted = moduleProgress === 100;
//                     const isLocked = module.isLock;
//                     const upcomingChapterId = latestCourseData?.newChapter?.id || 1;

//                     return (
//                       <Card key={module.id} className={`w-full rounded-lg border p-0 transition-all duration-300 my-3 ${isCurrentModule ? 'border-2 border-primary' : ''} ${isLocked ? 'opacity-60' : ''} ${!isLocked ? 'cursor-pointer hover:shadow-8dp transition-shadow' : 'cursor-not-allowed'} min-h-[166px]`}>
//                         <CardContent className={`flex h-full flex-col p-4 md:p-4 ${isLocked ? ' cursor-not-allowed' : ''}`}>
//                           <div className="flex flex-1 flex-col lg:flex-row lg:justify-between lg:items-start gap-3 min-w-0">
//                             <div className="flex-1 min-w-0 text-left">
//                               {isCurrentModule && (
//                                 <Badge className="mb-2 self-start rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary dark:text-white border-primary/20 hover:bg-primary-light/80">Current Module</Badge>
//                               )}
//                               {isCompleted && (
//                                 <Badge className="mb-2 self-start rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold tracking-wide text-success border-success/20 hover:bg-success-light/80">Completed</Badge>
//                               )}
//                               {/* {isLocked && (
//                                   <Badge className="mb-2 bg-muted text-muted-foreground border-muted/20 self-start flex items-center gap-1">
//                                     <Lock className="w-3 h-3" />
//                                     Locked
//                                   </Badge>
//                                 )} */}
//                               <h3 className="text-sm md:text-[1rem] font-heading font-semibold mb-2 leading-tight text-left">
//                                 {module.typeId === 2 ? 'Project' : 'Module'}  {module.order}: {module.name}
//                               </h3>
//                               <TruncatedDescription text={getModuleDescription(module)} maxLength={150} className="mb-2 text-sm leading-6 text-muted-foreground text-left" />
//                               {/* <div className="flex flex-wrap gap-2 mb-3">
//                                 <Badge variant="outline" className="text-xs">
//                                   {formatTimeAlloted(module.timeAlloted)}
//                                 </Badge>
//                                 {getContentCount(module) && (
//                                   <Badge variant="outline" className="text-xs">
//                                     {getContentCount(module)}
//                                   </Badge>
//                                 )}
//                               </div> */}
//                               {module.typeId === 2 && <span className="text-sm text-muted-foreground" >Due: January 20, 2025</span>}
//                             </div>

//                             {/* Action Button - Desktop: top right, Mobile: bottom */}
//                             {!isMobile && (
//                               <TooltipProvider>
//                                 <Tooltip>
//                                   <TooltipTrigger asChild>
//                                     <div className="lg:self-start lg:pt-1">

//                                       <Button
//                                         className={`h-9 px-4 text-sm font-semibold bg- hover:text-white  ${(isLocked || (module.typeId !== 2 && !module.ChapterId)) ? 'text-muted-foreground cursor-not-allowed' : ` text-primary hover:underline hover:underline-offset-4 ${isCurrentModule ? 'border-2 border-primary bg-primary text-white hover:no-underline  ' : ''} `}`}
//                                         disabled={isLocked || (module.typeId !== 2 && !module.ChapterId)}
//                                         onClick={(e) => {
//                                           if (isLocked || (module.typeId !== 2 && !module.ChapterId)) {
//                                             e.preventDefault();
//                                           }
//                                         }}
//                                       >
//                                         {module.typeId !== 2 ? <Link key={module.id} className="" href={getModuleHref(module, isCurrentModule, upcomingChapterId)}>
//                                           {getModuleCTA(module, moduleProgress)}
//                                         </Link> : <Link href={`/student/course/${courseId}/projects?moduleId=${module.id}&projectId=${module.projectId}&orgId=${orgId}`} className={`${isCurrentModule ? 'text-white' : ''} text-sm  hover:underline`} >View Project</Link>}
//                                       </Button>
//                                     </div>
//                                   </TooltipTrigger>
//                                   {!module.ChapterId && module.typeId !== 2 && (
//                                     <TooltipContent className="font-semibold" >
//                                       <p>No chapter is created inside this module yet</p>
//                                     </TooltipContent>
//                                   )}
//                                 </Tooltip>
//                               </TooltipProvider>
//                             )}
//                           </div>

//                           {/* Module Progress - Updated with primary-light background */}
//                           {module.typeId !== 2 && <div className="mt-auto pt-3 mb-0">
//                             <div className="relative bg-primary-light rounded-full h-1.5 w-full">
//                               <div
//                                 className={`h-1.5 rounded-full transition-all duration-300 relative ${isLocked ? 'bg-muted' : 'bg-primary'}`}
//                                 style={{ width: `${moduleProgress}%` }}
//                               >
//                                 <div
//                                   className="absolute top-1/2 transform -translate-y-1/2 bg-card text-card-foreground px-1.5 py-0.5 rounded shadow-sm border text-[10px] font-medium whitespace-nowrap"
//                                   style={{
//                                     right: moduleProgress === 100 ? '0' : moduleProgress === 0 ? 'auto' : '-12px',
//                                     left: moduleProgress === 0 ? '0' : 'auto'
//                                   }}
//                                 >
//                                   {moduleProgress}%
//                                 </div>
//                               </div>
//                             </div>
//                           </div>}

//                           {/* A
                          
//                           tion Button - Mobile: bottom */}
//                           {isMobile && (
//                             <TooltipProvider>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <div className="mt-2">

//                                     <Button
//                                       className={`h-9 px-4 mb-0 font-semibold bg- ${(isLocked || (module.typeId !== 2 && !module.ChapterId)) ? 'text-muted-foreground cursor-not-allowed' : ` text-primary hover:underline  ${isCurrentModule ? 'border-2 border-primary bg-primary text-white hover:no-underline w-full' : ''} `}`}
//                                       disabled={isLocked || (module.typeId !== 2 && !module.ChapterId)}
//                                       onClick={(e) => {
//                                         if (isLocked || (module.typeId !== 2 && !module.ChapterId)) {
//                                           e.preventDefault();
//                                         }
//                                       }}
//                                     >
//                                       {module.typeId !== 2 ? <Link key={module.id} href={getModuleHref(module, isCurrentModule, upcomingChapterId)}>
//                                         {getModuleCTA(module, moduleProgress)}
//                                       </Link> : <Link href={`/student/course/${courseId}/projects?moduleId=${module.id}&projectId=${module.projectId}&orgId=${orgId}`} className={` text-sm  text-primary hover:underline`} >View Project</Link>}
//                                     </Button>
//                                   </div>
//                                 </TooltipTrigger>
//                                 {!module.ChapterId && module.typeId !== 2 && (
//                                   <TooltipContent className="font-semibold" >
//                                     <p>No chapter is created inside this module yet</p>
//                                   </TooltipContent>
//                                 )}
//                               </Tooltip>
//                             </TooltipProvider>
//                           )}
//                         </CardContent>
//                       </Card>

//                     );
//                   }) :
//                     <div className="mb-6 text-left flex flex-col justify-end w-full items-center">
//                       <Image
//                         src="/emptyStates/greendog.svg"
//                         alt="No upcoming events"
//                         width={50}
//                         height={50}
//                         className="w-1/2 h-auto opacity-80"
//                       />
//                       <h3 className="text-lg text-left w-full font-semibold text-muted-foreground">
//                         No Modules Found
//                       </h3>
//                       <p className="text-sm text-left w-full text-muted-foreground leading-relaxed">
//                         No modules created for this course yet, Please check back later.
//                       </p>

//                     </div>}

//                   {modulesToDisplay.length > 7 && !showAllModules && (
//                     <div className="flex justify-center">
//                       <Button
//                         variant="link"
//                         onClick={() => setShowAllModules(true)}
//                         className="text-primary hover:text-primary-dark"
//                       >
//                         Show More Modules
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Mentorship */}
//             <div className="space-y-4 min-w-0 w-full lg:max-w-[300px] lg:justify-self-end">
//               {latestCourseData?.mentorshipEnabled && (
//                 // <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3 text-left shadow-sm">
//                 //   <div className="-mx-4 mb-3 flex items-center justify-between border-b border-gray-200 px-4 pb-3">
//                 //     <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-primary">Mentorship</p>
//                 //   </div>
//                 //   <div>
//                 //   </div>
//                 //   {QUICK_ACTIONS.map((a) => (
//                 //     <Link
//                 //       key={a.href}
//                 //       href={a.href}
//                 //       className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors group"
//                 //     >
//                 //       <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", a.bg)}>
//                 //         <a.icon className={cn("h-3.5 w-3.5", a.color)} />
//                 //       </div>
//                 //       <div className="flex-1 min-w-0">
//                 //         <p className="text-sm font-semibold leading-5 text-text-primary">{a.label}</p>
//                 //         <p className="text-xs leading-4 text-text-muted">{a.sub}</p>
//                 //       </div>
//                 //       <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-text-secondary" />
//                 //     </Link>
//                 //   ))}
//                 // </div>
//                 <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3 text-left shadow-sm">
//                     <div className="-mx-4 mb-3 flex items-center justify-between border-b border-gray-200 px-4 pb-3">
//                       <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-primary">
//                         Mentorship
//                       </p>
//                     </div>

//                     {QUICK_ACTIONS.map((a) => (
//                       <Link
//                         key={a.href}
//                         href={a.href}
//                         className="group flex items-center gap-3 rounded-xl border border-[#E7ECE8] bg-white px-3 py-3 transition-all duration-200 hover:border-[#CFE5D3] hover:bg-[#F4FBF5]"
//                       >
//                         {/* Icon */}
//                         <div
//                           className={cn(
//                             "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF7F0] transition-colors duration-200 group-hover:bg-[#DDF3E2]"
//                           )}
//                         >
//                           <a.icon className="h-4 w-4 text-[#2F6F3E]" />
//                         </div>

//                         {/* Text */}
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-semibold leading-5 text-[#1F2937]">
//                             {a.label}
//                           </p>

//                           <p className="text-xs leading-4 text-[#6B7280]">
//                             {a.sub}
//                           </p>
//                         </div>

//                         {/* Arrow */}
//                         <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF] transition-all duration-200 group-hover:text-[#2F6F3E]" />
//                       </Link>
//                     ))}
//                   </div>
//               )}

//               {/* What's Next Section */}
//               <Card className="w-full shadow-4dp text-left rounded-lg bg-white border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-lg font-semibold">What&apos;s Next?</CardTitle>
//                   {/* <p className="text-sm text-muted-foreground">
//                     {formatDateRange()}
//                   </p> */}
//                 </CardHeader>
//                 <CardContent className="pt-0">
//                   {eventsLoading ? (
//                     <CourseDashboardEventsSkeleton/>
//                   ) : mergedUpcomingItems.length > 0 ? (
//                     <div className="space-y-4">
//                       {mergedUpcomingItems.slice(0, 3).map((item: WhatsNextItem, index: number) => {
//                         const eventType = getEventType(item.type);
//                         const isEventReady = canStartEvent(item.eventDate);

//                         return (
//                           <div key={`${item.type}-${item.id}`}>
//                             <div className="flex items-start gap-4">
//                               <div className="flex-shrink-0 mt-1">
//                                 {getItemIconWithBackground(item.type)}
//                               </div>
//                               <div className="flex-1">
//                                 <div className="flex items-start justify-between gap-4 mb-2">
//                                   <h4 className="font-medium text-base hover:text-primary hover:underline underline-offset-[4px]">
//                                     {eventType === 'Mentor Session' ? (
//                                       <Link
//                                         href={`/student/sessions?courseId=${courseId}`}
//                                         target="_self"
//                                         className="hover:text-primary hover:underline underline-offset-[4px]"
//                                       >
//                                         {item.title}
//                                       </Link>
//                                     ) : isRegularUpcomingEvent(item) ? (
//                                       <Link
//                                         href={`/student/course/${courseId}/modules/${item.moduleId}?chapterId=${item.chapterId}${orgId ? `&orgId=${orgId}` : ''}`}
//                                         target="_self"
//                                         className="hover:text-primary hover:underline underline-offset-[4px]"
//                                       >
//                                         {item.title}
//                                       </Link>
//                                     ) : null}
//                                   </h4>
//                                 </div>
//                                 {eventType === 'Mentor Session' && isMentorSession(item) && (
//                                   <p className="text-sm text-muted-foreground mb-2">Mentor: {item.mentorName}</p>
//                                 )}
//                                 <Badge className={`my-2 hover:text-white ${item.type === 'Live Class' || item.type === 'Mentor Session' ? 'bg-primary-light text-primary border-primary/20 ' : item.type === 'Assessment' ? 'bg-warning-light text-warning border-warning/20 hover:bg-warning' : 'bg-info-light text-info border-info/20 hover:bg-info'} `} >{item.type}</Badge>
//                                 <div className="flex items-center justify-between mb-3">
//                                   <p className="text-sm font-medium">
//                                     {eventType === 'Mentor Session' && isMentorSession(item)
//                                       ? 'Join Session'
//                                       : formatUpcomingItem(item)}
//                                   </p>
//                                 </div>
//                                 {/* CTA - Bottom right */}
//                                 {eventType === 'Live Class' && isRegularUpcomingEvent(item) && (
//                                   <div className="flex justify-end">
//                                     <Button
//                                       size="sm"
//                                       variant="link"
//                                       disabled={!isEventReady}
//                                       className="text-primary p-0 h-auto"
//                                       onClick={() => window.open(item.hangoutLink || '', '_blank')}
//                                     >
//                                       {isEventReady ? getEventActionText(item.type) : getTimeRemaining(item.eventDate)}

//                                       {item.status === 'ongoing' && <span className="w-2 h-2 ml-1 inline-block bg-green-500 animate-pulse rounded-full" />}
//                                     </Button>
//                                   </div>
//                                 )}
//                                 {eventType === 'Mentor Session' && isMentorSession(item) && (() => {
//                                   const canJoinNow = isMentorSessionJoinWindowOpen(item.startTime, item.endTime)
//                                   const joinHref = getMentorSessionJoinHref(item)

//                                   return (
//                                     <div className="flex flex-col items-end gap-1">
//                                       {canJoinNow && joinHref ? (
//                                         <Button asChild size="sm" variant="link" className="text-primary p-0 h-auto">
//                                           <Link href={joinHref} target="_blank" rel="noopener noreferrer">
//                                             {getEventActionText(item.type)}
//                                           </Link>
//                                         </Button>
//                                       ) : (
//                                         <Button size="sm" variant="link" disabled className="text-primary p-0 h-auto">
//                                           Join Session
//                                         </Button>
//                                       )}
//                                       {!canJoinNow && (
//                                         <p className="text-xs text-muted-foreground text-right">
//                                           Join opens 10 minutes before start.
//                                         </p>
//                                       )}
//                                     </div>
//                                   )
//                                 })()}
//                               </div>
//                             </div>
//                             {index < mergedUpcomingItems.slice(0, 3).length - 1 && (
//                               <div className="border-t border-border mt-4"></div>
//                             )}
//                           </div>
//                         )
//                       })}

//                       {/* View All Events Button - Only show if there are more than 3 events */}
//                       {mergedUpcomingItems.length > 3 && (
//                         <div className="flex justify-center pt-4">
//                           <EventsModal events={mergedUpcomingItems} />
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center py-12  mr-3">
//                       {/* Illustration */}
//                       <div className="mb-6 max-w-[200px] w-full">
//                         <Image
//                           src="/emptyStates/whatsnext.svg"
//                           alt="No upcoming events"
//                           width={200}
//                           height={120}
//                           className="w-full h-auto opacity-80"
//                         />
//                       </div>

//                       {/* Content */}
//                       <div className="text-left w-full max-w-[220px] space-y-2.5 ">
//                         <h3 className="text-lg font-semibold text-muted-foreground">
//                           No Upcoming Events
//                         </h3>
//                         <p className="text-sm text-muted-foreground leading-relaxed">
//                           Stay tuned! Your upcoming assignments, live sessions, and deadlines will appear here to help you stay on track.
//                         </p>

//                         {/* Optional CTA */}
//                         <div className="pt-2">
//                           <p className="text-xs text-left w-full text-muted-foreground flex  gap-1">
//                             <Calendar className="w-3 h-3" />
//                             Check back later for updates
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {latestCourseData?.leaderboardEnabled && (
//                 <Card className="w-full shadow-4dp text-left rounded-lg bg-white border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
//                   <CardHeader className="pb-3">
//                     <CardTitle className="text-xl">Leaderboard</CardTitle>
//                   </CardHeader>
//                   <CardContent className="pt-0">
//                     <div className="space-y-4">
//                       <Leaderboard
//                         entries={leaderboardEntries}
//                         loading={leaderboardLoading}
//                         error={leaderboardError}
//                         selfEntry={leaderboardSelfEntry}
//                         showSelfEntry={!isSelfInTopFive}
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Attendance */}
//               <Card className="w-full text-left rounded-lg border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-xl">Attendance</CardTitle>
//                 </CardHeader>
//                 <CardContent className="pt-0">
//                   {(completedClassesData?.classes || []).length > 0 ? (
//                     <>
//                       <div className="text-center mb-6">
//                         <div className="text-3xl font-bold text-primary mb-2">
//                           {completedClassesData?.attendanceStats?.attendancePercentage || 0}%
//                         </div>
//                         <p className="text-sm text-muted-foreground">
//                           {completedClassesData?.attendanceStats?.presentCount || 0} of {completedClassesData?.totalClasses || 0} classes attended
//                         </p>
//                       </div>

//                       <div className="space-y-4 mb-6">
//                         <h4 className="font-medium text-sm">
//                           Recent Classes
//                         </h4>
//                         {(
//                           completedClassesData?.classes ||
//                           []
//                         )
//                           .slice(0, 4)
//                           .map(
//                             (
//                               classItem: CompletedClass
//                             ) => (
//                               <div
//                                 key={
//                                   classItem.id
//                                 }
//                                 className="flex items-center justify-between gap-4"
//                               >
//                                 {/* <div className="flex-1 text-left">
//                                                                     <Link
//                                                                         className=" hover:text-primary"
//                                                                         href={`/student/course/${courseId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}`}
//                                                                     >
//                                                                         <p className="font-medium text-sm ">
//                                                                             {ellipsis(
//                                                                                 classItem.title,
//                                                                                 35
//                                                                             )}
//                                                                         </p>
//                                                                         <p className="text-xs text-muted-foreground">
//                                                                             {formatDate(
//                                                                                 classItem.startTime
//                                                                             )}
//                                                                         </p>
//                                                                     </Link>
//                                                                 </div> */}
//                                 <div className="flex-1 text-left">
//                                   {classItem.moduleId ===
//                                     null ||
//                                     classItem.chapterId ==
//                                     null ? (
//                                     <TooltipProvider>
//                                       <Tooltip>
//                                         <TooltipTrigger className="text-left font-manrope text-sm cursor-default underline-offset-[5px]">
//                                           {
//                                             classItem.title
//                                           }
//                                         </TooltipTrigger>
//                                         <TooltipContent className="w-1/3 ml-96 text-left">
//                                           The
//                                           chapter
//                                           isn’t
//                                           included
//                                           in
//                                           the
//                                           module
//                                           yet,
//                                           {(classItem.s3Link !==
//                                             null ||
//                                             classItem.s3Link !==
//                                             'not found') &&
//                                             'but you can still view the recording'}
//                                         </TooltipContent>
//                                       </Tooltip>
//                                     </TooltipProvider>
//                                   ) : (
//                                     <Link
//                                       className="w-fit font-manrope text-sm  hover:text-primary hover:underline underline-offset-[5px]"
//                                       href={`/student/course/${courseId}/modules/${classItem.moduleId}?chapterId=${classItem.chapterId}${orgId ? `&orgId=${orgId}` : ''}`}
//                                     >
//                                       {ellipsis(
//                                         classItem.title,
//                                         35
//                                       )}
//                                     </Link>
//                                   )}
//                                   <p className="text-sm text-muted-foreground">
//                                     {formatDate(
//                                       classItem.startTime
//                                     )}
//                                   </p>
//                                 </div>
//                                 <Badge
//                                   variant="outline"
//                                   className={
//                                     classItem.s3Link ===
//                                       null ||
//                                       classItem.s3Link ===
//                                       'not found'
//                                       ? 'text-warning border-warning'
//                                       : classItem.s3Link &&
//                                         classItem.attendanceStatus ===
//                                         'absent'
//                                         ? 'text-destructive border-destructive'
//                                         : 'text-success border-success'
//                                   }
//                                 >
//                                   {classItem.s3Link ===
//                                     null ||
//                                     classItem.s3Link ===
//                                     'not found'
//                                     ? 'Processing'
//                                     : classItem.s3Link &&
//                                       classItem.attendanceStatus ===
//                                       'absent'
//                                       ? 'Absent'
//                                       : 'Present'}{' '}
//                                 </Badge>
//                                 <TooltipProvider>
//                                   <Tooltip>
//                                     <TooltipTrigger>
//                                       {classItem.s3Link ===
//                                         null ||
//                                         classItem.s3Link ===
//                                         'not found' ? (
//                                         <button
//                                           disabled={
//                                             classItem.s3Link ===
//                                             null ||
//                                             classItem.s3Link ===
//                                             'not found'
//                                           }
//                                           onClick={() =>
//                                             handleRecording(
//                                               classItem.s3Link
//                                             )
//                                           }
//                                           className="text-red-500  text-sm "
//                                         >
//                                           <Video className="w-4 h-4 " />
//                                         </button>
//                                       ) : (
//                                         <button
//                                           disabled={
//                                             classItem.s3Link ===
//                                             null ||
//                                             classItem.s3Link ===
//                                             'not found'
//                                           }
//                                           onClick={() =>
//                                             handleRecording(
//                                               classItem.s3Link
//                                             )
//                                           }
//                                           className="text-primary  text-sm "
//                                         >
//                                           <Video className="w-4 h-4 " />
//                                         </button>
//                                       )}
//                                     </TooltipTrigger>
//                                     <TooltipContent>
//                                       {classItem.s3Link ===
//                                         null ||
//                                         classItem.s3Link ===
//                                         'not found' ? (
//                                         <p>
//                                           Recording
//                                           not
//                                           found
//                                         </p>
//                                       ) : (
//                                         <p>
//                                           Watch
//                                           Recording
//                                         </p>
//                                       )}
//                                     </TooltipContent>
//                                   </Tooltip>
//                                 </TooltipProvider>
//                               </div>
//                             )
//                           )}
//                       </div>

//                       <div className="flex justify-center">
//                         <AttendanceModal classes={completedClassesData?.classes || []} />
//                       </div>
//                     </>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center py-12  mr-3">
//                       {/* Illustration */}
//                       <div className="mb-6 max-w-[200px] w-full">
//                         <Image
//                           src="/emptyStates/undraw_not-found_6bgl.svg"
//                           alt="No classes attended"
//                           width={200}
//                           height={120}
//                           className="w-full h-auto opacity-80"
//                         />
//                       </div>

//                       {/* Content */}
//                       <div className="text-left w-6/7 space-y-3 ">
//                         <h3 className="text-lg font-semibold text-muted-foreground">
//                           Classes are yet to start
//                         </h3>
//                         <p className="text-sm text-muted-foreground leading-relaxed">
//                           Your attendance record will appear here once you start attending live classes. Stay engaged to track your progress!
//                         </p>

//                         {/* Optional CTA */}
//                         <div className="pt-2">
//                           <p className="text-xs text-left w-full text-muted-foreground flex  gap-1">
//                             <Calendar className="w-3 h-3" />
//                             Check back after your first class
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//     </div>
//   );
// };

// export default CourseDashboard;
