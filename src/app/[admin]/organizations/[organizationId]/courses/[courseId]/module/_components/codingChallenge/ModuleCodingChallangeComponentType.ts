import { AnyARecord } from "node:dns"

export interface ChallangesExample {
    input: number[]
    output: number[]
}

export interface CodingChallangesQuestion{
    tagId: number
    id: number
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    inputBase64: string | null
    examples: ChallangesExample[]
    testCases: ChallangesExample[]
    expectedOutput: number[]
    solution: string
    createdAt: string
    updatedAt: string
}
export interface ContentDetailChallanges{
    title: string
    description: string | null
    links: string | null
    file: string | null
    content: string | null
}
export interface ChallangesContent {
    id: number
    moduleId: number
    topicId: number
    order: number
    contentDetails: ContentDetailChallanges[]
}
export interface CodeProps {
    content: ChallangesContent
}



export interface ChallangesProps{
    content: any
    activeChapterTitle: string
    moduleId: string
    courseId: any
    canEdit?: boolean
}


// CodingTopics.tsx
export interface CodingTopicsProps{
    setSearchTerm: (newSearchTerm: string) => void
    searchTerm: string
    tags: CodingTopicsTag[]
    selectedTopics: CodingTopicsTag[]
    setSelectedTopics: React.Dispatch<React.SetStateAction<CodingTopicsTag[]>>
    selectedDifficulties: string[]
    setSelectedDifficulties: React.Dispatch<React.SetStateAction<string[]>>
    canEdit?: boolean
}

export type CodingTopicsTag = {
    id: number
    tagName: string
}


export interface CodingTopicsProps{
  selectedQuestions:any;
  setSelectedQuestions: any;
  content:any;
  moduleId: string;
  chapterTitle: string;
  tags: CodingTopicsTag[];
  canEdit?: boolean
}