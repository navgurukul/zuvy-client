export type LiveClassProps = {
    chapterData: any
    content: any
    moduleId: any
    courseId: any
}

export interface SessionDetail{
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
    // Added flag to identify platform
    isZoomMeet?: boolean;
}

export interface LiveClassData{
    id: number;
    title: string;
    description: string;
    moduleId: number;
    topicId: number;
    order: number;
    completionDate: string | null;
    sessionDetails: SessionDetail[];
}

export interface LiveClassCardProps{
    classData: LiveClassData;
}
