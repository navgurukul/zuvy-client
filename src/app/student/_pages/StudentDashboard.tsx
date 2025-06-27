'use client';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, RotateCcw, CheckCircle, Video, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLazyLoadedStudentData } from '@/store/store';
import StudentDashboardSkeleton from "@/app/student/_components/StudentDashboardSkeleton";
import { useStudentData } from "@/hooks/useStudentData";

interface UpcomingEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  bootcampId: number;
  bootcampName: string;
  batchId: number;
  eventDate: string;
  type: string;
}

interface Bootcamp {
  id: number;
  name: string;
  coverImage: string;
  duration: string;
  language: string;
  bootcampTopic: string;
  description: string | null;
  batchId: number;
  batchName: string;
  progress: number;
  instructorDetails: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
  upcomingEvents: UpcomingEvent[];
}

const StudentDashboard = () => {
  const [filter, setFilter] = useState<'enrolled' | 'completed'>('enrolled');
  const { studentData, loading, error, refetch } = useStudentData();
  const { studentData: studentProfile } = useLazyLoadedStudentData();

  const filteredBootcamps = filter === 'enrolled' 
    ? studentData?.inProgressBootcamps || []
    : studentData?.completedBootcamps || [];

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
        <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark" asChild>
          <Link href={`/student/course/${bootcamp.id}`}>
            <Play className="w-4 h-4 mr-2" />
            Start Learning
          </Link>
        </Button>
      );
    }
    
    return (
      <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-dark" asChild>
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

  const formatUpcomingItem = (item: UpcomingEvent) => {
    // Use eventDate as the source of truth for the event's timing.
    if (!item.eventDate) {
      return "Date not available";
    }

    // Handle the specific format "2025-06-27 08:26:00+00"
    let parsableDateString = item.eventDate;
    
    // Convert "2025-06-27 08:26:00+00" to "2025-06-27T08:26:00+00:00"
    if (parsableDateString.includes(' ') && parsableDateString.includes('+')) {
      parsableDateString = parsableDateString.replace(' ', 'T');
      // Add colon to timezone if missing ("+00" becomes "+00:00")
      if (parsableDateString.match(/[+-]\d{2}$/)) {
        parsableDateString += ':00';
      }
    }
    
    const itemDate = new Date(parsableDateString);
    const now = new Date();

    if (isNaN(itemDate.getTime())) {
      // If parsing still fails, try a different approach
      console.error('Failed to parse date:', item.eventDate);
      return "Invalid date format";
    }

    const diffTime = itemDate.getTime() - now.getTime();

    if (diffTime <= 0) {
      // Since we're not using an end date, we provide a generic past-tense status.
      if (item.type?.toLowerCase() === 'assignment') {
        return "Past due";
      }
      return "Event has started";
    }

    // Calculate remaining time
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    // Return formatted countdown string
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours} hr${hours > 1 ? 's' : ''}` : ''}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min${minutes > 1 ? 's' : ''}` : ''}`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return "Starting soon";
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
              <Button onClick={refetch}>
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
            Welcome back, {studentProfile?.name || 'Student'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            What will you be learning today?
          </p>
        </div>

        {/* My Courses Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading text-left font-semibold mb-6">My Courses</h2>
          
          {/* Filter Chips */}
          <div className="flex gap-3 mb-6">
            <Button
              variant={filter === 'enrolled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('enrolled')}
              className={`rounded-full ${
                filter === 'enrolled' 
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
              className={`rounded-full ${
                filter === 'completed' 
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
            <Card key={bootcamp.id} className="w-full shadow-4dp hover:shadow-8dp transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Course Image */}
                  <div className="flex-shrink-0 md:w-20 md:h-20">
                    <Image
                      src={bootcamp.coverImage || '/logo.PNG'}
                      alt={bootcamp.name}
                      width={80}
                      height={80}
                      className="w-full h-20 md:w-20 md:h-20 rounded-lg object-cover"
                    />
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-heading font-semibold mb-2">
                          {bootcamp.name}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {bootcamp.description || `${bootcamp.bootcampTopic} • ${bootcamp.language} • ${bootcamp.duration}`}
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={bootcamp.instructorDetails.profilePicture || undefined} />
                            <AvatarFallback>{bootcamp.instructorDetails.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {bootcamp.instructorDetails.name}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
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
                                className="absolute top-1/2 transform -translate-y-1/2 bg-white px-2 py-0.5 rounded shadow-sm border text-xs font-medium whitespace-nowrap"
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
                {filter === 'enrolled' && bootcamp.upcomingEvents.length > 0 && (
                  <>
                    <div className="border-t border-border mt-6 mb-6"></div>

                    {/* Upcoming Items */}
                    <div className="overflow-x-auto pb-2 -mx-6 px-6">
                      <div className="flex flex-nowrap gap-4">
                        {bootcamp.upcomingEvents.map((item) => {
                          const eventType = mapEventType(item.type);
                          return (
                           <div key={item.id} className="flex-shrink-0 w-full sm:w-80 border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  eventType === 'Live Class' 
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
                              <h4 className="text-sm font-medium line-clamp-1">
                                    {item.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-2 py-0.5 whitespace-nowrap ${
                                      eventType === 'Live Class' 
                                        ? 'bg-primary-light text-foreground border-primary-light' 
                                        : eventType === 'Assessment'
                                    ? 'bg-warning-light text-foreground border-warning-light'
                                    : 'bg-info-light text-foreground border-info-light'
                                }`}
                              >
                                    {eventType}
                              </Badge>
                            </div>
                                <p className="text-xs text-left text-muted-foreground mb-2">
                                  {eventType === 'Assignment' ? 'Due' : 'Starts'} in {formatUpcomingItem(item)}
                            </p>
                          </div>
                        </div>
                           </div>
                          );
                        })}
                      </div>
                    </div>
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