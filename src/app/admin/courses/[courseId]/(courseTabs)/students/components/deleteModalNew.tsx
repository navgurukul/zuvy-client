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
import { useStudentData } from './useStudentData'
import { fetchStudentsHandler } from '@/utils/admin'

interface AlertDialogProps {
    title: string
    description: string
    userId: number
    bootcampId: any
}

export const AlertDialogDemo: React.FC<AlertDialogProps> = ({
    title,
    description,
    userId,
    bootcampId,
}) => {
    const {
        limit,
        search,
        offset,
        setLoading,
        setStudents,
        setTotalPages,
        setTotalStudents,
        setCurrentPage,
    } = useStudentData(bootcampId)
    const handleDelete = async () => {
        try {
            await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
                toast({
                    title: 'Success',
                    description: res.data.message,
                })
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
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                className: 'text-start capitalize border border-destructive',
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
                        onClick={handleDelete}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertDialogDemo
