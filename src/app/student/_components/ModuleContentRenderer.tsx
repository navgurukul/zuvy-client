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

// Fallback imports for backward compatibility
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Play, Check, Calendar as CalendarIcon, Clock } from "lucide-react";
import AssessmentView from "./AssessmentView";
import CodingProblemPage from "./CodingProblemPage";

interface ModuleContentRendererProps {
  selectedItemData: { item: any; topicId: string } | null;
  getAssessmentData: (itemId: string) => any;
  onChapterComplete: () => void;
}

const ModuleContentRenderer = ({ selectedItemData, getAssessmentData, onChapterComplete }: ModuleContentRendererProps) => {
  // States for fallback functionality
  const [showCodingProblem, setShowCodingProblem] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>(new Array(5).fill(''));
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackAnswers, setFeedbackAnswers] = useState({
    mcq: '',
    checkbox: [] as string[],
    text: '',
    date: null as Date | null,
    time: ''
  });
  const [assignmentLink, setAssignmentLink] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Get the chapter ID from selectedItemData
  const chapterId = selectedItemData?.item?.id || null;
  
  // Fetch chapter details using the new hook
  const { chapterDetails, loading, error } = useChapterDetails(chapterId);

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
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-heading font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Fetching chapter content</p>
        </div>
      </div>
    );
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
        return <VideoContent chapterDetails={videoChapterDetails} onChapterComplete={onChapterComplete} />;
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
        return <LiveClassContent chapterDetails={chapterDetails} onChapterComplete={onChapterComplete} />;
      default:
    return (
      <div className="max-w-4xl mx-auto p-8">
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