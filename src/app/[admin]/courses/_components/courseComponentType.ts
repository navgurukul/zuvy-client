export interface newCourseDialogProps {
    newCourseName: string
    newCourseDuration: string
    newCourseDescription: string
    handleNewCourseNameChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    handleNewCourseDurationChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    handleNewCourseDescriptionChange: (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => void
    handleCreateCourse: (courseData: CourseData) => void
    isDialogOpen: boolean
}

export interface CourseData {
    name: string
    duration: string
    description?: string
    collaborator?: string
}