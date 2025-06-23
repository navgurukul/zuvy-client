import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Users, ExternalLink } from 'lucide-react';

type Props = {
    chapterData: any
    content: any
    // fetchChapterContent={fetchChapterContent}
    moduleId: any
    courseId: any
}

interface SessionDetail {
    id: number;
    meetingId: string;
    hangoutLink: string;
    creator: string;
    startTime: string;
    endTime: string;
    title: string;
    s3link: string | null;
    status: 'upcoming' | 'completed' | 'ongoing';
    attendance: number | null;
}

interface LiveClassData {
    id: number;
    title: string;
    description: string;
    moduleId: number;
    topicId: number;
    order: number;
    completionDate: string | null;
    sessionDetails: SessionDetail[];
}

interface LiveClassCardProps {
    classData: LiveClassData;
}

const LiveClass = ({ chapterData, content, moduleId, courseId }: Props) => {
    // Get the first session from sessionDetails
    const session = content?.sessionDetails?.[0];
  
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'upcoming':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'ongoing':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'completed':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'upcoming':
          return <Clock className="w-3 h-3" />;
        case 'ongoing':
          return <Video className="w-3 h-3" />;
        case 'completed':
          return <Users className="w-3 h-3" />;
        default:
          return <Clock className="w-3 h-3" />;
      }
    };

    // Return early if no content or session data
    if (!content || !session) {
        return (
            <div className="w-3/4 mx-auto p-4">
                <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No live class data available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-3/4 mx-auto">
            <Card className="duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-left text-primary leading-tight mb-2">
                                {content.title}
                            </h3>
                            {content.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                    {content.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <Badge
                                    variant="secondary"
                                    className={`${getStatusColor(
                                        session.status
                                    )} font-medium px-3 py-1 flex items-center gap-1`}
                                >
                                    {getStatusIcon(session.status)}
                                    {session.status.charAt(0).toUpperCase() +
                                        session.status.slice(1)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {formatDate(session.startTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {formatTime(session.startTime)} -{' '}
                                {formatTime(session.endTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                Created by {session.creator}
                            </span>
                        </div>
                    </div>

                    {/* Meeting Action Section */}
                    <div className="pt-4 border-t border-border">
                        {session.status === 'completed' && session.s3link ? (
                            // Show recording if meeting is completed and recording is available
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    Meeting Recording
                                </h4>
                                <div className="w-full bg-black rounded-lg overflow-hidden">
                                    <iframe
                                        src={session.s3link}
                                        className="w-full h-64 border-0"
                                        allowFullScreen
                                        title={`Recording: ${session.title}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            </div>
                        ) : (
                            // Show join button for upcoming/ongoing meetings or completed without recording
                            <Button
                                className="w-full bg-secondary hover:bg-primary text-primary-foreground font-medium py-2.5 transition-all duration-200"
                                onClick={() =>
                                    window.open(session.hangoutLink, '_blank')
                                }
                                disabled={session.status === 'completed' && !session.s3link}
                            >
                                <Video className="w-4 h-4 mr-2 text-white" />
                                <span className='text-white'>
                                    {session.status === 'completed' 
                                        ? 'Recording Not Available' 
                                        : session.status === 'ongoing'
                                        ? 'Join Live Meeting'
                                        : 'Join Meeting'
                                    }
                                </span>
                                {session.status !== 'completed' && (
                                    <ExternalLink className="w-3 h-3 ml-2" />
                                )}
                            </Button>
                        )}
                    </div>

                    {/* <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                        <span>
                            Module {content.moduleId}
                        </span>
                        <span>Order {content.order}</span>
                    </div> */}
                </CardContent>
            </Card>
        </div>
    )
}

export default LiveClass