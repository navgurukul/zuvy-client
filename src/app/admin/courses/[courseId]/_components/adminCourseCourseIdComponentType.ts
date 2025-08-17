

// AddStudentsModal
export type AddStudentsModalProps = {
  id: number;
  message: boolean;
  batch: boolean;
  batchId: number | string; 
  fetchBatchesData?:any; 
  batchData?: boolean;
  studentData: { name: string; email: string };
  setStudentData: (data: { name: string; email: string }) => void;
};



// AssesmentComponent
export type AssesmentComponentProps = {
    title: string
    codingChallenges: number
    mcq: number
    openEnded: number
    studentsSubmitted: number
    totalSubmissions: number
    id: number
    bootcampId: number
    qualifiedStudents: number
    onDownloadPdf: () => void
    onDownloadCsv: () => void
}


// Assessment.txs
export type ModuleAssessmentcourse = {
    id: number
    title: string
}

export type ModuleProps = {
    courseId: number
    name: string
    moduleAssessments: ModuleAssessmentcourse[]
}



// ClassCard.tsx

export type ClassDatas = {
    isZoomMeet: boolean | undefined;
    id: number
    chapterDeadline:string
    name: string
    chapterTitle:string
    chapterId:string
    s3link:string
    moduleName:string
    title:string
    startTime: string
    endTime: string
    instructor: string
    meetingId: string
    bootcampName:string
    bootcampId:string
    moduleId:string
    description:string
    hangoutLink: string
}


// export type GetClassesFunction = () => void | Promise<void>

export type ClassCardProps = {
    classData: ClassDatas
    classType: string
    getClasses: any
    activeTab: string
    studentSide: boolean
}


// CurricullamCard.tsx
export type CurricullamCardProps = {
    value: any
    isStarted?: boolean
    editHandle: any
    index: number
    moduleId: number
    courseId: number
    name: string
    order: number
    description: string
    quizCount: number
    assignmentCount: number
    timeAlloted: number
    codingProblemsCount: number
    articlesCount: number
    typeId: number
    fetchCourseModules: () => void
    projectId: number
    chapterId: number
    setDraggedModuleId: React.Dispatch<React.SetStateAction<number | null>>
    onDragStart?: () => void
    onDragEnd?: () => void
    showBorderFlash?: boolean
}


// DeleteConfirmationModal.tsx
export interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    modalTitle?: string
    modalText?: string
    buttonText?: string
    input: boolean
    modalText2?: string
    instructorInfo?: any
    loading?: boolean
}

// DescriptionHandle.tsx
export interface ShowMoreProps {
    description?: string 
}


// dropzone
export type StudentData = {
    id?: number
    name?: string
    email?: string
    length?:number
}
export type DropzoneProps = {
    studentData?: StudentData
    className: string
    setStudentData: any
    acceptedFiles?: any
}




// EditModuleDialog
export interface editModuleDialogProps {
    moduleData: {
        name: string
        description: string
    }
    timeData: {
        days: number
        months: number
        weeks: number
    }
    editMode: any
    handleModuleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    editModule: () => void
    createModule: () => void
    handleTimeAllotedChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    typeId: number

}

//  FormComponent
export type FormComponentProps = {
    bootcampId: number
    moduleId: number
    data: any
    moduleName: string
    debouncedSearch: string
}


// IndividuleStudent
export type IndividuleStudentProps = {
    title: string
    studentsSubmitted: number
    totalSubmissions: number
    timetaken: number
    copyPaste: string
    tabChanges: string
}

// ToggleSwitch
// export interface ToggleSwitchProps {
//     bootcampId: 
//     onToggle: (newState: boolean) => void;
// }


// newModuleDialog
export interface newModuleDialogProps {
    moduleData: {
        name: string
        description: string
    }
    timeData: {
        days: number
        months: number
        weeks: number
    }
    handleModuleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    createModule: () => void
    handleTimeAllotedChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    handleTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    typeId: number
    isOpen: any
    setIsLoading: (loading: boolean) => void
    isLoading: boolean
}


// OverviewComponent
export type OverviewComponentProps = {
    totalCodingChallenges: number
    correctedCodingChallenges: number
    correctedMcqs: number
    totalCorrectedMcqs: number
    openEndedCorrect: number
    totalOpenEnded: number
    totalScore: number
    score: number
    codingScore: number
    copyPaste: any
    tabchanges: number
    embeddedSearch: number
    submissionType: string
    proctoringData: any
    eyeMomentCount: number
    mcqScore:number
    fullScreenExit: number
    totalCodingScore:number
    totalMcqScore:number
    openEndedScore: number
    totalOpenEndedScore:number
}




export type PraticeProblemProps = {
    courseId: number
    name: string
    totalStudents: number
    submission: any[]
    moduleId: number
}



// RecordingCard
export interface StudentsInfo {
    total_students: number
    present: number
    s3link: string
}
export interface DisplayAttendance {
    status: string
    message: string
    studentsInfo: StudentsInfo
}

// SubmissionComponent
export type SubmissionComponentProps = {
    title: string
    studentsSubmitted: number
    totalSubmissions: number
    courseId: number
    id: string
    moduleId: any
    chapterId: number
    questionId: number
}



// SwitchSetting
export interface BootcampSetting {
  type: string;
}

export interface ApiResponse {
  bootcampSetting: BootcampSetting[];
}

export interface ToggleSwitchProps {
    onToggle: (isChecked: boolean) => void
    bootcampId: string
}