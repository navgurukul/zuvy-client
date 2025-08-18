import { QuestionDetails } from "@/utils/types/coding-challenge";
import { QuestionPanel } from "./QuestionPanel";

export interface CodeEditorPanelProps {
    currentCode: string;
    language: string;
    isAlreadySubmitted: boolean;
    editorLanguages: any[];
    onCodeChange: (value: string | undefined) => void;
    onLanguageChange: (language: string) => void;
}

//  ConfirmationModal
export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}


// HeaderBar
export interface HeaderBarProps {
    isAlreadySubmitted: boolean;
    loading: boolean;
    isSubmitting: boolean;
    isCompleting: boolean;
    onBack: () => void;
    onRunCode: () => void;
    onOpenSubmitModal: () => void;
}


// OutputPanelProps
export interface OutputPanelProps {
    loading: boolean;
    codeError: string;
    codeResult: any[];
}


// SubmissionModal
export interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: 'success' | 'error';
    questionTitle: string;
    codeResult: any[];
    onViewSolution: () => void;
    onReturnToCourse: () => void;
}



// QuestionPanel
export interface QuestionPanelProps {
    questionDetails: QuestionDetails;
}