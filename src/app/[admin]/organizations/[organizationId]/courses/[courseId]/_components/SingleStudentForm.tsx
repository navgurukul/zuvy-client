import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useBatchList } from '@/app/[admin]/hooks/useBatchList'
import { requiredEmailSchema, requiredNameSchema } from '@/utils/validation/nameEmail'

type StudentDataType = {
    name: string
    email: string
    batchId?: string
}

interface SingleStudentFormProps {
    studentData: StudentDataType
    setStudentData: React.Dispatch<React.SetStateAction<StudentDataType>>
    courseId: string | number
    showBatchSelection?: boolean
    showValidationErrors?: boolean
}

const SingleStudentForm: React.FC<SingleStudentFormProps> = ({
    studentData,
    setStudentData,
    courseId,
    showBatchSelection = true,
    showValidationErrors = false,
}) => {
    // enabled mirrors showBatchSelection — no fetch happens when the section is hidden
    const { batchData } = useBatchList(courseId, { enabled: showBatchSelection })
    const [touchedFields, setTouchedFields] = useState<{ name?: boolean; email?: boolean }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData({ ...studentData, [name]: value })
    }

    const handleBatchChange = (value: string) => {
        setStudentData({ ...studentData, batchId: value })
    }

    const nameResult = requiredNameSchema.safeParse(studentData.name || '')
    const emailResult = requiredEmailSchema.safeParse(studentData.email || '')
    const nameError = nameResult.success ? undefined : nameResult.error.issues[0]?.message
    const emailError = emailResult.success ? undefined : emailResult.error.issues[0]?.message
    const showNameError = showValidationErrors || touchedFields.name
    const showEmailError = showValidationErrors || touchedFields.email

    return (
        <div className="space-y-4">
            <div className="text-left">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={studentData.name || ''}
                    onChange={(event) => {
                        setTouchedFields((prev) => ({ ...prev, name: true }))
                        handleInputChange(event)
                    }}
                    placeholder="Enter student's full name"
                    className={`mt-1 ${showNameError && nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {showNameError && nameError && (
                    <p className="text-red-500 text-xs mt-1">{nameError}</p>
                )}
            </div>

            <div className="text-left">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={studentData.email || ''}
                    onChange={(event) => {
                        setTouchedFields((prev) => ({ ...prev, email: true }))
                        handleInputChange(event)
                    }}
                    placeholder="Enter student's email address"
                    className={`mt-1 ${showEmailError && emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {showEmailError && emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
            </div>

            {showBatchSelection && (
                <div className="text-left">
                    <Label htmlFor="batch">Batch (Optional)</Label>
                    <Select
                        value={studentData.batchId || ''}
                        onValueChange={handleBatchChange}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {batchData.length > 0 ? (
                                batchData.map((batch) => (
                                    <SelectItem
                                        key={batch.id}
                                        value={batch.id.toString()}
                                    >
                                        {batch.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="0" disabled>
                                    No batches available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}

export default SingleStudentForm
