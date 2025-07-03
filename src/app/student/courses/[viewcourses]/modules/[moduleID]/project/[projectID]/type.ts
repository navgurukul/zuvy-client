export interface  Params{
  viewcourses: string
  moduleID: string
  projectID: string
}

export interface Crumb {
  crumb: string
  href?: string
  isLast: boolean
}

export interface ProjectsProps{
  moduleId:  number
  projectId: number
  bootcampId: number
}
export interface ModuleDetails {
  id: number
  name: string
  isLock: boolean
}