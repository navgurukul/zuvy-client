

export interface Chapter{
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order?: number
}


export interface ChapterResponse {
  chapterWithTopic: Chapter[]
  moduleName: string
}


export interface QuizOptions{
    option1: string
    option2: string
    option3: string
    option4: string
}

export interface QuizQuestionDetails{
    id: number
    question: string
    options: QuizOptions
    correctOption: string
    marks: null | number
    difficulty: string
    tagId: number
}



// Combobox.tsx
export interface ComboboxProps {
    data: any
    title: string
    onChange: (selectedValue: string) => void
    initialValue?: string
    isDisabled?: boolean
    batch: boolean
    batchChangeData: any
}
export interface Option{
  value: string
  label: string
}


// MultiSelectorProps////

export interface MultiSelectorProps {
  selectedCount: number
  options: Option[]
  selectedOptions: Option[]
  handleOptionClick: (option: Option) => void
  type: string
}
