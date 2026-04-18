export interface CurriculumItem {
    id: number
    name: string
    description: string
    order: number
    timeAlloted: number
    quizCount: number
    assignmentCount: number
    codingProblemsCount: number
    articlesCount: number
    typeId: number
    projectId: number
    ChapterId: number
    isStarted?: boolean
}

export interface ModuleData {
    id: number
    name: string
    description: string
    type: string
    timeAlloted: number
    typeId: number
}

export interface PermissionsType {
    createModule: boolean
    deleteModule: boolean
    editModule: boolean
    viewModule: boolean
}
