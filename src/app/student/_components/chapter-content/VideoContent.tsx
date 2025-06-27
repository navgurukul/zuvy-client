import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import YouTubePlayer from "@/app/_components/videoPlayer";

interface VideoContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    file: string | null;
    links: string | null;
  };
}

const VideoContent: React.FC<VideoContentProps> = ({ chapterDetails }) => {
  const isCompleted = chapterDetails.status === 'Completed';
  
  // Mock function for completing chapter - in real implementation, this would call an API
  const completeChapter = () => {
    console.log('Chapter completed:', chapterDetails.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold">{chapterDetails.title}</h1>
        <Badge variant="outline" className={isCompleted ? "text-success border-success" : "text-muted-foreground"}>
          {isCompleted ? 'Watched' : 'Not Watched'}
        </Badge>
      </div>
      
      {chapterDetails.description && (
        <p className="text-muted-foreground mb-6">{chapterDetails.description}</p>
      )}
      
      <p className="text-muted-foreground mb-6">Duration: 20 mins</p>
      
      {chapterDetails.links || chapterDetails.file ? (
        <YouTubePlayer
          url={chapterDetails.links || chapterDetails.file || ''}
          completeChapter={completeChapter}
          status={chapterDetails.status}
        />
      ) : (
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <Play className="w-16 h-16 mx-auto mb-4" />
            <p>Video Content</p>
            <p className="text-sm opacity-75">20 mins</p>
          </div>
        </div>
      )}
      
      {!isCompleted && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={completeChapter}
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Mark as Watched
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoContent; 