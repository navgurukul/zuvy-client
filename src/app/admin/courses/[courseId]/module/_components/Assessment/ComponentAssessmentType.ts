import SettingsAssessment from "./SettingsAssessment"

//  AddAssessment
export type AddAssessmentProps = {
    chapterData: any
    content: any
    fetchChapterContent: (chapterId: number, topicId: number) => void
    moduleId: string
    topicId: number
    activeChapterTitle: string
}

export type Tag = {
    id: number
    tagName: string
}


// codingQuestion
export interface CodingTestCase {
    id: number
    inputs: {
        parameterName: string
        parameterType: string
        parameterValue: any
    }[]
    expectedOutput: {
        parameterType: string
        parameterValue: any
    }
}

export interface CodingQuestiones {
    id: number
    title: string
    description: string
    difficulty: string
    tagId: number
    constraints: string
    testCases:CodingTestCase[]
    expectedOutput: number[]
    createdAt: string
}

export interface  codingQuestionProps{
questions: CodingQuestiones[]
    setSelectedQuestions: React.Dispatch<React.SetStateAction<CodingQuestiones[]>>
    selectedQuestions: CodingQuestiones[]
    tags: any
    setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
}



export interface OpenEndedQuestiones {
    id: number
    question: string
    difficulty: string
    tagId: number
    marks: number
    usage: number
}

export interface OpenEndedQuestionesProps{
    questions: OpenEndedQuestiones[]
    setSelectedQuestions: React.Dispatch<
        React.SetStateAction<OpenEndedQuestiones[]>
    >
    selectedQuestions: OpenEndedQuestiones[]
    tags: any
}


export interface CodingQuestionsProps{
    questions: MCQQuestion[]
    setSelectedQuestions: React.Dispatch<React.SetStateAction<MCQQuestion[]>>
    selectedQuestions: MCQQuestion[]
    tags: any
    setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
    type:string
}



export interface setSelectedCodingQuestionsProps{
setSelectedQuestions: React.Dispatch<React.SetStateAction<any[]>>
    selectedQuestions: any[]
    tags: any
    type: string
    setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
}


export interface SelectTag {
  id: number;
  tagName: string;
}

export interface SelectQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard'; 
  tagId: number;
  question:string
}


// SelectOpenEndedQuestions
export interface QuestionComponentProps {
  selectedCodingQuestions: Question[];
  selectedQuizQuestions: Question[];
  selectedOpenEndedQuestions: Question[];
  setSelectedCodingQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setSelectedQuizQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setSelectedOpenEndedQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  questionType: string;
  tags: Tag[];
  setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>;
}


export interface selectedOpenEndedQuestionsProps{
  setSelectedQuestions: React.Dispatch<React.SetStateAction<any[]>>
    selectedQuestions: any[]
    tags: any
    type: string
}









export interface MCQQuestion{
    id: number;
    title: string;
    description: string;
    tagId: number
    quizVariants: any
    question: string
    options: string[];
    difficulty: string;
}

export interface CodingQuestion {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    constraints: string;
    testCases: {
        id: number;
        inputs: {
            parameterName: string;
            parameterType: string;
            parameterValue: any;
        }[];
        expectedOutput: {
            parameterType: string;
            parameterValue: any;
        };
    }[];
}

export interface OpenEndedQuestion {
    id: number;
    title: string;
    description: string;
    difficulty: string;
}

export type Question = CodingQuestion | MCQQuestion | OpenEndedQuestion;

export interface QuestionDescriptionModalProps {
    question: Question;
    type: 'coding' | 'mcq' | 'open-ended';
    tagName?: string;
}


// SelectQuizQuestions
export interface SelectQuizMCQQuestion{
    id: number
    question: string
    options: Record<string, string>
    correctOption: number
    marks: number | null
    difficulty: string
    tagId: number
    usage: number
}





// SettingsAssessment
export type SettingsAssessmentProps = {
  selectedCodingQuesIds: number[];          
  selectedQuizQuesIds: number[];            
  selectedOpenEndedQuesIds: number[];
  selectedCodingQuesTagIds: number[];       
  selectedQuizQuesTagIds: number[];
  content:any;                  
  fetchChapterContent: any;
    chapterTitle: string
    saveSettings: boolean
    setSaveSettings: (value: boolean) => void
    setQuestionType: (value: string) => void
    selectCodingDifficultyCount: any
    selectQuizDifficultyCount: any
    topicId: number
    isNewQuestionAdded: boolean
    setIsNewQuestionAdded: (value: boolean) => void
    setChapterTitle: (value: string) => void
}
