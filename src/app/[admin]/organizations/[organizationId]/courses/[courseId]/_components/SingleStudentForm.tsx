import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { api } from '@/utils/axios.config'

type BatchType = { 
    id: string | number
    name: string 
}

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
}

const SingleStudentForm: React.FC<SingleStudentFormProps> = ({
    studentData,
    setStudentData,
    courseId,
    showBatchSelection = true
}) => {
    const [localBatchData, setLocalBatchData] = useState<BatchType[]>([])

    // Fetch batches when component mounts
    useEffect(() => {
        const fetchBatches = async () => {
            if (showBatchSelection) {
                try {
                    const response = await api.get(`/bootcamp/batches/${courseId}`)
                    setLocalBatchData(response.data.data || [])
                } catch (error) {
                    console.error('Error fetching batches:', error)
                    setLocalBatchData([])
                }
            }
        }

        fetchBatches()
    }, [courseId, showBatchSelection])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData({ ...studentData, [name]: value })
    }

    const handleBatchChange = (value: string) => {
        setStudentData({
            ...studentData,
            batchId: value,
        })
    }

    return (
        <div className="space-y-4">
            <div className="text-left">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={studentData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter student's full name"
                    className="mt-1"
                />
            </div>

            <div className="text-left">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    value={studentData.email || ''}
                    onChange={handleInputChange}
                    placeholder="Enter student's email address"
                    className="mt-1"
                />
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
                            {localBatchData && localBatchData.length > 0 ? (
                                localBatchData.map((batch) => (
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