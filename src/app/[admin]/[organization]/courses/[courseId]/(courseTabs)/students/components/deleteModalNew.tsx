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
import { fetchBatchStudentsHandler } from '@/utils/admin'
import {
    getStoreStudentDataNew,
    getStoreStudentData,
    getIsRowSelected,
} from '@/store/store'
import{DeleteAlertDialogProps} from "@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType"
import { useParams } from 'next/navigation'

export const AlertDialogDemo: React.FC<DeleteAlertDialogProps> = ({
    title,
    description,
    userId,
    bootcampId,
    batchId,
    fetchStudentData,
    setSelectedRows,
}) => {
    const params = useParams()
    const selectedBatchId = batchId || params.batchId
    
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
                toast.success({
                    title: 'User Deleted Successfully!',
                    description: res.data.message,
                })
                fetchBatchStudentsHandler({
                    courseId: bootcampId,
                    batchId:selectedBatchId,
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
                <Button className="bg-background text-destructive hover:bg-background">
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
                    <AlertDialogCancel className="hover:bg-primary-light">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-500 hover:bg-red-500"
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
