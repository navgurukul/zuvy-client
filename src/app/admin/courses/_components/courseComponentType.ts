export interface newCourseDialogProps {
    newCourseName: string
    newCourseDescription: string
    handleNewCourseNameChange: (
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
    description?: string
    collaborator?: string
}