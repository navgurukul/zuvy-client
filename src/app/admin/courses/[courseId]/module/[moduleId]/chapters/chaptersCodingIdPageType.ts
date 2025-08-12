export interface ChaptersQuizOptions {
    option1: string
    option2: string
    option3: string
    option4: string
}

export interface ChaptersQuizQuestionDetails {
    id: number
    question: string
    options: ChaptersQuizOptions
    correctOption: string
    marks: null | number
    difficulty: string
    tagId: number
}