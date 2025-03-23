// types.ts
export interface QuizOption {
    [key: string]: string
}

export interface QuizVariant {
    id: number
    quizId: number
    question: string
    options: QuizOption
    correctOption: number
    variantNumber: number
    createdAt: string
    updatedAt: string
}

export interface QuizData {
    id: number
    title: string
    difficulty: string
    tagId: number
    usage: number
    content: string
    isRandomOptions: boolean | null
    createdAt: string
    updatedAt: string
    quizVariants: QuizVariant[]
}

export interface QuizVariantsTabProps {
    data: QuizData[]
}
