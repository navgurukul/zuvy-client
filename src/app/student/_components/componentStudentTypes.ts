// AssesmentHeader.tsx

export interface BaseAssessmentDetails{
  assessmentTitle: string;
  duration?: string;
  onClose: () => void;
}


// export interface BaseAssessmentInfo {
//   title: string;
//   id: string;
//   startDate: Date;
//   endDate: Date;
//   duration: string;
//   totalMarks: number;
//   description: string;
//   status: string;
//   name: string;
// }



export interface BaseAssessmentInfo {
  id: string;
  title: string;      
  name: string;        
  description: string;  
  status: string;       
  startDate?: Date;
  endDate?: Date;
  duration?: string;
  totalMarks?: number;
}

export interface AssessmentHeaderProps extends BaseAssessmentInfo {
  attemptStatus: string;
}


// AssessmentInstructions.tsx
export interface AssessmentInstructionsProps extends BaseAssessmentDetails{
  // onClose: () => void;
}

// export interface CodingChallengeData extends BaseAssessmentInfo {
//   difficulty: string;
//   marks: number;
// }
export type ViolationReason = 'tab-switch' | 'fullscreen-exit' | 'copy-paste';

export interface ViolationType {
  type: ViolationReason;
  count: number;
}


// AssesmentModel.tsx
export interface AssessmentModalProps extends BaseAssessmentDetails{
  isOpen: boolean;
}


// AssesmentStateCard.tsx
export interface AssessmentStateCardProps {
  state: 'scheduled' | 'open' | 'interrupted' | 'reAttemptRequested' | 'completed' | 'expired';
  countdown?: number;
  endDate?: Date;
  score?: number;
  totalMarks?: number;
  passScore: number;
  onReAttemptRequest: () => void;
  onBeginAssessment: () => void;
}



// AssessmentView.tsx

export interface AssessmentData extends BaseAssessmentInfo {
  // id: string;
  passScore: number;
  state: 'scheduled' | 'open' | 'interrupted' | 'reAttemptRequested' | 'completed' | 'expired';
  score?: number;
  attemptStatus: 'Not Attempted' | 'Attempted' | 'Interrupted';
}

export interface AssessmentViewProps {
  assessment: AssessmentData;
}


// CodingChallenge
// export interface CodingChallengeProps extends BaseAssessmentInfo{
//     difficulty: string;
//     marks: number;
//   onBack: () => void;
//   onComplete: () => void;
//   timeLeft: string;
// }


// Add your existing types above

export type CodingChallengeProps = {
  challenge: {
    title: string;
    difficulty: string;
    marks: number;
  };
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
};


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


// MCQQuiz.tsx
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




// ModuleSidebar
// export interface TopicItem extends BaseAssessmentInfo {
//   type: string;
//   scheduledDateTime?: Date;
// }

export type TopicItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  description?: string;
  duration?: string;
  scheduledDateTime?: Date;
};

export interface Topic extends BaseAssessmentInfo{
  items: TopicItem[];
}

export interface Module extends BaseAssessmentInfo{
  topics: Topic[];
}

export interface ModuleSidebarProps {
  courseId: string;
  moduleId: string;
  module: Module;
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
}


// ModalContentRender.tsx
export interface ModuleContentRendererProps {
  selectedItemData?: { item: TopicItem; topicId: string } | null;
  getAssessmentData: (itemId: string) => any;
  // chapterDetails: CodingQuestion;
  onChapterComplete: () => void;
}
export interface CodingQuestion{
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard'; 
}


// ModuleNavigation
export interface ModuleNavigationProps {
  prevItem: { item: TopicItem; topicId: string } | null;
  nextItem: { item: TopicItem; topicId: string } | null;
  onItemSelect: (itemId: string) => void;
}



// OpenEndedQuestions.tsx
export interface OpenEndedQuestionsProps {
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
}



// ViolationModal.tsx
export interface ViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  violation: ViolationType | null;
}


