export type EditorDoc = {
  type: string;
  content: any[];
};

export interface ArticleContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    articleContent: string | null;
    links: string | null;
  };
  onChapterComplete: () => void;
}


// AssessmentContent
export interface AssessmentContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    assessmentId: number | null;
    moduleId: number;
  };
  onChapterComplete?: () => void;
}


// AssignmentContent
export interface AssignmentContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    articleContent: string | null;
    links: string | null;
  };
  onChapterComplete: () => void;
}




// CodingChallengeContent
export interface CodingQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tagName?: string;
  status: string;
}

export interface CodingChallengeContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
  };
  onChapterComplete: () => void;
  fetchChapters?: () => void;
}




// CodingChallengeResult
export interface QuestionDetail {
    title: string;
    description: string;
    difficulty: string;
}

export interface SubmissionResult {
    questionId: number;
    result: {
        status: string; 
        questionDetail: QuestionDetail;
        createdAt: string;
        TestCasesSubmission: Array<{
            status: string;
            [key: string]: any;
        }>;
    };
}

export interface CodingChallengeResultProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
  };
  submissionResults: SubmissionResult[];
}


// FeedbackFormContent
export interface FeedbackFormContentProps {
    chapterDetails: {
        id: number
        title: string
        description: string | null
        status: string
        moduleId: number
    }
    onChapterComplete: () => void
}



// LiveClassContent
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
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    sessions?: Session[];
  };
  onChapterComplete: () => void;
}



// QuizContent
export interface QuizContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
  };
  onChapterComplete: () => void;
}

export interface QuizTrackingData {
  chosenOption: number;
}

export interface Question {
  id: number;
  question: string;
  typeId: number;
  options: Record<string, string>;
  correctOption: number;
  answer?: string;
  marks?:number
  difficulty:string
  quizTrackingData?: QuizTrackingData[];
}




// VideoContentProps 
export interface VideoContentProps {
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