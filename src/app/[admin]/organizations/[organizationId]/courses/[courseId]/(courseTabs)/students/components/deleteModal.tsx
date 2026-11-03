import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { fetchStudentsHandler } from '@/utils/admin'
import { AlertCircle } from 'lucide-react'
import {
    getStoreStudentDataNew,
    getIsRowSelected,
} from '@/store/store'
import { DeleteModalDialogProps } from './courseStudentComponentType'
import { useDeleteStudent } from '@/app/[admin]/hooks/useDeleteStudent'

export const DeleteModalDialog: React.FC<DeleteModalDialogProps> = ({
    title,
    description,
    userId,
    bootcampId,
    isOpen,
    onClose,
    setSelectedRows, // Add this parameter
}) => {
    const { deleteStudent, isDeleting } = useDeleteStudent()
    const { isRowUnSelected, setIsRowUnSelected } = getIsRowSelected()
    const {
        setStudents,
        setTotalPages,
        setLoading,
        offset,
        setTotalStudents,
        setCurrentPage,
        limit,
        search,
    } = getStoreStudentDataNew()

    async function deleteStudentHandler() {
        await deleteStudent(userId, bootcampId, {
            onSuccess: () => {
                fetchStudentsHandler({
                    courseId: String(bootcampId),
                    limit,
                    offset,
                    searchTerm: search,
                    setLoading,
                    setStudents,
                    setTotalPages,
                    setTotalStudents,
                    setCurrentPage,
                })
                setIsRowUnSelected(!isRowUnSelected)
                
                // Clear selected rows after successful deletion
                if (setSelectedRows) {
                    setSelectedRows([])
                }
                
                if (onClose) {
                    onClose()
                }
            }
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    {title}
                </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className='hover:bg-primary-light' disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={deleteStudentHandler}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteModalDialog
