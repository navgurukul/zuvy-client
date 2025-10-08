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
    // const searchParams = useSearchParams()
    // const offsetParam = searchParams.get('offset')
    // const [offset, setOffset] = useState<number>(Number(offsetParam) || OFFSET)
    // const limitParam = searchParams.get('limit')
    // const position: number = Number(limitParam ?? POSITION) || Number(POSITION)
    // const {
    //     refetchUsers,
    // } = useAllUsers({ initialFetch: true, limit: position, searchTerm: '', offset })

    async function deleteUserHandler(userId: any) {
        try {
            await api.delete(`/users/deleteUser/${userId}`).then((res) => {
                toast.success({
                    title: 'User Deleted Successfully!',
                    description: res.data.message,
                })
                // refetchUsers(offset)
            })
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
