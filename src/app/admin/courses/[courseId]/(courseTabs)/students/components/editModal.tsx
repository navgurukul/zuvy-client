import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { fetchStudentsHandler } from '@/utils/admin'
import { getStoreStudentDataNew } from '@/store/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
    status?: string
    batchId?: number
    isOpen: boolean
    onClose: () => void
}

export const EditModal: React.FC<EditModalProps> = ({
    name,
    email,
    userId,
    bootcampId,
    status,
    batchId,
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
        status: status || 'active',
        batchId: batchId || 0,
    })

    useEffect(() => {
        if (isOpen) {
            setStudentData({
                name: name || '',
                email: email || '',
                status: status || 'active',
                batchId: batchId || 0,
            })
        }
    }, [name, email, status, batchId, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData(prev => ({ ...prev, [name]: value }))
    }

    const handleStatusChange = (value: string) => {
        setStudentData(prev => ({ ...prev, status: value }))
    }

    const handleSave = async () => {
        if (isSubmitting) return
        
        setIsSubmitting(true)
        
        // Create payload according to schema
        const payload = {
            email: studentData.email,
            name: studentData.name,
            status: studentData.status,
            batchId: studentData.batchId 
        }
        
        try {
            const response = await api.patch(`/bootcamp/updateUserDetails/${userId}`, payload)
            
            toast.success({
                title: "Success",
                description: "Student updated successfully",
            })
            
            // Instead of using fetchStudentsHandler, trigger the parent's fetchFilteredData
            // This will maintain current filters and pagination
            window.dispatchEvent(new CustomEvent('refreshStudentData'))
            
            onClose()
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
                        Make changes to student information here. Click save when you&apos;re done.
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
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="email" className="col-span-1 h-full flex items-center justify-end">
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
                    {/* Status Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select
                            value={studentData.status}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="dropout">Dropout</SelectItem>
                                <SelectItem value="graduate">Graduate</SelectItem>
                            </SelectContent>
                        </Select>
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