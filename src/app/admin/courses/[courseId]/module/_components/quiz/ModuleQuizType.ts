export interface QuizProps{
  content: any;
  moduleId: string;
  chapterId: number;
  courseId:any
  activeChapterTitle: string;
}

export interface QuizData{
  id: number;
  question: string;
  typeId: number;
  isRequired: boolean;
  options: string[]; 
}



export interface QuizDataLibrary{
    id: number
    question: string
    options: LibraryOptions
    correctOption: string
    marks: number
    difficulty: string
    tagId: number
}

export interface LibraryOptions{
    option1: string
    option2: string
    option3: string
    option4: string
}

export interface LibraryOption{
    tagName: string
    id: number
}




export interface QuizListVariant {
  question: string;
}

export interface QuizListQuestion{
  question: string;
  id: number;
  quizVariants: QuizListVariant[];
  difficulty: string;
  tagId: number;
}

export interface QuizListTag {
  id: number;
  tagName: string;
}
