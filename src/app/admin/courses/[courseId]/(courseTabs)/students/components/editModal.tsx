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
import { Pencil } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import { getStoreStudentDataNew } from '@/store/store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface AlertDialogProps {
    name: string
    email: string
    userId: number
    bootcampId: number
}

interface Student {
    email: string
    name: string
}

export const EditModal: React.FC<AlertDialogProps> = ({
    name,
    email,
    userId,
    bootcampId,
}) => {
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

    const [studentData, setStudentData] = useState<Student | any>({
        email: email || '',
        name: name || '',
    })

    const handleSingleStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData({ ...studentData, [name]: value })
    }

    async function deleteStudentHandler(userId: any, bootcampId: any) {
        try {
            await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
                toast({
                    title: res.data.status,
                    description: res.data.message,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
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
                    <Pencil />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Student Details</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="">
                    <div className="text-left">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={studentData.name}
                            onChange={handleSingleStudent}
                        />
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            value={studentData.email}
                            onChange={handleSingleStudent}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        className="gap-x-2"
                        onClick={() => deleteStudentHandler(userId, bootcampId)}
                    >
                        Edit
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default EditModal
