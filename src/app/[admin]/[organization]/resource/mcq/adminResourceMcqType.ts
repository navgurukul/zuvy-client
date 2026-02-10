export type PageTag = {
    label: string
    value: string
    id: number
    tagName: string
}

export interface PageOption {
    label: string
    value: string
}

export interface PageSearchSuggestion {
    id: string
    question: string
    topic: string
    type: 'question' | 'topic'
}