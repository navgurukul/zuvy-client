export type Tag = {
    id: number
    tagName: string
}

export interface Option {
    label: string
    value: string
}

export interface SearchSuggestion {
    id: number
    title: string
    difficulty: string
}