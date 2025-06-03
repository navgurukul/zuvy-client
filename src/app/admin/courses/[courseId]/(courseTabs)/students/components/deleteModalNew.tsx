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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import {
    getStoreStudentDataNew,
    getStoreStudentData,
    getIsRowSelected,
} from '@/store/store'

interface AlertDialogProps {
    title: string
    description: string
    userId: any
    bootcampId: number
    fetchStudentData?: any
    setSelectedRows?: any
}

export const AlertDialogDemo: React.FC<AlertDialogProps> = ({
    title,
    description,
    userId,
    bootcampId,
    fetchStudentData,
    setSelectedRows,
}) => {
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

    async function deleteStudentHandler(userId: any, bootcampId: any) {
        try {
            let url = `/student/{userId}/${bootcampId}?`
            url += 'userId=' + userId.join('&userId=')
            await api.delete(url).then((res) => {
                toast({
                    title: 'User Deleted Successfully!',
                    description: res.data.message,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                fetchStudentData && fetchStudentData()
                fetchStudentsHandler({
                    courseId: bootcampId,
                    limit,
                    offset,
                    searchTerm: search,
                    setLoading,
                    setStudents,
                    setTotalPages,
                    setTotalStudents,
                    setCurrentPage,
                })
                // setSelectedRows([])
                setIsRowUnSelected(!isRowUnSelected)
            })
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-500"
                        onClick={() => deleteStudentHandler(userId, bootcampId)}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertDialogDemo
