import MCQQuiz from "./MCQQuiz";
import ModuleContentRenderer from "./ModuleContentRenderer";
import TruncatedDescription from "./TruncatedDescription";

// AssessmentHeader
export interface AssessmentHeaderProps {
  title: string;
  attemptStatus: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  totalMarks: number;
  description: string;
}


// AssessmentInstructions
export interface AssessmentInstructionsProps {
  assessmentTitle: string;
  duration: string;
  onClose: () => void;
}
export interface ViolationType {
  type: 'tab-switch' | 'fullscreen-exit' | 'copy-paste';
  count: number;
}


// AssessmentModal
export interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentTitle: string;
  duration: string;
}

// AssessmentStateCard
export interface AssessmentStateCardProps {
  state: 'scheduled' | 'open' | 'interrupted' | 'reAttemptRequested' | 'completed' | 'expired';
  countdown?: number;
  endDate: Date;
  score?: number;
  totalMarks: number;
  passScore: number;
  onReAttemptRequest: () => void;
  onBeginAssessment: () => void;
}


// AssessmentView

export interface AssessmentData {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  totalMarks: number;
  passScore: number;
  state: 'scheduled' | 'open' | 'interrupted' | 'reAttemptRequested' | 'completed' | 'expired';
  score?: number;
  attemptStatus: 'Not Attempted' | 'Attempted' | 'Interrupted';
}

export interface AssessmentViewProps {
  assessment: AssessmentData;
}


// CodingChallenge
export interface CodingChallengeProps {
  challenge: {
    title: string;
    difficulty: string;
    marks: number;
  };
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
}


// CodingProblemPage
export interface CodingProblemPageProps {
  problem: {
    title: string;
    difficulty: string;
    topic: string;
    status: string;
  };
  onClose: () => void;
}


// MCQQuiz
export interface MCQQuizProps {
  quiz: {
    title: string;
    difficulty: string;
    marks: number;
  };
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
}


// MobileSideBar
export interface TopicItem {
  id: string;
  title: string;
  type: string;
  status: string;
  duration?: string;
  scheduledDateTime?: Date;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  items: TopicItem[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface ModuleSidebarProps {
  courseId: string;
  moduleId: string;
  module: Module;
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
}

// ModuleContentRenderer
// export interface ModuleContentRendererProps {
//   selectedItemData: { item: TopicItem; topicId: string } | null;
//   getAssessmentData: (itemId: string) => any;
//   onChapterComplete: () => void;
// }



// ModuleNavigation
export interface ModuleNavigationProps {
  prevItem: { item: TopicItem; topicId: string } | null;
  nextItem: { item: TopicItem; topicId: string } | null;
  onItemSelect: (itemId: string) => void;
}

// OpenEndedQuestions
export interface OpenEndedQuestionsProps {
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
}


// TruncatedDescription
export interface TruncatedDescriptionProps {
  text: string;
  maxLength?: number;
  className?: string;
}





// ViolationModal
export interface ViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  violation: ViolationType | null;
}