export type FormSectionProps = {
    item: any
    index: any
    form: any
    deleteQuestion: any
    formData: any
    canEdit?: boolean // <-- use this for chapter/section controls
    setIsEditing: (isEditing: boolean) => void
}

export interface FormQuestionDetail {
  id: number | string;
  question: string;
  typeId: number | string;
  isRequired: boolean;
  options?: Record<string, any>;
}

export type AddFormProps = {
    chapterData: any
    content: any
    moduleId: any
    courseId: any
    canEdit?: boolean // <-- permission flag for editability (optional)
}

export interface chapterDetails {
    title: string
    description: string
}