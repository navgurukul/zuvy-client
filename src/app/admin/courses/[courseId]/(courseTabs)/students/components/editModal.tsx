import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Check, X } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import { getStoreStudentDataNew } from '@/store/store'
import { getEditStudent, getStudentData } from '@/store/store'
import{ComboxAlertDialogProps} from "@/app/admin/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType"

export const EditModal: React.FC<ComboxAlertDialogProps> = ({
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

    const [isOpen, setIsOpen] = useState(false)
    const { isStudent, setIsStudent } = getEditStudent()
    const { studentData, setStudentData } = getStudentData()

    async function editStudentHandler(userId: number, bootcampId: string) {
        try {
            await api
                .patch(`/bootcamp/updateUserDetails/${userId}`, studentData)
                .then((res) => {
                    toast.success({
                        title: res.data.status,
                        description: res.data.message,
                    })
                    setIsStudent(0)
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
                    setIsOpen(false)
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
        <>
            {isOpen ? (
                <div className="flex gap-1">
                    <Button
                        className="bg-white text-black-400"
                        onClick={() => editStudentHandler(userId, bootcampId)}
                    >
                        <Check />
                    </Button>
                    <Button
                        className="bg-white text-black-400"
                        onClick={() => {
                            setIsOpen(false)
                            setIsStudent(0)
                        }}
                    >
                        <X />
                    </Button>
                </div>
            ) : (
                <Button
                    className="bg-white text-red-400"
                    onClick={() => {
                        setIsOpen(true)
                        setIsStudent(userId)
                        setStudentData({
                            email: email || '',
                            name: name || '',
                        })
                    }}
                >
                    <Pencil />
                </Button>
            )}
        </>
    )
}

export default EditModal
