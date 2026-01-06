
'use client'
// components/TwoOptionsModal.tsx

import React, { useState } from 'react'
import Dropzone from './dropzone'
import SingleStudentForm from './SingleStudentForm'

import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { STUDENT_ONBOARDING_TYPES } from '@/utils/constant'
import { Label } from '@/components/ui/label'
import { getStoreStudentDataNew } from '@/store/store'
import { fetchStudentsHandler } from '@/utils/admin'
import { getCourseData } from '@/store/store'
import { AddStudentsModalProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

type StudentDataType = {
    name: string
    email: string
    batchId?: string
}

const AddStudentsModal = ({
    id,
    message,
    batch,
    batchId,
    fetchBatchesData,
    batchData,
    studentData,
    setStudentData,
    modalType = 'bulk',
}: AddStudentsModalProps & {
    modalType?: 'bulk' | 'single' | 'both'
    studentData: StudentDataType
    setStudentData: React.Dispatch<React.SetStateAction<StudentDataType>>
}) => {
    const [selectedOption, setSelectedOption] = useState('1')

    const handleStudentUploadType = (value: string) => {
        setSelectedOption(value)
    }

    // state and variables
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

    const { fetchCourseDetails } = getCourseData()

    const courseId: string = id.toString()

    const handleSubmit = async () => {
        const transformedObject = {
            students:
                modalType === 'bulk'
                    ? studentData
                    : [
                          {
                              email: studentData.email,
                              name: studentData.name,
                          },
                      ],
        }

        if (transformedObject) {
            const requestBody = transformedObject
            try {
                const endpoint = studentData.batchId
                    ? `/bootcamp/students/${id}?batch_id=${studentData.batchId}`
                    : `/bootcamp/students/${id}`
                await api.post(endpoint, requestBody).then((response) => {
                    batch && fetchBatchesData()
                    toast.success({
                        title: response.data.status,
                        description: response.data.message,
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
                    setStudentData({ name: '', email: '', batchId: '' })
                })
            } catch (error: any) {
                toast.error({
                    title: 'Error Adding Students',
                    description: error?.response.data.message,
                })
            }
        }
    }

    return (
        <DialogContent className="text-black">
            <DialogHeader>
                <DialogTitle>
                    {message
                        ? 'New Batch'
                        : modalType === 'single'
                        ? 'Add New Student'
                        : 'Bulk Upload Students'}
                </DialogTitle>
                <span>
                    {message
                        ? batchData
                            ? 'All the students are assigned to batches. Please add new students to create new batches'
                            : 'Please add student(s) to create New Batches'
                        : modalType === 'single'
                        ? ''
                        : ''}
                </span>
            </DialogHeader>

            {modalType === 'both' && (
                <>
                    <div className="flex items-center justify-start">
                        {STUDENT_ONBOARDING_TYPES.map(({ id, label }) => (
                            <RadioGroup
                                key={id}
                                value={selectedOption}
                                onValueChange={handleStudentUploadType}
                            >
                                <div className="flex space-x-2 mr-4">
                                    <RadioGroupItem value={id} id={id} />
                                    <Label htmlFor={id}>{label}</Label>
                                </div>
                            </RadioGroup>
                        ))}
                    </div>

                    {selectedOption === '2' && (
                        <SingleStudentForm
                            studentData={studentData}
                            setStudentData={setStudentData}
                            courseId={id}
                            showBatchSelection={true}
                        />
                    )}

                    {selectedOption === '1' && (
                        <Dropzone
                            studentData={studentData}
                            setStudentData={setStudentData}
                            className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block"
                        />
                    )}
                </>
            )}

            {modalType === 'single' && (
                <SingleStudentForm
                    studentData={studentData}
                    setStudentData={setStudentData}
                    courseId={id}
                    showBatchSelection={true}
                />
            )}

            {modalType === 'bulk' && (
                <Dropzone
                    studentData={studentData}
                    setStudentData={setStudentData}
                    className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block"
                />
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary-dark shadow-4dp"
                    >
                        {modalType === 'single'
                            ? 'Add Student'
                            : 'Upload Students'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default AddStudentsModal
