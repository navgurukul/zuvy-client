import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fetchStudentsHandler } from '@/utils/admin'
import { getStoreStudentDataNew } from '@/store/store'
import { useUpdateStudent } from '@/app/[admin]/hooks/useUpdateStudent'
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
import { requiredNameEmailSchema } from '@/utils/validation/nameEmail'

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

    const { updateStudent, isSubmitting } = useUpdateStudent()
    const [studentData, setStudentData] = useState({
        name: name || '',
        email: email || '',
        status: status || 'active',
        batchId: batchId || 0,
    })
    const [touchedFields, setTouchedFields] = useState<{ name?: boolean; email?: boolean }>({})
    const [submitAttempted, setSubmitAttempted] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setTouchedFields({})
            setSubmitAttempted(false)
            setStudentData({
                name: name || '',
                email: email || '',
                status: status || 'active',
                batchId: batchId || 0,
            })
        } else {
            setTouchedFields({})
            setSubmitAttempted(false)
        }
    }, [name, email, status, batchId, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData(prev => ({ ...prev, [name]: value }))
        setTouchedFields(prev => ({ ...prev, [name as 'name' | 'email']: true }))
    }

    const handleStatusChange = (value: string) => {
        setStudentData(prev => ({ ...prev, status: value }))
    }

    const handleSave = async () => {
        const result = requiredNameEmailSchema.safeParse(studentData)
        if (!result.success) {
            setSubmitAttempted(true)
            return
        }

        // Create payload according to schema
        const payload = {
            email: result.data.email,
            name: result.data.name,
            status: studentData.status,
            batchId: studentData.batchId,
        }

        await updateStudent(userId, payload, {
            onSuccess: () => {
                // Instead of using fetchStudentsHandler, trigger the parent's fetchFilteredData
                // This will maintain current filters and pagination
                window.dispatchEvent(new CustomEvent('refreshStudentData'))
                onClose()
            },
        })
    }

    const validationResult = requiredNameEmailSchema.safeParse(studentData)
    const validationErrors: Partial<Record<'name' | 'email', string>> = validationResult.success
        ? {}
        : validationResult.error.issues.reduce<Partial<Record<'name' | 'email', string>>>((errors, issue) => {
            const field = issue.path[0]
            if ((field === 'name' || field === 'email') && !errors[field]) errors[field] = issue.message
            return errors
        }, {})
    const showFieldError = (field: 'name' | 'email') =>
        submitAttempted || touchedFields[field] ? validationErrors[field] : undefined

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
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="name" className="text-left mb-1">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={studentData.name}
                            onChange={handleInputChange}
                            placeholder="Enter student name"
                            className={showFieldError('name') ? 'border-red-500 focus-visible:ring-red-500' : ''}
                        />
                        {showFieldError('name') && (
                            <p className="text-red-500 text-xs mt-1">{showFieldError('name')}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="email" className="text-left mb-1">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={studentData.email}
                            onChange={handleInputChange}
                            placeholder="Enter student email"
                            className={showFieldError('email') ? 'border-red-500 focus-visible:ring-red-500' : ''}
                        />
                        {showFieldError('email') && (
                            <p className="text-red-500 text-xs mt-1">{showFieldError('email')}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="status" className="text-left mb-1">
                            Status
                        </Label>
                        <Select
                            value={studentData.status}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger>
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