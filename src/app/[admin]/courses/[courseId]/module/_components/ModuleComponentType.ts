import ChapterModal from "./ChapterModal"
import CodingQuestionCard from "./CodingQuestionCard"
import TimerDisplay from "./TimerDisplay"

// AddLiveClasstoChapter
export type AddLiveClasstoProps = {
    logSelectedRows: () => any[]
    table: any
}

// AssessmentItem
export type AddLiveClass={
 title: string
    topicId: number
    topicName: string
    chapterId: number
    activeChapter: number
    fetchChapterContent: (chapterId: number) => void
    fetchChapters: () => void
    moduleId: string
}

// ChapterItem
export type ChapterItems={
    title: string
    topicId: number
    topicName: string
    chapterId: number
    activeChapter: number
    setActiveChapter: any
    fetchChapters: () => void
    moduleId: string
    activeChapterRef: any
    isChapterClickedRef: any
    chapterData: any
    isLastItem?: boolean
    isDragging?: boolean
    onDragStart: () => void
    onDragEnd: () => void
    showBorderFlash?: boolean
    canDeleteChapter?: boolean
}

// ChapterModal
export interface ChapterModalProps{
 fetchChapters: () => void
    newChapterOrder: number
    courseId: any
    moduleId: any
    scrollToBottom: () => void
    onClose: () => void
}


// CodingQuestionCard
export interface QuestionCardProps {
    id: number
    title: string
    difficulty: string
    description: string
    status: string
    tagName: any
    tagId?: number
    isSuccess?: boolean
    onSolveChallenge: (id: number) => void
}

// CreateLiveClass
export type CreateSessionDialogProps = {
    fetchingChapters: () => void
    onClose: () => void 
}


// ExistingLiveClass
export type ExistingLiveClassProps = {
    fetchingChapters: () => void;
    onClose: () => void;
};


export interface IDEInput{
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

export interface TestCase {
    inputs: IDEInput[] | Record<string, unknown>
    expectedOutput: {
        parameterType: string
        parameterValue: [] | {}
    }
}


export interface IDEProps {
    params: { editor: string }
    onBack?: () => void
    remainingTime?: any
    assessmentSubmitId?: number
    selectedCodingOutsourseId?: any
    getAssessmentData?: any
    runCodeLanguageId?: number
    runSourceCode?: string
}


export interface IDEInput{
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}
export interface questionDetails{
    title: string
    id?: number;
    difficulty?: string;
    description: string
    constraints?: string
    examples: { input: number[]; output: number }
}



// PublicDialog
export type PublishData = {
    publishDateTime?: string | null; 
    startDateTime?: string | null;  
    endDateTime?: string | null;     
    action: 'schedule' | 'publishNow' | 'moveToDraft'; 
  };
  
export type PublishAssessmentDialogs = {
    onSave: (data: PublishData) => void;
    currentAssessmentStatus?: string; 
    initialPublishDate?: string | null;    
    initialStartDate?: string | null;      
    initialEndDate?: string | null;        
};

// TimerDisplay
export interface TimerDisplayProps {
    remainingTime: number
}