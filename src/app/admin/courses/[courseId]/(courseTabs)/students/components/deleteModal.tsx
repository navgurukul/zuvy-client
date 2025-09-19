import React, { useState } from 'react'
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
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import { AlertCircle } from 'lucide-react'
import {
    getStoreStudentDataNew,
    getIsRowSelected,
} from '@/store/store'
import { DeleteModalDialogProps } from './courseStudentComponentType'

export const DeleteModalDialog: React.FC<DeleteModalDialogProps> = ({
    title,
    description,
    userId,
    bootcampId,
    isOpen,
    onClose,
    setSelectedRows, // Add this parameter
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
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
        if (isDeleting) return
        
        setIsDeleting(true)
        try {
            let url = `/student/{userId}/${bootcampId}?`
            url += 'userId=' + userId.join('&userId=')
            await api.delete(url).then((res) => {
                toast.success({
                    title: 'User Deleted Successfully!',
                    description: res.data.message,
                })
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
            })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        } finally {
            setIsDeleting(false)
        }
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
                    <AlertDialogCancel disabled={isDeleting}>
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
