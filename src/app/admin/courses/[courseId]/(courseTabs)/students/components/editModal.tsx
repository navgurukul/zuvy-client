// import React, { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Pencil, Check, X } from 'lucide-react'
// import { api } from '@/utils/axios.config'
// import { toast } from '@/components/ui/use-toast'
// import { fetchStudentsHandler } from '@/utils/admin'
// import { getStoreStudentDataNew } from '@/store/store'
// import { getEditStudent, getStudentData } from '@/store/store'
// import{ComboxAlertDialogProps} from "@/app/admin/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType"

// export const EditModal: React.FC<ComboxAlertDialogProps> = ({
//     name,
//     email,
//     userId,
//     bootcampId,
// }) => {
//     const {
//         setStudents,
//         setTotalPages,
//         setLoading,
//         offset,
//         setTotalStudents,
//         setCurrentPage,
//         limit,
//         search,
//     } = getStoreStudentDataNew()

//     const [isOpen, setIsOpen] = useState(false)
//     const { isStudent, setIsStudent } = getEditStudent()
//     const { studentData, setStudentData } = getStudentData()

//     async function editStudentHandler(userId: number, bootcampId: string) {
//         try {
//             await api
//                 .patch(`/bootcamp/updateUserDetails/${userId}`, studentData)
//                 .then((res) => {
//                     toast.success({
//                         title: res.data.status,
//                         description: res.data.message,
//                     })
//                     setIsStudent(0)
//                     fetchStudentsHandler({
//                         courseId: bootcampId,
//                         limit,
//                         offset,
//                         searchTerm: search,
//                         setLoading,
//                         setStudents,
//                         setTotalPages,
//                         setTotalStudents,
//                         setCurrentPage,
//                     })
//                     setIsOpen(false)
//                 })
//         } catch (error: any) {
//             toast.error({
//                 title: 'Failed',
//                 description:
//                     error.response?.data?.message || 'An error occurred.',
//             })
//         }
//     }

//     return (
//         <>
//             {isOpen ? (
//                 <div className="flex gap-1">
//                     <Button
//                         className="bg-white text-black-400"
//                         onClick={() => editStudentHandler(userId, bootcampId)}
//                     >
//                         <Check />
//                     </Button>
//                     <Button
//                         className="bg-white text-black-400"
//                         onClick={() => {
//                             setIsOpen(false)
//                             setIsStudent(0)
//                         }}
//                     >
//                         <X />
//                     </Button>
//                 </div>
//             ) : (
//                 <Button
//                     className="bg-white text-red-400"
//                     onClick={() => {
//                         setIsOpen(true)
//                         setIsStudent(userId)
//                         setStudentData({
//                             email: email || '',
//                             name: name || '',
//                         })
//                     }}
//                 >
//                     <Pencil />
//                 </Button>
//             )}
//         </>
//     )
// }

// export default EditModal


























import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import { getStoreStudentDataNew } from '@/store/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface EditModalProps {
    userId: number
    bootcampId: number
    name: string
    email: string
    isOpen: boolean
    onClose: () => void
}

export const EditModal: React.FC<EditModalProps> = ({
    name,
    email,
    userId,
    bootcampId,
    isOpen,
    onClose,
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

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [studentData, setStudentData] = useState({
        name: name || '',
        email: email || '',
    })

    useEffect(() => {
        if (isOpen) {
            setStudentData({
                name: name || '',
                email: email || '',
            })
        }
    }, [name, email, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        if (isSubmitting) return
        
        setIsSubmitting(true)
        try {
            await api.patch(`/bootcamp/updateUserDetails/${userId}`, studentData)
                .then((res) => {
                    toast.success({
                        title: res.data.status,
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
                    onClose()
                })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description: error.response?.data?.message || 'An error occurred.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                    <DialogDescription>
                        Make changes to student information here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={studentData.name}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="Enter student name"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={studentData.email}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="Enter student email"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EditModal
