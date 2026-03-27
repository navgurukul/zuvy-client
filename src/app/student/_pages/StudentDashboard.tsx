'use client';
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Play, RotateCcw, CheckCircle, Video, FileText, BookOpen, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useIsStudentEnrolledInOneCourseStore, useLazyLoadedStudentData } from '@/store/store';
import TruncatedDescription from "@/app/student/_components/TruncatedDescription";
import { useStudentData } from "@/hooks/useStudentData";
import { useFetchGlobalCourses } from "@/hooks/useFetchGlobalCourses";
import useEnrollCourse from "@/hooks/useEnrollCourse";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Bootcamp } from '@/app/student/_pages/pageStudentType';
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { formatUpcomingItem } from "@/utils/students";
import { StudentDashboardSkeleton, CarouselSkeleton } from "@/app/student/_components/Skeletons";
import useLearnerProfileStrength from "../../../hooks/useLearnerProfileStrength";
import useLearnerProfile from "@/hooks/useLearnerProfile";

const StudentDashboard = () => {
  const [filter, setFilter] = useState<'enrolled' | 'completed'>('enrolled');
  const [enrollingBootcampId, setEnrollingBootcampId] = useState<number | null>(null);
  const { studentData, loading, error, refetch } = useStudentData();
  
  // ✅ Fix: Use correct property name 'globalCourses'
  const { globalCourses, loading: globalLoading, error: globalError, refetch: refetchGlobalCourses } = useFetchGlobalCourses();
  
  const { enrollCourse, isEnrolling, error: enrollError } = useEnrollCourse();
  const { upcomingEventsData, loading: eventsLoading } = useUpcomingEvents();
  const { strengthPercentage, strengthLevel, strengthMessage } = useLearnerProfileStrength();
  const { refetchLearnerProfile } = useLearnerProfile(false);
  const access_token = localStorage.getItem('access_token');
  const { studentData: studentProfile } = useLazyLoadedStudentData();
  const { isStudentEnrolledInOneCourse } = useIsStudentEnrolledInOneCourseStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stayOnDashboard = searchParams.get('stay') === 'dashboard';

  const filteredBootcamps = filter === 'enrolled'
    ? studentData?.inProgressBootcamps || []
    : studentData?.completedBootcamps || [];

  const isStudentEnroledInOneBootcamp = studentData?.inProgressBootcamps?.length === 1;
  const displayProgress = strengthPercentage ?? 0;

  useEffect(() => {
    if (!stayOnDashboard && isStudentEnroledInOneBootcamp && isStudentEnrolledInOneCourse) {
      router.push(`/student/course/${studentData?.inProgressBootcamps[0].id}`);
    }
  }, [isStudentEnroledInOneBootcamp, isStudentEnrolledInOneCourse, router, stayOnDashboard, studentData?.inProgressBootcamps]);

  const handleEnrollCourse = async (bootcampId: number) => {
    if (!bootcampId || isEnrolling) return;

    setEnrollingBootcampId(bootcampId);
    const result = await enrollCourse(bootcampId);

    if (result.success) {
      toast.success({
        title: "Enrollment Successful!",
        description: result.message || "You have successfully enrolled in the course.",
      });
      refetchGlobalCourses();
      refetch();
    } else {
      toast.error({
        title: "Enrollment Failed",
        description: result.message || "Failed to enroll in the course. Please try again.",
      });
    }

    setEnrollingBootcampId(null);
  };

  const getActionButton = (bootcamp: Bootcamp) => {
    if (filter === 'completed') {
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="hidden md:flex items-center gap-3 w-full">
            <Button variant="outline" className="flex-1 bg-transparent border-success text-success hover:bg-success hover:text-success-foreground" asChild>
              <Link href={`/student/course/${bootcamp.id}`}>
                <CheckCircle className="w-4 h-4 mr-2" />
                View Course
              </Link>
            </Button>
          </div>
          <div className="md:hidden flex flex-col gap-3 w-full">
            <Button variant="outline" className="w-full bg-transparent border-success text-success hover:bg-success hover:text-success-foreground" asChild>
              <Link href={`/student/course/${bootcamp.id}`}>
                <CheckCircle className="w-4 h-4 mr-2" />
                View Course
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    if (bootcamp.progress === 0) {
      return (
        <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark  " asChild>
          <Link href={`/student/course/${bootcamp.id}`}>
            <Play className="w-4 h-4 mr-2" />
            Start Learning
          </Link>
        </Button>
      );
    }

    return (
      <Button className="w-full md:w-auto bg-primary font-semibold text-primary-foreground hover:bg-primary-dark" asChild>
        <Link href={`/student/course/${bootcamp.id}`}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Resume Learning
        </Link>
      </Button>
    );
  };

  const mapEventType = (type: string) => {
    if (!type) return '';
    switch (type.toLowerCase()) {
      case 'class': return 'Live Class';
      case 'assessment': return 'Assessment';
      case 'assignment': return 'Assignment';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getProfileStatus = (prog: number) => {
    if (prog >= 100) return { label: 'Complete', color: 'text-success' };
    if (prog >= 80) return { label: 'Job Ready', color: 'text-primary' };
    if (prog >= 50) return { label: 'Intermediate', color: 'text-foreground' };
    return { label: 'Beginner', color: 'text-muted-foreground' };
  };

  const getProfileStatusColor = (level: string | null, prog: number) => {
    if (!level) return getProfileStatus(prog).color;

    const normalizedLevel = level.trim().toLowerCase();
    if (normalizedLevel === 'complete') return 'text-success';
    if (normalizedLevel === 'job ready') return 'text-primary';
    if (normalizedLevel === 'intermediate') return 'text-foreground';
    if (normalizedLevel === 'beginner') return 'text-muted-foreground';

    return getProfileStatus(prog).color;
  };

  const getSubtext = (prog: number) => {
    if (prog >= 100) return 'Your profile is ready! Start applying for jobs.';
    if (prog >= 95) return 'Almost there! One step away from being job ready.';
    if (prog >= 90) return "You're so close! Complete your profile to unlock opportunities.";
    if (prog >= 80) return 'You can now apply for jobs! Add more details to stand out.';
    if (prog >= 60) return 'Great progress! A few more clicks to become job ready.';
    if (prog >= 40) return "You're halfway there! Keep going to unlock job opportunities.";
    if (prog >= 20) return 'Good start! Just a few quick additions to boost your profile.';
    return "Let's get started! Your dream job is just a few clicks away.";
  };

  const getNextAction = (prog: number) => {
    if (prog < 20) return { text: 'Add Basic Info', score: '+20%' };
    if (prog < 40) return { text: 'Add Skills', score: '+20%' };
    if (prog < 60) return { text: 'Add Project', score: '+20%' };
    if (prog < 80) return { text: 'Add Career Goals', score: '+20%' };
    if (prog < 90) return { text: 'Add LinkedIn', score: '+10%' };
    if (prog < 95) return { text: 'Add Experience', score: '+5%' };
    if (prog < 100) return { text: 'Add Competitive Profile', score: '+5%' };
    return { text: 'Profile Complete', score: '100%' };
  };

  const profileStatus = getProfileStatus(displayProgress);
  const profileLevel = strengthLevel ?? profileStatus.label;
  const profileMessage = strengthMessage ?? getSubtext(displayProgress);
  const profileLevelColor = getProfileStatusColor(strengthLevel, displayProgress);
  const nextAction = getNextAction(displayProgress);

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="mb-12">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary-dark" onClick={refetch}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('studentData:', studentProfile);

  return (
    <div className="mb-12">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-8 text-left">
              <h1 className="text-3xl font-heading font-bold mb-2">
                Welcome {studentProfile?.name || 'Student'}!
              </h1>
              <p className="text-lg text-muted-foreground">
                What will you be learning today?
              </p>
            </div>

            <Card className="w-full bg-gradient-to-r from-[#E0FFF0] shadow-4dp hover:shadow-8dp transition-shadow duration-200 mb-8 overflow-hidden">
              <CardContent className="p-0 relative">
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: 'url(/images/Rectangle\\ 5.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 sm:p-5 md:p-6 relative z-10">
                  <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
                    <Image
                      src="/images/zoe-talking 1 (3).svg"
                      alt="Zoe Assistant"
                      width={100}
                      height={100}
                      className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-[120px] lg:h-[120px]"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span>I am Zoe, your learning assistant</span>
                      <button className="bg-[#12EA7B] px-2 sm:px-3 py-0.5 rounded font-semibold text-xs sm:text-sm inline-flex items-center justify-center">New</button>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-4 md:mb-0">
                      I will help you get job ready by practicing interviews and learning activities
                    </p>
                  </div>

                  <div className="flex items-center justify-center md:justify-end flex-shrink-0">
                    <Button onClick={() => window.open(`https://zoe.zuvy.org?token=${access_token}`, '_blank')} className="bg-[#2C5F2D] text-white font-semibold w-full md:w-auto text-sm sm:text-base">
                      Learn with zoe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* ✅ Fixed Global Courses Section */}
        {globalCourses && globalCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-heading text-left font-semibold mb-6">Global Courses</h2>
            
            {globalLoading ? (
              <CarouselSkeleton />
            ) : globalError ? (
              <Card className="w-full shadow-4dp">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive mb-4">{globalError}</p>
                  <Button onClick={refetchGlobalCourses}>Try Again</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* ✅ Map over globalCourses array */}
                {globalCourses.map((course) => (
                  <Card key={course.id} className="w-full shadow-4dp hover:shadow-8dp transition-shadow duration-200 dark:bg-card-light bg-card">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Course Image */}
                        <div className="mt-2">
                          <Image
                            src={course.coverImage || '/logo.PNG'}
                            alt={course.name}
                            width={128}
                            height={128}
                            className="rounded-lg object-cover"
                          />
                        </div>

                        {/* Course Info */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 text-left">
                              <h3 className="text-xl font-heading font-semibold mb-2">
                                {course.name}
                              </h3>
                              <div className="mb-3">
                                <Badge variant="outline" className="capitalize">
                                  {course.courseOrgName || "N/A"}
                                </Badge>
                              </div>
                              <TruncatedDescription 
                                text={course.description || ''}
                                maxLength={150}
                                className="text-muted-foreground mb-3"
                              />
                              
                              {/* ✅ Fixed instructor path */}
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-muted-foreground capitalize">
                                  Instructor: {course.batchInfo?.instructorDetails?.name || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Action Button - Desktop */}
                            <div className="hidden md:flex flex-shrink-0">
                              <Button 
                                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark" 
                                onClick={() => handleEnrollCourse(course.bootcampId)}
                                disabled={isEnrolling && enrollingBootcampId === course.bootcampId}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {isEnrolling && enrollingBootcampId === course.bootcampId ? 'Enrolling...' : 'Enroll Now'}
                              </Button>
                            </div>
                          </div>

                          {/* Action Button - Mobile */}
                          <div className="md:hidden mt-4">
                            <Button 
                              className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark" 
                              onClick={() => handleEnrollCourse(course.bootcampId)}
                              disabled={isEnrolling && enrollingBootcampId === course.bootcampId}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {isEnrolling && enrollingBootcampId === course.bootcampId ? 'Enrolling...' : 'Enroll Now'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

            <div className="mb-6">
              <h2 className="text-2xl font-heading text-left font-semibold mb-6">My Courses</h2>

              <div className="flex gap-3 mb-6">
                <Button
                  variant={filter === 'enrolled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('enrolled')}
                  className={`rounded-full font-semibold ${filter === 'enrolled'
                    ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                    : 'hover:bg-primary-light hover:text-foreground'
                    }`}
                >
                  Enrolled
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                  disabled={!studentData?.completedBootcamps?.length}
                  className={`rounded-full font-semibold ${filter === 'completed'
                    ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                    : 'hover:bg-primary-light hover:text-foreground'
                    }`}
                >
                  Completed
                </Button>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {filteredBootcamps.map((bootcamp) => (
                <Card key={bootcamp.id} className="w-full shadow-4dp hover:shadow-8dp transition-shadow duration-200 dark:bg-card-light bg-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="mt-2">
                        <Image
                          src={bootcamp.coverImage || '/logo.PNG'}
                          alt={bootcamp.name}
                          width={128}
                          height={128}
                          className="rounded-lg object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 text-left">
                            <h3 className="text-xl font-heading font-semibold mb-2">
                              {bootcamp.name}
                            </h3>
                        <div className="mb-3">
                          <Badge variant="outline" className="capitalize">
                            {bootcamp.courseOrgName || "N/A"}
                          </Badge>
                        </div>
                            <TruncatedDescription
                              text={bootcamp.description || ``}
                              maxLength={150}
                              className="text-muted-foreground mb-3"
                            />
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-sm text-muted-foreground capitalize">
                                Instructor: {bootcamp.instructorDetails.name}
                              </span>
                            </div>

                            <div className="mb-4 md:mb-0">
                              <div className="relative bg-primary-light rounded-full h-2 w-full">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300 relative"
                                  style={{ width: `${bootcamp.progress}%` }}
                                >
                                  <div
                                    className="absolute top-1/2 transform -translate-y-1/2 bg-background px-2 py-0.5 rounded shadow-sm border text-xs font-medium whitespace-nowrap text-foreground"
                                    style={{
                                      right: bootcamp.progress === 100 ? '0' : bootcamp.progress === 0 ? 'auto' : '-12px',
                                      left: bootcamp.progress === 0 ? '0' : 'auto'
                                    }}
                                  >
                                    {bootcamp.progress}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:flex flex-shrink-0">
                            {getActionButton(bootcamp)}
                          </div>
                        </div>

                        <div className="md:hidden mt-4">
                          {getActionButton(bootcamp)}
                        </div>
                      </div>
                    </div>

                    {filter === 'enrolled' && (
                      <>
                        <div className="border-t border-border mt-6 mb-6"></div>
                        {eventsLoading ? (
                          <CarouselSkeleton />
                        ) : (upcomingEventsData?.events?.filter((item) => item.bootcampId === bootcamp.id) || []).length > 0 ? (
                          <div>
                            <Carousel className="w-full group">
                              <CarouselContent className="-ml-2">
                                {upcomingEventsData?.events
                                  .filter((item) => item.bootcampId === bootcamp.id)
                                  .map((item) => {
                                    const eventType = mapEventType(item.type);
                                    const liveClassStatus = item.status;
                                    return (
                                      <CarouselItem key={item.id} className="pl-2 md:basis-1/3">
                                        <a target={liveClassStatus === 'ongoing' ? '_blank' : '_self'} href={`${liveClassStatus === 'ongoing' ? (item as any).hangoutLink : `/student/course/${item.bootcampId}/modules/${(item as any).moduleId}?chapterId=${(item as any).chapterId}`}`}>
                                          <div className="w-full border rounded-lg p-3 h-full">
                                            <div className="flex items-start gap-3">
                                              <div className="flex-shrink-0 mt-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${eventType === 'Live Class'
                                                  ? 'bg-primary-light'
                                                  : eventType === 'Assessment'
                                                    ? 'bg-warning-light'
                                                    : 'bg-info-light'
                                                  }`}>
                                                  {eventType === 'Live Class' && <Video className="w-4 h-4 text-primary" />}
                                                  {eventType === 'Assessment' && <FileText className="w-4 h-4 text-warning" />}
                                                  {eventType === 'Assignment' && <FileText className="w-4 h-4 text-info" />}
                                                </div>
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                  <h4 className="text-sm font-medium text-left line-clamp-1">
                                                    {item.title}
                                                  </h4>
                                                  <div>
                                                    <div className="flex flex-col">
                                                      <Badge
                                                        variant="outline"
                                                        className={` text-xs px-2 py-0.5 whitespace-nowrap ${eventType === 'Live Class'
                                                          ? 'bg-primary-light text-foreground border-primary-light'
                                                          : eventType === 'Assessment'
                                                            ? 'bg-warning-light text-foreground border-warning-light'
                                                            : 'bg-info-light text-foreground border-info-light'
                                                          }`}
                                                      >
                                                        {eventType}
                                                        <span>
                                                          {liveClassStatus === 'ongoing' && <div className="w-2 h-2 ml-1 inline-block bg-green-500 animate-pulse rounded-full" />}
                                                        </span>
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </div>
                                                <p className="text-xs text-left flex justify-between w-full text-muted-foreground mb-2">
                                                  <span>{formatUpcomingItem(item)}</span>
                                                  <span>
                                                    {liveClassStatus === 'ongoing' && <span className="text-primary hover:text-primary-dark text-left w-full text-[14px] font-semibold mr-8">Join</span>}
                                                  </span>
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </a>
                                      </CarouselItem>
                                    );
                                  })}
                              </CarouselContent>
                              {(upcomingEventsData?.events?.filter((item) => item.bootcampId === bootcamp.id)?.length || 0) > 3 && (
                                <>
                                  <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity border hover:border-blue-500 text-blue-500" />
                                  <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity border hover:border-blue-500 text-blue-500" />
                                </>
                              )}
                            </Carousel>
                          </div>
                        ) : null}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBootcamps.length === 0 && (
              <Card className="text-center py-12 shadow-4dp">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-2">
                    No {filter} courses found
                  </h3>
                  <p className="text-muted-foreground">
                    {filter === 'enrolled'
                      ? "You haven't enrolled in any courses yet."
                      : "You haven't completed any courses yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-heading font-bold">Profile Strength</h3>
                  <span className="text-xl font-semibold text-primary bg-primary-light px-3 py-1 rounded-lg">
                    {Math.round(displayProgress)}%
                  </span>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - displayProgress / 100)}`}
                        className="text-primary transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <p className="text-base mb-1">
                    Your profile is <span className={`font-semibold ${profileLevelColor}`}>{profileLevel}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profileMessage}
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await refetchLearnerProfile();
                    router.push('/student/profile?mode=edit');
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary-light hover:bg-primary-light/80 transition-all group border border-transparent hover:border-primary"
                >
                  <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center shadow-sm flex-shrink-0">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{nextAction.text}</p>
                    <p className="text-xs text-primary font-medium">{nextAction.score} Score</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
