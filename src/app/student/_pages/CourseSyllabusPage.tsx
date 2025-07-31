'use client';

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, BookOpen, FileText, Clock, Users, Code, ClipboardList, HelpCircle, ArrowLeft, Play } from "lucide-react";
import useCourseSyllabus from "@/hooks/useCourseSyllabus";
import TruncatedDescription from "@/app/student/_components/TruncatedDescription";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";



const CourseSyllabusPage = () => {
  const { courseId } = useParams();
  const router = useRouter();
  const { syllabusData, loading, error, refetch } = useCourseSyllabus(courseId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          {/* Course Information Skeleton */}
          <Card className="mb-8 shadow-4dp">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
              </div>

              {/* Course Metrics Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Modules Skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              {[1, 2, 3].map((moduleIndex) => (
                <Card key={moduleIndex} className="shadow-4dp">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Skeleton className="h-6 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>

                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((chapterIndex) => (
                        <div key={chapterIndex} className="border-l-2 border-border pl-4">
                          <div className="flex items-center gap-3 py-2">
                            <Skeleton className="w-4 h-4" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-48 mb-1" />
                                  <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-3 w-16 ml-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2 text-destructive">Error Loading Syllabus</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={refetch} variant="outline">Try Again</Button>
            <Button onClick={() => router.push('/student')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!syllabusData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested course syllabus could not be found.</p>
          <Button onClick={() => router.push('/student')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4 text-primary" />;
      case 'article':
        return <FileText className="w-4 h-4 text-accent" />;
      case 'assignment':
        return <ClipboardList className="w-4 h-4 text-secondary" />;
      case 'assessment':
        return <BookOpen className="w-4 h-4 text-warning" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-info" />;
      case 'coding question':
        return <Code className="w-4 h-4 text-purple-500" />;
      case 'form':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'live class':
        return <Play className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (duration: string) => {
    if (duration === "Self-paced" || duration === "Timed") return duration;

    // Convert minutes to hours if it's a number
    const minutes = parseInt(duration.replace(' min', ''));
    if (isNaN(minutes)) return duration;

    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getChapterTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'video': 'Video Lesson',
      'article': 'Reading Material',
      'assignment': 'Assignment',
      'assessment': 'Assessment',
      'quiz': 'Quiz',
      'coding question': 'Coding Challenge',
      'form': 'Form'
    };
    return typeMap[type.toLowerCase()] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-start hover:text-primary cursor-pointer w-fit" onClick={() => router.back()}>

        <ArrowLeft className="w-4 h-4 ml-10 mt-1  inline-block text-left  " />
        <span className="text-sm font-semibold  ml-2 mt-1 ">Back</span>
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Course Information */}
        <Card className="mb-8 shadow-4dp">
          <CardContent className="p-6 md:p-8">
            {/* <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 text-left">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-left">
                      {syllabusData.bootcampName}
                    </h1>
                    {syllabusData.bootcampDescription && (
                      <p className="text-base md:text-lg text-muted-foreground mb-4 text-left">
                        {syllabusData.bootcampDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={syllabusData.instructorProfilePicture || "/placeholder.svg"} />
                        <AvatarFallback>
                          {syllabusData.instructorName?.charAt(0)?.toUpperCase() || 'I'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium capitalize text-left">{syllabusData.instructorName}</span>
                    </div>
                  </div>
                  {syllabusData.collaboratorName && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                      <span className="font-medium">{syllabusData.collaboratorName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div> */}
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <Image
                  width={128}
                  height={128}
                  src={syllabusData.coverImage || '/logo.PNG'}
                  alt={syllabusData.bootcampName}
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-left">{syllabusData.bootcampName}</h1>
                    {syllabusData.bootcampDescription && (
                      <TruncatedDescription text={syllabusData.bootcampDescription} maxLength={150} className="text-base md:text-lg text-left text-muted-foreground mb-4" />
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      {/*   <Avatar className="w-8 h-8">
                        <AvatarImage src={syllabusData.instructorProfilePicture} />
                        <AvatarFallback>{syllabusData.instructorName?.charAt(0)?.toUpperCase() || 'I'}</AvatarFallback>
                      </Avatar> */}
                      <span className="font-medium capitalize text-sm ">Instructor:- {syllabusData.instructorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-muted-foreground">In Collaboration With</p>
                    <img
                      src={syllabusData.collaboratorName || '/logo.PNG'}
                      alt="AFE Brand"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Course Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="font-medium">{syllabusData.studentBatchName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{syllabusData.courseDuration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="font-medium">{syllabusData.totalStudentsInCourse} enrolled</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Modules */}
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-6 text-left">Course Syllabus</h2>
          <div className="space-y-6">
            {syllabusData.modules.map((module, moduleIndex) => {

              const isLock = module.isLock;

              return (
                <Card key={module.moduleId} className="shadow-4dp">
                  <CardContent className={`p-6 ${isLock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="mb-4 text-left">
                      <h3 className="text-xl font-heading font-semibold mb-2 text-left">
                        Module {moduleIndex + 1}: {module.moduleName}
                      </h3>
                      {isLock && <span className="text-xs text-muted-foreground text-left">Locked</span>}
                      {module.moduleDescription && (
                        <TruncatedDescription text={module.moduleDescription} maxLength={150} className="text-muted-foreground mb-2 text-left" />
                      )}
                      <p className="text-sm text-muted-foreground text-left">
                        Duration: {formatDuration(module.moduleDuration)} • {module.chapters.length} chapters
                      </p>
                    </div>

                    <div className="space-y-3">
                      {module.chapters
                        .sort((a, b) => a.chapterOrder - b.chapterOrder)
                        .map((chapter, chapterIndex) => (
                          <div key={chapter.chapterId} className="border-b-2 flex items-start gap-3 border-border pb-2">
                            <div className="flex-shrink-0 mt-1">
                              {getItemIcon(chapter.chapterType)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-left">
                                  <Link href={`/student/course/${courseId}/modules/${module.moduleId}?chapterId=${chapter.chapterId}`} className="hover:text-primary"   >
                                    <h4 className="font-medium text-sm text-left">
                                      {chapter.chapterName || `Chapter ${chapter.chapterOrder}`}
                                    </h4>
                                  </Link>
                                  <p className="text-xs text-muted-foreground text-left">
                                    {getChapterTypeLabel(chapter.chapterType)}
                                  </p>
                                  {chapter.chapterDescription && (
                                    <TruncatedDescription text={chapter.chapterDescription} maxLength={100} className="text-xs text-muted-foreground mt-1 text-left" />
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                  {formatDuration(chapter.chapterDuration)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSyllabusPage; 