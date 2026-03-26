export interface ProjectDataProject {
    id: number
    title: string | null
    instruction: string | null
    isLock: boolean
    deadline: string | null
}
export interface ProjectData {
    status: string
    code: number
    project: ProjectDataProject[]
    bootcampId: number
    moduleId: number
}