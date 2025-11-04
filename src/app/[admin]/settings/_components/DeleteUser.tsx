'use client'

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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

interface DeleteUserProps {
    title: string
    description: string
    userId: any
    onDeleteSuccess?: (userId: any) => void  
}

export const DeleteUser: React.FC<DeleteUserProps> = ({
    title,
    description,
    userId,
    onDeleteSuccess,
}) => {
    const [open, setOpen] = useState(false)  // ✅ Modal control
    const [isDeleting, setIsDeleting] = useState(false)  // ✅ Loading state

    async function deleteUserHandler(userId: any) {
        setIsDeleting(true)
        
        try {
            
            const res = await api.delete(`/users/deleteUser/${userId}`)
            
            toast.success({
                title: 'User Deleted Successfully!',
                description: res.data.message,
            })

            setOpen(false)

            if (onDeleteSuccess) {
                onDeleteSuccess(userId)
            }

        } catch (error: any) {
            toast.error({
                title: 'Failed to Delete User',
                description: error.response?.data?.message || 'An error occurred.',
            })
            
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button 
                    className=" text-red-600 hover:bg-red-200 hover:text-red-600"
                    variant="ghost"
                    size="sm"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            disabled={isDeleting}  // ✅ Disable during delete
                        >
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => deleteUserHandler(userId)}
                        disabled={isDeleting}  // ✅ Disable during delete
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteUser