
// ArticleContent
// type EditorContentItem = {
//   type: string;
//   content?: {
//     text?: string;
//   }[];
// };

import LiveClass from "@/app/admin/courses/[courseId]/module/_components/liveClass/LiveClass";
import CodingChallenge from "../CodingChallenge";
import CodingChallengeResult from "./CodingChallengeResult";
import FeedbackFormContent from "./FeedbackFormContent";
import LiveClassContent from "./LiveClassContent";
import QuizContent from "./QuizContent";
import VideoContent from "./VideoContent";


// export type EditorDoc = {
//   type: string;
//   content: EditorContentItem[];
// };



type EditorInnerContentItem = {
  type: string;
  text?: string;
};

type EditorContentItem = {
  type: string;
  content?: EditorInnerContentItem[];
};

export type EditorDoc = {
  type: string;
  content: EditorContentItem[];
};


export interface ArticleContentProps {
  chapterDetails: ArticleChapterDetails;
  onChapterComplete: () => void;
}


export interface BaseChapterDetails{
  id: number;
  title: string;
  description: string | null;
  status: string;
  moduleId: number;
  sessions?: Session[];
}
export interface ArticleChapterDetails extends BaseChapterDetails {
  articleContent: string | null;
  links: string | null;
}


// AssessmentContent
export interface AssessmentChapterDetails extends BaseChapterDetails {
  assessmentId: number | null;
  // moduleId: number;
}

export interface AssessmentSubmission {
  id: number;
  startedAt?: string;
  submitedAt?: string;
  isPassed?: boolean;
  marks?: number;
  percentage?: number;
  reattemptRequested?: boolean;
  reattemptApproved?: boolean;
  userId?: number;
}


export interface AssessmentDetails {
  assessmentId: number;
  totalCodingQuestions: number;
  totalMcqQuestions: number;
  totalOpenEndedQuestions: number;
  passPercentage: number;
  startDatetime?: string;
  endDatetime?: string;
  assessmentState?: string;
  submitedOutsourseAssessments?: AssessmentSubmission[];
}



export interface AssessmentContentProps {
  chapterDetails: AssessmentChapterDetails;
  onChapterComplete?: () => void;
}




// AssignmentContent.tsx
export interface AssignmentChapterDetails extends BaseChapterDetails {
  articleContent: string | null;
  links: string | null;
}
export interface AssignmentContentProps {
  chapterDetails: AssignmentChapterDetails;
  onChapterComplete: () => void;
}




// CodingChallengeContent.tsx


export interface CodingQuestion extends BaseChapterDetails {
  difficulty: string;
  tagName?: string;
}


export interface CodingChallengeContentProps{
  chapterDetails: CodingQuestion
  onChapterComplete: () => void;
  fetchChapters?: () => void;
}



// CodingChallengeResult.tsx
export interface QuestionDetail extends BaseChapterDetails {
   difficulty: string;
}

interface SubmissionResult {
    questionId: number;
    result: {
        status: string;
        questionDetail: QuestionDetail;
    };
}

export interface CodingChallengeResultProps {
  chapterDetails:QuestionDetail
  submissionResults: SubmissionResult[];
}




// FeedbackFormContent.tsx
export interface FeedbackFormContentProps {
    chapterDetails:BaseChapterDetails
    onChapterComplete: () => void
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: { [key: string]: string };
  typeId: number;
  answer?: string;
  correctOption: number;
  difficulty?: string;
  marks?: number;
  quizTrackingData?: {
    chosenOption: number;
  }[];
}

export interface QuizChapterDetails extends BaseChapterDetails {
  questions: QuizQuestion[];
}




// LiveClassContent.tsx

export interface Session {
  id: number;
  meetingId: string;
  hangoutLink: string;
  startTime: string;
  endTime: string;
  title: string;
  s3link: string;
  status: string;
  attendance: string;
  duration: number;
}

export interface LiveClassContentProps {
  chapterDetails: BaseChapterDetails
  onChapterComplete: () => void;
}


// QuizContent.tsx
export interface QuizContentProps {
  chapterDetails:BaseChapterDetails
  onChapterComplete: () => void;
}



// VideoContent.tsx
export interface VideoContentProps{
    chapterDetails: {
        id: number
        title: string
        description: string | null
        status: string
        file: string | null
        links: string[] | null
    }
    onChapterComplete: () => void
}