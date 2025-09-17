// import React from 'react'
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'
// import { Button } from '@/components/ui/button'
// import { Trash2 } from 'lucide-react'
// import { api } from '@/utils/axios.config'
// import { toast } from '@/components/ui/use-toast'
// import { fetchStudentsHandler } from '@/utils/admin'
// import {
//     getStoreStudentDataNew,
//     getStoreStudentData,
//     getIsRowSelected,
// } from '@/store/store'
// import{DeleteAlertDialogProps} from "@/app/admin/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType"

// export const AlertDialogDemo: React.FC<DeleteAlertDialogProps> = ({
//     title,
//     description,
//     userId,
//     bootcampId,
//     fetchStudentData,
//     setSelectedRows,
// }) => {
//     const { isRowUnSelected, setIsRowUnSelected } = getIsRowSelected()
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

//     async function deleteStudentHandler(userId: any, bootcampId: any) {
//         try {
//             let url = `/student/{userId}/${bootcampId}?`
//             url += 'userId=' + userId.join('&userId=')
//             await api.delete(url).then((res) => {
//                 toast.success({
//                     title: 'User Deleted Successfully!',
//                     description: res.data.message,
//                 })
//                 fetchStudentData && fetchStudentData()
//                 fetchStudentsHandler({
//                     courseId: bootcampId,
//                     limit,
//                     offset,
//                     searchTerm: search,
//                     setLoading,
//                     setStudents,
//                     setTotalPages,
//                     setTotalStudents,
//                     setCurrentPage,
//                 })
//                 // setSelectedRows([])
//                 setIsRowUnSelected(!isRowUnSelected)
//             })
//         } catch (error: any) {
//             toast.error({
//                 title: 'Failed',
//                 description:
//                     error.response?.data?.message || 'An error occurred.',
//             })
//         }
//     }

//     return (
//         <AlertDialog>
//             <AlertDialogTrigger asChild>
//                 <Button className="bg-white text-red-400">
//                     <Trash2 />
//                 </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//                 <AlertDialogHeader>
//                     <AlertDialogTitle>{title}</AlertDialogTitle>
//                     <AlertDialogDescription>
//                         {description}
//                     </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                     <AlertDialogCancel className="!text-gray-600 hover:border-[rgb(81,134,114)]">Cancel</AlertDialogCancel>
//                     <AlertDialogAction
//                         className="bg-red-500"
//                         onClick={() => deleteStudentHandler(userId, bootcampId)}
//                     >
//                         Continue
//                     </AlertDialogAction>
//                 </AlertDialogFooter>
//             </AlertDialogContent>
//         </AlertDialog>
//     )
// }

// export default AlertDialogDemo

























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
} from '@/components/ui/alert-dialog'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import { AlertCircle } from 'lucide-react'
import {
    getStoreStudentDataNew,
    getIsRowSelected,
} from '@/store/store'

interface DeleteModalProps {
    title: string
    description: string
    userId: number[]
    bootcampId: number
    isOpen?: boolean
    onClose?: () => void
    setSelectedRows?: React.Dispatch<React.SetStateAction<any[]>> // Add this line
}

export const AlertDialogDemo: React.FC<DeleteModalProps> = ({
    title,
    description,
    userId,
    bootcampId,
    isOpen,
    onClose,
    setSelectedRows, // Add this parameter
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
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

    async function deleteStudentHandler() {
        if (isDeleting) return
        
        setIsDeleting(true)
        try {
            let url = `/student/{userId}/${bootcampId}?`
            url += 'userId=' + userId.join('&userId=')
            await api.delete(url).then((res) => {
                toast.success({
                    title: 'User Deleted Successfully!',
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
                setIsRowUnSelected(!isRowUnSelected)
                
                // Clear selected rows after successful deletion
                if (setSelectedRows) {
                    setSelectedRows([])
                }
                
                if (onClose) {
                    onClose()
                }
            })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    {title}
                </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={deleteStudentHandler}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertDialogDemo
