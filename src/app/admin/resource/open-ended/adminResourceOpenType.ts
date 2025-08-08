export type OpenPageTag = {
    id: number
    tagName: string
}

export interface OpenOption {
    label: string
    value: string
}
export interface OpenEndedQuestionType {
    id: number
    question: string
    difficulty: string
    tagId: number
    marks: number | null
    usage: number
}