'use client';
import { useState , useEffect ,  } from "react";
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
import { Play, RotateCcw, CheckCircle, Video, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useIsStudentEnrolledInOneCourseStore, useLazyLoadedStudentData, useThemeStore } from '@/store/store';
import TruncatedDescription from "@/app/student/_components/TruncatedDescription";
import { useStudentData } from "@/hooks/useStudentData";
import { useFetchGlobalCourses } from "@/hooks/useFetchGlobalCourses";
import useEnrollCourse from "@/hooks/useEnrollCourse";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {UpcomingEvent,Bootcamp,TopicItem } from '@/app/student/_pages/pageStudentType'
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import {formatUpcomingItem} from "@/utils/students"
import {StudentDashboardSkeleton, CarouselSkeleton} from "@/app/student/_components/Skeletons";

const StudentDashboard = () => {
  const [filter, setFilter] = useState<'enrolled' | 'completed'>('enrolled');
  const { studentData, loading, error, refetch } = useStudentData();
  const { globalCourse, loading: globalLoading, error: globalError, refetch: refetchGlobalCourses } = useFetchGlobalCourses();
  const { enrollCourse, isEnrolling } = useEnrollCourse();
  const { isDark } = useThemeStore()
  
  const { upcomingEventsData, loading: eventsLoading, error: eventsError } = useUpcomingEvents();
  const access_token = localStorage.getItem('access_token')
  const { studentData: studentProfile } = useLazyLoadedStudentData();
  const {isStudentEnrolledInOneCourse} = useIsStudentEnrolledInOneCourseStore()
  const router = useRouter();
  const filteredBootcamps = filter === 'enrolled'
    ? studentData?.inProgressBootcamps || []
    : studentData?.completedBootcamps || [];

  const isStudentEnroledInOneBootcamp = studentData?.inProgressBootcamps?.length === 1;

  useEffect(() => {
    if (isStudentEnroledInOneBootcamp && isStudentEnrolledInOneCourse) {
      router.push(`/student/course/${studentData?.inProgressBootcamps[0].id}`);
    }
  }, [isStudentEnroledInOneBootcamp]);

  const handleEnrollCourse = async (courseId: number) => {
    const success = await enrollCourse(courseId);
    if (success) {
      toast({
        title: "Enrollment Successful!",
        description: "You have successfully enrolled in the course.",
      });
      refetchGlobalCourses();
      refetch();
    } else {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in the course. Please try again.",
        variant: "destructive",
      });
    }
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


  return (
    <div className="mb-12">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        {/* Welcome Message */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome {studentProfile?.name || 'Student'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            What will you be learning today?
          </p>
        </div>

        {/* Zoe Assistant Card */}
        <Card  className="w-full bg-gradient-to-r from-[#E0FFF0] shadow-4dp hover:shadow-8dp transition-shadow duration-200 mb-8 overflow-hidden">
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
              {/* Zoe Image */}
              <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
                <Image
                  src="/images/zoe-talking 1 (3).svg"
                  alt="Zoe Assistant"
                  width={100}
                  height={100}
                  className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-[120px] lg:h-[120px]"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span>I am Zoe, your learning assistant</span>
                  <button className="bg-[#12EA7B] px-2 sm:px-3 py-0.5 rounded font-semibold text-xs sm:text-sm inline-flex items-center justify-center" >New</button> 
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 md:mb-0">
                  I will help you get job ready by practicing interviews and learning activities
                </p>
              </div>

              {/* Button */}
              <div className="flex items-center justify-center md:justify-end flex-shrink-0">
                <Button  onClick={() => window.open(`https://zoe.zuvy.org?token=${access_token}`, '_blank')} className="bg-[#2C5F2D] text-white font-semibold w-full md:w-auto text-sm sm:text-base">
                  Learn with zoe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Global Courses Section */}
        {globalCourse && Object.keys(globalCourse).length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-heading text-left font-semibold mb-6">Global Courses</h2>
          
          {/* Global Course Cards */}
          {globalLoading ? (
            <CarouselSkeleton />
          ) : globalError ? (
            <Card className="w-full shadow-4dp">
              <CardContent className="p-6 text-center">
                <p className="text-destructive mb-4">{globalError}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card key={globalCourse.id} className="w-full shadow-4dp hover:shadow-8dp transition-shadow duration-200 dark:bg-card-light bg-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Course Image */}
                    <div className="mt-2">
                      <Image
                        src={globalCourse.coverImage || (isDark ? '/zuvy-logo-horizontal-dark (1).png' : '/zuvy-logo-horizontal (1).png')}
                        alt={globalCourse.name}
                        width={128}
                        height={128}
                        className="rounded-lg object-contain"
                      />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 text-left">
                          <h3 className="text-xl font-heading font-semibold mb-2">
                            {globalCourse.name}
                          </h3>
                          <TruncatedDescription 
                            text={globalCourse.description || ''}
                            maxLength={150}
                            className="text-muted-foreground mb-3"
                          />
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-muted-foreground capitalize">
                              Instructor: {globalCourse.instructorDetails?.name || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Action Button - Desktop */}
                        <div className="hidden md:flex flex-shrink-0">
                          <Button 
                            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark" 
                            onClick={() => handleEnrollCourse(globalCourse.id)}
                            disabled={isEnrolling}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                          </Button>
                        </div>
                      </div>

                      {/* Action Button - Mobile */}
                      <div className="md:hidden mt-4">
                        <Button 
                          className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark" 
                          onClick={() => handleEnrollCourse(globalCourse.id)}
                          disabled={isEnrolling}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        )}

        {/* My Courses Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading text-left font-semibold mb-6">My Courses</h2>

          {/* Filter Chips */}
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

        {/* Course Cards */}
        <div className="space-y-6 mb-12">
          {filteredBootcamps.map((bootcamp) => (
            <Card key={bootcamp.id} className="w-full shadow-4dp hover:shadow-8dp transition-shadow duration-200 dark:bg-card-light bg-card ">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Course Image */}
                  <div className="mt-2">
                    <Image
                      src={bootcamp.coverImage ||  (isDark
                                ? '/zuvy-logo-horizontal-dark (1).png'
                                : '/zuvy-logo-horizontal (1).png')}
                      alt={bootcamp.name}
                      width={128}
                     height={128}
                     className="rounded-lg object-contain"
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-heading font-semibold mb-2">
                          {bootcamp.name}
                        </h3>
                        <TruncatedDescription 
                          text={bootcamp.description || ``}
                          maxLength={150}
                          className="text-muted-foreground mb-3"
                        />
                        <div className="flex items-center gap-2 mb-4">
                          {/* <Avatar className="w-6 h-6">
                            <AvatarImage src={bootcamp.instructorDetails.profilePicture || undefined} />
                            <AvatarFallback>Instructor:-{bootcamp.instructorDetails.name[0]}</AvatarFallback>
                          </Avatar> */}
                          <span className="text-sm  text-muted-foreground capitalize ">
                            Instructor: {bootcamp.instructorDetails.name}
                          </span>
                     
                          {/* <span className="text-sm text-muted-foreground">
                            {bootcamp.batchName}
                          </span> */}
                        </div>

                        {/* Progress Bar */}
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

                      {/* Action Button - Desktop: top right */}
                      <div className="hidden md:flex flex-shrink-0">
                        {getActionButton(bootcamp)}
                      </div>
                    </div>

                    {/* Action Button - Mobile: below progress */}
                    <div className="md:hidden mt-4">
                      {getActionButton(bootcamp)}
                    </div>
                  </div>
                </div>

                {/* Separator and Upcoming Items - Only for enrolled courses */}
                {filter === 'enrolled' && (
                  <>
                    <div className="border-t border-border mt-6 mb-6"></div>
                    {/* Upcoming Items */}
                    {eventsLoading? (
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
                              <CarouselItem key={item.id} className="pl-2 md:basis-1/3  ">
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
                                            <div className="flex flex-col" >

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
                                                <span>
                                                </span>
                                              </Badge>
                                              <p>
                                              </p>
                                            </div>
                                          </div>

                                        </div>
                                        <p className="text-xs text-left flex justify-between w-full text-muted-foreground mb-2">
                                          <span>

                                          {formatUpcomingItem(item)}
                                          </span>
                                          <span>

                                          {liveClassStatus === 'ongoing' && <span  className="text-primary hover:text-primary-dark text-left w-full text-[14px] font-semibold mr-8 ">Join</span>}
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
                        {(upcomingEventsData?.events?.filter(
                         (item) => item.bootcampId === bootcamp.id
                          )?.length || 0) > 3 && (
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
    </div>
  );
};

export default StudentDashboard;