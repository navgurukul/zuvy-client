// 'use client'
// // components/TwoOptionsModal.tsx

// import React, { useState } from 'react'
// import Dropzone from './dropzone'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { api } from '@/utils/axios.config'
// import { toast } from '@/components/ui/use-toast'
// import {
//     DialogClose,
//     DialogContent,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from '@/components/ui/dialog'
// import { Label } from '@/components/ui/label'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { STUDENT_ONBOARDING_TYPES } from '@/utils/constant'
// import { getStoreStudentDataNew } from '@/store/store'
// import useDebounce from '@/hooks/useDebounce'
// import { useStudentData } from '../(courseTabs)/students/components/useStudentData'
// import { fetchStudentsHandler } from '@/utils/admin'
// import { getCourseData } from '@/store/store'
// import {AddStudentsModalProps} from "@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType"

// const AddStudentsModal = ({
//     id,
//     message,
//     batch,
//     batchId,
//     fetchBatchesData,
//     batchData,
//     studentData,
//     setStudentData,
// }:AddStudentsModalProps) => {
//     // misc
//     // interface Student {
//     //     email: string
//     //     name: string
//     // }

//     // type StudentDataState = Student[]

//     // state and variables
//     const [selectedOption, setSelectedOption] = useState('1')
//     // const [studentData, setStudentData] = useState<StudentDataState | any>({})
//     const { fetchCourseDetails } = getCourseData()
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
//     // func
//     const handleSingleStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target
//         setStudentData({ ...studentData, [name]: value })
//     }

//     const handleStudentUploadType = (value: string) => {
//         setSelectedOption(value)
//     }

//     const courseId:  string = id.toString();

//     // async
//     const handleSubmit = async () => {
//         const transformedObject = {
//             students:
//                 selectedOption === '1'
//                     ? studentData
//                     : [{ email: studentData.email, name: studentData.name }],
//         }
//         if (transformedObject) {
//             const requestBody = transformedObject
//             try {
//                 const endpoint = batch
//                     ? `/bootcamp/students/${id}?batch_id=${batchId}`
//                     : `/bootcamp/students/${id}`
//                 await api.post(endpoint, requestBody).then((response) => {
//                     batch && fetchBatchesData()
//                     toast.success({
//                         title: response.data.status,
//                         description: response.data.message,
//                     })
//                     fetchStudentsHandler({
//                         courseId,
//                         limit,
//                         offset,
//                         searchTerm: search,
//                         setLoading,
//                         setStudents,
//                         setTotalPages,
//                         setTotalStudents,
//                         setCurrentPage,
//                     })
//                     fetchCourseDetails(id)
//                     setStudentData({ name: '', email: '' })
//                 })
//             } catch (error: any) {
//                 toast.error({
//                     title: 'Error Adding Students',
//                     description: error?.response.data.message,
//                 })
//             }
//         }
//     }

//     return (
//         <DialogContent className='text-gray-600'>
//             <DialogHeader>
//                 <DialogTitle>
//                     {message
//                         ? 'New Batch'
//                         : selectedOption === '2'
//                         ? 'Add Student'
//                         : 'Add Students'}
//                 </DialogTitle>
//                 <span>
//                     {message
//                         ? batchData
//                             ? 'All the students are assigned to batches. Please add new students to create new batches'
//                             : 'Please add student(s) to create New Batches'
//                         : ''}
//                 </span>
//             </DialogHeader>
//             <div className="flex items-center justify-start  ">
//                 {STUDENT_ONBOARDING_TYPES.map(({ id, label }) => (
//                     <RadioGroup
//                         key={id}
//                         value={selectedOption}
//                         onValueChange={handleStudentUploadType}                    >
//                         <div className="flex   space-x-2 mr-4">
//                             <RadioGroupItem value={id} id={id}  />
//                             <Label htmlFor={id}>{label}</Label>
//                         </div>
//                     </RadioGroup>
//                 ))}
//             </div>
//             {selectedOption === '2' && (
//                 <div className="">
//                     <div className="text-left">
//                         <Label htmlFor="name">Name</Label>
//                         <Input
//                             id="name"
//                             name="name"
//                             value={studentData.name || ''}
//                             onChange={handleSingleStudent}
//                         />
//                         <Label htmlFor="email">Email</Label>
//                         <Input
//                             id="email"
//                             name="email"
//                             value={studentData.email || ''}
//                             onChange={handleSingleStudent}
//                         />
//                     </div>
//                 </div>
//             )}
//             {selectedOption === '1' && ( 
//                 <>
//                     <Dropzone
//                         studentData={studentData}
//                         setStudentData={setStudentData}
//                         className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block"
//                     />
//                 </>
//             )}
//             <DialogFooter>
//                 <DialogClose asChild>
//                     <Button type="submit" onClick={handleSubmit}>
//                         {selectedOption === '2'
//                             ? 'Add Student'
//                             : 'Add Students'}
//                     </Button>
//                 </DialogClose>
//             </DialogFooter>
//         </DialogContent>
//     )
// }

