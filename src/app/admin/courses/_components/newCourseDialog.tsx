import React from 'react'

import { Button } from '@/components/ui/button'
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import styles from './cources.module.css'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface newCourseDialogProps {
    newCourseName: string
    handleNewCourseNameChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    handleCreateCourse: () => void
}

const NewCourseDialog: React.FC<newCourseDialogProps> = ({
    newCourseName,
    handleNewCourseNameChange,
    handleCreateCourse,
}) => {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Course</DialogTitle>
                <div className="py-4">
                    <Label htmlFor="name">Course Name:</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter course name"
                        value={newCourseName}
                        onChange={handleNewCourseNameChange}
                    />
                </div>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button
                        onClick={() => handleCreateCourse()}
                        // className={styles.createCourseBtnDialog}
                    >
                        Create Course
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default NewCourseDialog
