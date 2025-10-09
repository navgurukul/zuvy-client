'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
import { useAllUsers } from '@/hooks/useAllUsers'

interface DeleteUserProps {
    title: string
    description: string
    userId: any
}

export const DeleteUser: React.FC<DeleteUserProps> = ({
    title,
    description,
    userId,
}) => {

    const { refetchUsers } = useAllUsers({
        limit: 10,
        searchTerm: '',
        offset: 0,
    })
    async function deleteUserHandler(userId: any) {

        try {
            await api.delete(`/users/deleteUser/${userId}`).then((res) => {
                toast.success({
                    title: 'User Deleted Successfully!',
                    description: res.data.message,
                })
            }
        )
        await refetchUsers(0)
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-white text-red-400">
                    <Trash2 />
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
                    <AlertDialogCancel className="!text-gray-600 hover:border-[rgb(81,134,114)]">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-500"
                        onClick={() => deleteUserHandler(userId)}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteUser
