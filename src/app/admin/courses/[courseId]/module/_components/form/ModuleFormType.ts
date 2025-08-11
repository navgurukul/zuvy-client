export type FormSectionProps = {
    item: any
    index: any
    form: any
    deleteQuestion: any
    formData: any
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
}

export interface chapterDetails {
    title: string
    description: string
}