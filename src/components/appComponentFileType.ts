export interface FileUploaderProps {
  onUpload: (file: File) => void;
  allowedTypes?: string;
}


// ui/chapter.tsx
export interface QuizOptions {
    option1: string
    option2: string
    option3: string
    option4: string
}

export interface QuizQuestionDetails {
    id: number
    question: string
    options: QuizOptions
    correctOption: string
    marks: null | number
    difficulty: string
    tagId: number
}
