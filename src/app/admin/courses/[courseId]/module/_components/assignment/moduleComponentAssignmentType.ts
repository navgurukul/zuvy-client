export interface AssignmentContentDetail {
    title: string
    description: string | null
    links: string | null
    file: string | null
    content: string | null
}

export interface AssignmentContent {
    id: number
    moduleId: number
    topicId: number
    order: number
    contentDetails: AssignmentContentDetail[]
}

export type AssignmentContentEditorDoc = {
    type: string
    content: any[]
}

export interface AssignmentProps {
    content: AssignmentContent
    courseId: any
    assignmentUpdateOnPreview: boolean
    setAssignmentUpdateOnPreview: React.Dispatch<React.SetStateAction<boolean>>
}




export interface TextContent {
  type: 'text';
  text: string;
}

export interface ParagraphContent {
  type: 'paragraph';
  content: TextContent[];
}

export interface OtherContent {
  type: string; 
  [key: string]: any;
}

export type DocItem = ParagraphContent | OtherContent;


export interface ContentLink {
  url: string;
  title?: string;
}

export interface ContentDetail {
  content: any
  title: string;
  links?: ContentLink[];
}

export interface ChapterDetailsResponse {
  completionDate: string;
  contentDetails: ContentDetail[];
}


export interface TextNode {
  type: 'text';
  text: string;
}

export interface ParagraphNode {
  type: 'paragraph';
  content?: TextNode[];
}

export interface Doc {
  content: ParagraphNode[];
}

export interface EditorContent {
  doc?: Doc;
}
