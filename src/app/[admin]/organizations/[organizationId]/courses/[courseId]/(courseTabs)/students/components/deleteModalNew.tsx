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
import { fetchBatchStudentsHandler } from '@/utils/admin'
import {
    getStoreStudentDataNew,
    getStoreStudentData,
    getIsRowSelected,
} from '@/store/store'
import{DeleteAlertDialogProps} from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType"
import { useParams } from 'next/navigation'
import { useDeleteStudent } from '@/app/[admin]/hooks/useDeleteStudent'

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

    const { deleteStudent } = useDeleteStudent()

    async function deleteStudentHandler(userId: any, bootcampId: any) {
        await deleteStudent(userId, bootcampId, {
            onSuccess: () => {
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
            }
        })
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
