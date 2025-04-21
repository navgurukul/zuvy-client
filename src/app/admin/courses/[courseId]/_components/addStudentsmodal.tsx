'use client'
// components/TwoOptionsModal.tsx

import React, { useState } from 'react'
import Dropzone from './dropzone'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { STUDENT_ONBOARDING_TYPES } from '@/utils/constant'
import { getStoreStudentDataNew } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { useStudentData } from '../(courseTabs)/students/components/useStudentData'
import { fetchStudentsHandler } from '@/utils/admin'
import { getCourseData } from '@/store/store'

const AddStudentsModal = ({
    id,
    message,
    batch,
    batchId,
    fetchBatchesData,
    batchData
}: {
    id: number
    message: boolean
    batch: boolean
    batchId: any
    fetchBatchesData?: any
    batchData?: boolean
}) => {
    // misc
    interface Student {
        email: string
        name: string
    }

    type StudentDataState = Student[]

    // state and variables
    const [selectedOption, setSelectedOption] = useState('1')
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const { fetchCourseDetails } = getCourseData()
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
    // func
    const handleSingleStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData({ ...studentData, [name]: value })
    }

    const handleStudentUploadType = (value: string) => {
        setSelectedOption(value)
    }

    const courseId: any = id

    // async
    const handleSubmit = async () => {
        const transformedObject = {
            students:
                selectedOption === '1'
                    ? studentData
                    : [{ email: studentData.email, name: studentData.name }],
        }
        if (transformedObject) {
            const requestBody = transformedObject
            try {
                const endpoint = batch
                    ? `/bootcamp/students/${id}?batch_id=${batchId}`
                    : `/bootcamp/students/${id}`
                await api.post(endpoint, requestBody).then((response) => {
                    batch && fetchBatchesData()
                    toast({
                        title: response.data.status,
                        description: response.data.message,
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                    fetchStudentsHandler({
                        courseId,
                        limit,
                        offset,
                        searchTerm: search,
                        setLoading,
                        setStudents,
                        setTotalPages,
                        setTotalStudents,
                        setCurrentPage,
                    })
                    fetchCourseDetails(id)
                    setStudentData({ name: '', email: '' })
                })
            } catch (error: any) {
                toast({
                    title: 'Error Adding Students',
                    description: error?.response.data.message,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {message
                        ? 'New Batch'
                        : selectedOption === '2'
                        ? 'Add Student'
                        : 'Add Students'}
                </DialogTitle>
                <span>
                    {message
                        ? batchData ? 'All the students are assigned to batches. Please add new students to create new batches' : 'Please add student(s) to create New Batches'
                        : ''}
                </span>
            </DialogHeader>
            <div className="flex items-center justify-start  ">
                {STUDENT_ONBOARDING_TYPES.map(({ id, label }) => (
                    <RadioGroup
                        key={id}
                        value={selectedOption}
                        onValueChange={handleStudentUploadType}
                    >
                        <div className="flex   space-x-2 mr-4">
                            <RadioGroupItem value={id} id={id} />
                            <Label htmlFor={id}>{label}</Label>
                        </div>
                    </RadioGroup>
                ))}
            </div>
            {selectedOption === '2' && (
                <div className="">
                    <div className="text-left">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={studentData.name || ''}
                            onChange={handleSingleStudent}
                        />
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            value={studentData.email || ''}
                            onChange={handleSingleStudent}
                        />
                    </div>
                </div>
            )}
            {selectedOption === '1' && (
                <>
                    <Dropzone
                        studentData={studentData}
                        setStudentData={setStudentData}
                        className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block"
                    />
                </>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="submit" onClick={handleSubmit}>
                        {selectedOption === '2'
                            ? 'Add Student'
                            : 'Add Students'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default AddStudentsModal