// export default AddStudentsModal




















'use client'
// components/TwoOptionsModal.tsx

import React, { useState, useEffect } from 'react'
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
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { STUDENT_ONBOARDING_TYPES } from '@/utils/constant'
import { Label } from '@/components/ui/label'
import { getStoreStudentDataNew } from '@/store/store'
import { useStudentData } from '../(courseTabs)/students/components/useStudentData'
import { fetchStudentsHandler } from '@/utils/admin'
import { getCourseData } from '@/store/store'
import {AddStudentsModalProps} from "@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type StudentDataType = {
    name: string;
    email: string;
    batchId?: string;
};

const AddStudentsModal = ({
    id,
    message,
    batch,
    batchId,
    fetchBatchesData,
    batchData,
    studentData,
    setStudentData,
    modalType = "bulk",
}: AddStudentsModalProps & { 
    modalType?: "bulk" | "single" | "both";
    studentData: StudentDataType;
    setStudentData: React.Dispatch<React.SetStateAction<StudentDataType>>;
}) => {
    type BatchType = { id: string | number; name: string };
    const [localBatchData, setLocalBatchData] = useState<BatchType[]>([]);
    // const [selectedOption, setSelectedOption] = useState('1')

    // const handleStudentUploadType = (value: string) => {
    //     setSelectedOption(value)
    // }
    
    // Fetch batches when modal opens for single student mode
    useEffect(() => {
        const fetchBatches = async () => {
            if (modalType === 'single') {
                try {
                    const response = await api.get(`/bootcamp/batches/${id}`);
                    console.log('Fetched batches:', response.data);
                    setLocalBatchData(response.data.data || []);
                } catch (error) {
                    console.error('Error fetching batches:', error);
                    setLocalBatchData([]);
                }
            }
        };
        
        fetchBatches();
    }, [id, modalType]);
    
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

    const handleSingleStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setStudentData({ ...studentData, [name]: value })
    }

    const courseId: string = id.toString()

    const handleSubmit = async () => {
        const transformedObject = {
            students:
                modalType === 'bulk'
                    ? studentData
                    : [{ 
                        email: studentData.email, 
                        name: studentData.name,
                        ...(studentData.batchId && { batchId: studentData.batchId })
                    }],
        }
        
        if (transformedObject) {
            const requestBody = transformedObject
            try {
                const endpoint = batch
                    ? `/bootcamp/students/${id}?batch_id=${batchId}`
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
        <DialogContent className='text-black'>
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
            
            {/* {modalType === 'both' && (
            <>
            <div className="flex items-center justify-start  ">
                {STUDENT_ONBOARDING_TYPES.map(({ id, label }) => (
                    <RadioGroup
                        key={id}
                        value={selectedOption}
                        onValueChange={handleStudentUploadType}                    >
                        <div className="flex   space-x-2 mr-4">
                            <RadioGroupItem value={id} id={id}  />
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
            </>
            )} */}
            {modalType === 'single' && (
                <div className="space-y-4">
                    <div className="text-left">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={studentData.name || ''}
                            onChange={handleSingleStudent}
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
                            onChange={handleSingleStudent}
                            placeholder="Enter student's email address"
                            className="mt-1"
                        />
                    </div>

                    <div className="text-left">
                        <Label htmlFor="batch">Batch (Optional)</Label>
                        <Select 
                            value={studentData.batchId || ''} 
                            onValueChange={(value) => setStudentData({...studentData, batchId: value})}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {localBatchData && localBatchData.length > 0 ? (
                                    localBatchData.map((batch) => (
                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                            {batch.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="" disabled>
                                        No batches available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            
            {modalType === 'bulk' && (
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
                    <Button type="submit" onClick={handleSubmit} className='bg-primary hover:bg-primary-dark shadow-4dp'>
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
