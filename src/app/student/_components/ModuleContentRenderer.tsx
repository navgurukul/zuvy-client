'use client';
import { useState } from "react";
import useChapterDetails from "@/hooks/useChapterDetails";

// Import the new chapter content components
import VideoContent from "./chapter-content/VideoContent";
import ArticleContent from "./chapter-content/ArticleContent";
import CodingChallengeContent from "./chapter-content/CodingChallengeContent";
import QuizContent from "./chapter-content/QuizContent";
import AssignmentContent from "./chapter-content/AssignmentContent";
import AssessmentContent from "./chapter-content/AssessmentContent";
import FeedbackFormContent from "./chapter-content/FeedbackFormContent";
import LiveClassContent from "./chapter-content/LiveClassContent";
import {StudentDashboardSkeleton} from "@/app/student/_components/Skeletons"

// Fallback imports for backward compatibility

import {ModuleContentRendererProps} from "@/app/student/_components/componentStudentType"
import AdaptiveAssessementStudentView from "./chapter-content/AdaptiveAssessementStudentView";
import {  useParams, useSearchParams } from "next/navigation";

const ModuleContentRenderer = ({ selectedItemData, onChapterComplete }: ModuleContentRendererProps) => {
  // States for fallback functionality
  const chapterId = selectedItemData?.item?.id || null;
  const { courseId, moduleId } = useParams();
  const parsedCourseId = Number(courseId);
  const parsedModuleId = Number(moduleId);
  const parsedChapterId = chapterId ? Number(chapterId) : null;



  // Get the chapter ID from selectedItemData
  
  // Fetch chapter details using the new hook
  const { chapterDetails, loading, error , refetch} = useChapterDetails(chapterId);

  if (!selectedItemData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-heading font-bold mb-2">Module Content</h1>
        <p className="text-muted-foreground">Select a learning item from the sidebar to view its content</p>
      </div>
    );
  }

  const { item } = selectedItemData;

  // Show loading state when fetching chapter details
if (loading) {
  return<StudentDashboardSkeleton/>;
}

  // Show error state if chapter details failed to load
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-heading font-bold mb-2 text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Render content based on topicId if chapter details are available
  if (chapterDetails) {
    switch (chapterDetails.topicId) {
      case 1:
        // VideoContent expects links as string[]
        const videoChapterDetails = {
          ...chapterDetails,
          links: chapterDetails.links ? [chapterDetails.links] : null
        };
        return <VideoContent chapterDetails={videoChapterDetails} onChapterComplete={onChapterComplete} refetch={refetch} />;
      case 2:
        return <ArticleContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} />;
      case 3:
        return <CodingChallengeContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} />;
      case 4:
        return <QuizContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} />;
      case 5:
        return <AssignmentContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} />;
      case 6:
        return <AssessmentContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} />;
      case 7:
        return <FeedbackFormContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete}/>;
      case 8:
        return <LiveClassContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} refetch={refetch} />;
      case 9:
        return (
          <AdaptiveAssessementStudentView
            chapterDetails={chapterDetails}
            onChapterComplete={onChapterComplete}
            details={{
              chapterId: Number.isNaN(parsedChapterId) ? null : parsedChapterId,
              moduleId: Number.isNaN(parsedModuleId) ? null : parsedModuleId,
              courseId: Number.isNaN(parsedCourseId) ? null : parsedCourseId,
            }}
          />
        )
      default:
    return (
      <div className="max-w-4xl mx-auto ">
            <div className="text-center py-12">
              <h1 className="text-2xl font-heading font-bold mb-2">{chapterDetails.title}</h1>
              <p className="text-muted-foreground">Content type not supported yet (topicId: {chapterDetails.topicId})</p>
          </div>
        </div>
      );
    }
  }

  // Fallback to original implementation for backward compatibility when no chapter details
    return (
      <div className="max-w-4xl mx-auto p-8">
      <div className="text-center py-12">
        <h1 className="text-2xl font-heading font-bold mb-2">{item.title}</h1>
        <p className="text-muted-foreground">Using fallback content renderer</p>
        <p className="text-sm text-muted-foreground mt-2">Chapter details not available</p>
        </div>
      </div>
    );
};

export default ModuleContentRenderer;