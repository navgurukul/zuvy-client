import EditAIQuestion from "./EditAIQuestion";

// AIQuestionCard
export interface Tag{
  tagName: string;
  id:number
}
export interface QuestionCardProps {
    questionId: string | number; 
    question: string
    options: { [key: string]: string }
    correctOption: number
    difficulty: string
    tagId: string | number;
    tags: Tag[];
    handleQuestionConfirm: (questionId: string | number, setDeleteModalOpen: (open: boolean) => void) => void
}

// BulkMcqForm
export type BulkMcqProps = {
    setIsMcqModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// CheckboxAndDeleteCombo
export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
}


// chatTag
export interface newTopicDialogProps {
    newTopic: string
    handleNewTopicChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleCreateTopic: () => void
}

// DropzoneforMcq
export interface DropzoneforMcqProps {
  className?: string
acceptedFiles?: string
  mcqSide: boolean
  mcqData: any // replace with actual type if known
  setMcqData: React.Dispatch<React.SetStateAction<any>>
}


// EditAIQuestion
// export type Question = {
//     questionId: string | number;
//     question: string;
//     options: { [key: number]: string };
//     correctOption: number;
//     tagId: string;
//     difficulty: string;
// }
