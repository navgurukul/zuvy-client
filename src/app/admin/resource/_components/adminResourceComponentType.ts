// import { Dispatch, SetStateAction } from "react";

import { AnyARecord } from "dns";

// AIQuestionCard
export interface Tag{
  tagName: string;
  id:number
  name: string;
}
export interface QuestionCardProps {
    questionId: string | number; 
    question: string
    options: { [key: string]: string }
    correctOption: number
    difficulty: string
    tagId: string | number;
    tags: Tag[];
    handleQuestionConfirm: (questionId: string | number, setDeleteModalOpen: (open: boolean) => void) => void
}

// BulkMcqForm
export type BulkMcqProps = {
    setIsMcqModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// CheckboxAndDeleteCombo
export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
}


// chatTag
export interface newTopicDialogProps {
    newTopic: string
    handleNewTopicChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleCreateTopic: () => void
}

// DropzoneforMcq
export interface DropzoneforMcqProps {
  className?: string
acceptedFiles?: string
  mcqSide: boolean
  mcqData: any // replace with actual type if known
  setMcqData: React.Dispatch<React.SetStateAction<any>>
}


// EditAIQuestion
// export type Question = {
//     questionId: string | number;
//     question: string;
//     options: { [key: number]: string };
//     correctOption: number;
//     tagId: string;
//     difficulty: string;
// }



// EditCodingQuestionForm
export type ParameterType = 'str' | 'int' | 'float' | 'arrayOfnum' | 'arrayOfStr' | 'bool' | 'jsonType';

export interface TestCaseInput {
  id: number | string;
  type: ParameterType;
  parameterType:any
  parameterValue: any;  
  value?: any; 
}
export interface Output {
  type: ParameterType;
  value: string;
}

export interface ExpectedOutput {
  parameterType: ParameterType;
  parameterValue: any;
}


export interface TestCases {
  id: number | string;
  inputs: TestCaseInput[];
   output: Output;
   expectedOutput: ExpectedOutput;

}




// EditMcqForm

export type QuizVariantOption = {
  optionText: string;
};

export type QuizVariant = {
  variantId?: number;
  questionText: string;
  selectedOption: number;
  options: QuizVariantOption[];
};

export type QuizDataType = {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: number;
  variants: QuizVariant[];
};





export type OpenEndedQuestion = {
  id: number;
  question: string;
  questionDescription: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tagId: number;
};





// EditQuizQuestion
export type RequestBodyType = {
    questions: {
        question: string
        options: { [key: number]: string }
        correctOption: number
        tagId: number
        difficulty: string
    }[]
}
export type QuizQuestions = {
  id: number;
  question: string;
  options: (string | undefined)[]
  correctOption: number;
  tagId: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};
export type EditQuizQuestionProps = {
  setStoreQuizData: (data: QuizQuestions[]) => void;
  quizId: number;
};




// McqDeleteComponent
// export type DeleteQuizRequestBody = {
//   questionIds: {
//     id: number | string;
//     type: 'main' | 'variant';
//   }[];
// };


// export interface SelectedRow {
//   original: {
//     id: number | string;
//   };
// }

// export interface TableType {
//   toggleAllPageRowsSelected: (selected: boolean) => void;
// }

// export type MacqDeletedProps = {
//   logSelectedRows: () => SelectedRow[];
//   table: TableType;
// }




// NewCodingProblem
export interface Tags {
  id: number;
  name: string;
  tagName: string;
}


export type InputType = 'int' | 'float' | 'str' | 'bool' | 'arrayOfStr' | 'arrayOfnum';

export interface NewCodingProblemFormProps {
  tags: Tags[]
  setIsDialogOpen: (open: boolean) => void;
  filteredCodingQuestions:any
  setCodingQuestions:any
  selectedOptions?: Record<string, any>; 
  difficulty?: string;
  offset?: number;
  position?: string;
}




// NewMcqForm
export interface NewMcqFormProps {
    tags: Tag[];
    closeModal: () => void;
    setStoreQuizData: (data: any) => void;
    getAllQuizQuesiton:any;
    setIsMcqModalOpen: (open: boolean) => void;
}

export type TransformedMCQ = {
    title: string;
    difficulty: string;
    tagId: number;
    content: string;
    isRandomOptions: boolean;
    variantMCQs: {
        question: string;
        options: Record<number, string>;
        correctOption: number;
    }[];
};


// NewMcqProblem
export type NewMcqProblemTag = {
    label: string
    value: string
    id: number
    name:string
    tagName: string
}

export type NewMcqRequestBodyType = {
    quizzes: {
        tagId: number
        difficulty: string
        variantMCQs: {
            question: string
            options: { 1: string; 2: string; 3: string; 4: string }
        }[]
    }[]
}



export interface NewMcqProblemFormProps {
  tags: NewMcqProblemTag [];
  closeModal: () => void;
  setStoreQuizData:any;
  getAllQuizQuesiton:any;
  setIsMcqModalOpen: (open: boolean) => void;
  setMcqType: (type: string) => void;
}



// NewOpenEndedQuestionForm
export interface NewOpenEndedQuestionFormProps {
  tags: Tags[];
  setIsDialogOpen: (value: boolean) => void;
  filteredOpenEndedQuestions:any;
  setOpenEndedQuestions: any;
  selectedOptions?: Record<string, any>; 
  difficulty?: string;
  offset?: number;
  position?: string;
}




export interface DialogBoxProps {
    show: boolean
    onClose: () => void
    title: string
    message: string
    quizQuestionId: number
}


export interface PreviewBoxQuizVariant {
  id: number | string
  question: string
}

export interface PreviewBoxQuizVariantData {
  quizVariants: PreviewBoxQuizVariant[]
  difficulty: string
  tagName: string
}
