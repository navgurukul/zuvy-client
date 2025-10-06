// AddVideo
export interface ContentDetailVideo {
    title: string
    description: string
    links: string[]
    file: any
    content: any
}

export interface EditChapterResponse {
  status: string;     
  message: string;
}

export interface chapterDetailsVideo{
    title: string
    description: string
    links: string[]
}


export type Content = {
  id: number
  title: string
  moduleId: number
  topicId: number
  order: number
  contentDetails: ContentDetailVideo[]
}

export type AddVideoProps = {
  moduleId: string
  courseId: any 
  content: Content
  fetchChapterContent: (chapterId: number, topicId: number) => Promise<void>
}

// PreviewVideo
export type PreviewProps = {
    content: any
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}


// ModuleVideoType.ts

export interface ContentDetail {
  links: string[];
  title?: string;
  description?: string | null;
  file?: string | null;
  content?: string | null;
}



