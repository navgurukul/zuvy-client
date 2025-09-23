'use client'
import React, { useCallback, useEffect, useState, useRef, KeyboardEvent,useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import { Label } from '@/components/ui/label'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { api } from '@/utils/axios.config'
import { getBatchData, getCourseData, getStoreStudentData, getDeleteStudentStore } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { fetchStudentData } from '@/utils/students'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataTable } from '@/app/_components/datatable/data-table'
import { useStudentData } from '@/app/admin/courses/[courseId]/(courseTabs)/students/components/useStudentData'
import { createColumns } from './columns'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
    Users, 
    Plus, 
    Eye, 
    Mail, 
    Calendar, 
    Edit,
    UserCheck,
    Upload,
    UserPlus,
    Trash2
} from 'lucide-react'
import { StudentData, BatchSuggestion, StudentDataState, ParamsType } from "@/app/admin/courses/[courseId]/(courseTabs)/batches/courseBatchesType"
import { SearchBox } from '@/utils/searchBox'
import DeleteConfirmationModal from '../../_components/deleteModal'
import Dropzone from '../../_components/dropzone'

// Enhanced Batch interface to match new design
interface EnhancedBatch {
    id: string | number
    name: string
    instructorEmail: string
    capEnrollment: number
    students_enrolled: number
    status: 'not_started' | 'ongoing' | 'completed'
    updatedAt?: string
    createdAt?: string
}

const Page = ({ params }: { params: ParamsType }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { students } = useStudentData(params.courseId)
    const { courseData, fetchCourseDetails } = getCourseData()
    const { batchData, setBatchData } = getBatchData()
    const { setStoreStudentData } = getStoreStudentData()
    const { setDeleteModalOpen, isDeleteModalOpen } = getDeleteStudentStore()

    // Other states
    const [loading, setLoading] = useState(true)
    const [assignStudents, setAssignStudents] = useState('')
    const [manualAssignmentMethod, setManualAssignmentMethod] = useState('unassigned')
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [totalStudents, setTotalStudents] = useState([...students])
    const [searchStudent, setSearchStudent] = useState('')
    const debouncedSearchStudent = useDebounce(searchStudent, 1000)
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [singleStudentData, setSingleStudentData] = useState({
        name: '',
        email: '',
    })
    
    // New states for edit functionality
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingBatch, setEditingBatch] = useState<EnhancedBatch | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    
    // Delete states
    const [batchToDelete, setBatchToDelete] = useState<EnhancedBatch | null>(null)

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ongoing':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'not_started':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    // Helper function to determine batch status based on dates or enrollment
    const determineBatchStatus = (batch: any): 'not_started' | 'ongoing' | 'completed' => {
        if (batch.status) return batch.status
        
        // If no explicit status, determine based on student enrollment
        if (batch.students_enrolled === 0) return 'not_started'
        if (batch.students_enrolled >= batch.capEnrollment) return 'completed'
        return 'ongoing'
    }

    // Convert batch data to enhanced format
    const enhancedBatchData: EnhancedBatch[] = useMemo(() => {
        if (!batchData) return []
        
        return batchData.map((batch: any) => ({
            id: batch.id,
            name: batch.name,
            instructorEmail: batch.instructorEmail || 'instructor@example.com',
            capEnrollment: batch.capEnrollment || 30,
            students_enrolled: batch.students_enrolled || 0,
            status: determineBatchStatus(batch),
            createdAt: batch.createdAt || '2024-01-15',
            updatedAt: batch.updatedAt || '2024-04-15',
        }))
         .sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })
    }, [batchData])

    const formatDate = (dateString: string): string => {
        if (!dateString) return ''
        
        try {
            const date = new Date(dateString)
            // Format to YYYY-MM-DD only
            return date.toISOString().split('T')[0]
        } catch (error) {
            console.error('Date formatting error:', error)
            // Fallback: extract first 10 characters
            return dateString.split('T')[0] || dateString.substring(0, 10)
        }
    }

    // API functions for the hook
    const fetchSuggestionsApi = useCallback(
        async (query: string): Promise<BatchSuggestion[]> => {
            const response = await api.get(
                `/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`
            );
            return response.data || [];
        },
        [params.courseId]
    );

    const fetchSearchResultsApi = useCallback(
        async (query: string) => {
            setSearchQuery(query)
            const response = await api.get(
                `/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`
            );
            setBatchData(response.data || []);
            return response.data || [];
        },
        [params.courseId, setBatchData]
    );

    const defaultFetchApi = useCallback(async () => {
        setSearchQuery('')
        const response = await api.get(`/bootcamp/batches/${params.courseId}`);
        setBatchData(response.data?.data || []);
        return response.data?.data || [];
    }, [params.courseId, setBatchData]);

    const formSchema = z.object({
        name: z.string().min(3, {
            message: 'Batch name must be at least 3 characters.',
        }),
        instructorEmail: z.string().email({
        message: 'Please enter a valid email address.',
    }),
        bootcampId: z
            .string()
            .refine((bootcampId) => !isNaN(parseInt(bootcampId))),
        capEnrollment: z.string().refine(
            (capEnrollment) => {
                const parsedValue = parseInt(capEnrollment)
                return (
                    !isNaN(parsedValue) &&
                    parsedValue > 0 &&
                    parsedValue <= 100000
                )
            },
            {
                message:
                    'Cap Enrollment must be a positive number between 1 and 100,000',
            }
        ),
        assignLearners: z.string(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            instructorEmail: '',
            bootcampId: courseData?.id.toString() ?? '',
            capEnrollment: '',
            assignLearners: 'all',
        },
        // values: {
        //     name: '',
        //     instructorEmail: '',
        //     bootcampId: courseData?.id.toString() ?? '',
        //     capEnrollment: '',
        //     assignLearners: 'all',
        // },
        mode: 'onChange',
    })

    // Handle edit batch
    const handleEditBatch = (batch: EnhancedBatch) => {
        setEditingBatch(batch)
        form.reset({
            name: batch.name,
            instructorEmail: batch.instructorEmail,
            bootcampId: courseData?.id.toString() ?? '',
            capEnrollment: batch.capEnrollment.toString(),
            assignLearners: 'all',
        })
        setIsEditModalOpen(true)
        setCurrentStep(1)
    }

    // Handle delete batch
    const handleDeleteBatch = (batch: EnhancedBatch) => {
        setBatchToDelete(batch)
        setDeleteModalOpen(true)
    }

    // Batch delete handler
    const batchDeleteHandler = async () => {
        if (!batchToDelete) return
        
        try {
            await api.delete(`/batch/${batchToDelete.id}`)
            toast.success({
                title: 'Batch Deleted Successfully',
            })
            setDeleteModalOpen(false)
            setBatchToDelete(null)
            // Refresh batch data
            defaultFetchApi()
        } catch (error) {
            toast.error({
                title: 'Batch not Deleted',
                description: 'An error occurred while deleting the batch'
            })
        }
    }

    // Handle update batch
    const handleUpdateBatch = async (values: z.infer<typeof formSchema>) => {
        if (!editingBatch) return
        
        try {
            const convertedData = {
                name: values.name,
                instructorEmail: values.instructorEmail,
                capEnrollment: +values.capEnrollment,
            }

            // Call API to update batch
            const res = await api.put(`/batch/${editingBatch.id}`, convertedData)
            
            // Refresh data
            defaultFetchApi()
            setIsEditModalOpen(false)
            setEditingBatch(null)
            
            toast.success({
                title: 'Success',
                description: 'Batch updated successfully',
            })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description: error.response?.data?.message || 'Failed to update batch',
            })
        }
    }

    // Handle view students - navigate to students with batch filter
    const handleViewStudents = (batchId: string | number, batchName: string) => {
        router.push(`/admin/courses/${params.courseId}/students?batch=${batchId}`)
    }

    // Handle CSV file upload
    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'text/csv') {
            setCsvFile(file)
        } else {
            toast.error({
                title: 'Invalid File',
                description: 'Please select a valid CSV file',
            })
        }
    }

    // Handle single student form
    const handleSingleStudentChange = (field: string, value: string) => {
        setSingleStudentData(prev => ({
            ...prev,
            [field]: value
        }))
    }
// Fixed onSubmit function with proper manual assignment handling
const onSubmit = async (values: z.infer<typeof formSchema>) => {

    // If editing, use update handler
    if (isEditModalOpen && editingBatch) {
        return handleUpdateBatch(values)
    }

    try {
        let studentIds: number[] = []
        let assignAll = true
        let studentsToAdd: any[] = []// For single student or CSV upload

        // Handle different assignment methods
        if (assignStudents === 'manually') {
            assignAll = false // Always false for manual assignment
            
            if (manualAssignmentMethod === 'unassigned') {
                // Use selected rows from unassigned students
                studentIds = selectedRows.map((student) => student.id)
                
                // If no students selected, don't create batch
                if (studentIds.length === 0) {
                    toast.error({
                        title: 'No Students Selected',
                        description: 'Please select at least one student to assign to the batch',
                    })
                    return false
                }
            } 
            else if (manualAssignmentMethod === 'single') {
                // Validate single student data
                if (!singleStudentData.name.trim() || !singleStudentData.email.trim()) {
                    toast.error({
                        title: 'Incomplete Student Data',
                        description: 'Please provide both student name and email',
                    })
                    return false
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(singleStudentData.email)) {
                    toast.error({
                        title: 'Invalid Email',
                        description: 'Please provide a valid email address',
                    })
                    return false
                }
                
                studentsToAdd = [{
                    name: singleStudentData.name.trim(),
                    email: singleStudentData.email.trim(),
                }]
            } 
            else if (manualAssignmentMethod === 'csv') {
                 if (!studentData || !Array.isArray(studentData) || studentData.length === 0) {
                    toast.error({
                        title: 'No CSV Data',
                        description: 'Please upload a valid CSV file with student data',
                    })
                    return false
                }
                studentsToAdd = studentData
            }
        }
        
        const bootcampId = parseInt(String(params.courseId));

        if (isNaN(bootcampId) || bootcampId <= 0) {
            console.error("Invalid courseId:", params.courseId)
            toast({
                title: 'Invalid Course ID',
                description: 'Course ID is not valid. Please refresh the page.',
                variant: 'destructive',
            })
            return false
        }

        // Create batch data
        const batchPayload = {
            name: values.name,
            instructorEmail: values.instructorEmail,
            bootcampId: bootcampId,
            capEnrollment: +values.capEnrollment,
            assignAll: assignAll,
            studentIds: studentIds
        }


        if (!batchPayload.name || !batchPayload.instructorEmail || !batchPayload.bootcampId || !batchPayload.capEnrollment) {
            toast({
                title: 'Missing Required Fields',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            })
            return false
        }
        // Check for duplicate batch name
        const convertedName = batchPayload.name.replace(/\s+/g, '').toLowerCase()
        const matchedBatchData = enhancedBatchData?.find(
            (batch) => convertedName === batch.name.replace(/\s+/g, '').toLowerCase()
        )

        if (matchedBatchData) {
            toast.error({
                title: 'Cannot Create New Batch',
                description: 'This Batch Name Already Exists',
            })
            return false
        }

        // Create batch
        const batchResponse = await api.post(`/batch`, batchPayload)
        const newBatchId = batchResponse.data.data?.id || batchResponse.data.id

         // If new students to add (single/CSV), add them to course and batch
        if (studentsToAdd.length > 0) {
            try {
                // Use same API pattern as AddStudentsModal
                const studentsPayload = {
                    students: studentsToAdd
                }
                
                // Add students to course with batch assignment
                await api.post(
                    `/bootcamp/students/${params.courseId}?batch_id=${newBatchId}`, 
                    studentsPayload
                )
            } catch (error) {
                console.error('Error adding students:', error)
                // Batch created but students not added
                toast.warning({
                    title: 'Partial Success',
                    description: 'Batch created but some students could not be added',
                })
            }
        }
        
        // Reset all form states
        setAssignStudents('')
        setManualAssignmentMethod('unassigned')
        setSelectedRows([])
        setStudentData({})
        setSingleStudentData({ name: '', email: '' })
        
        // Refresh data
        if (params.courseId) {
            fetchStudentData(params.courseId, setStoreStudentData)
            fetchCourseDetails(params.courseId)
            defaultFetchApi()
        }
        
        toast.success({
            title: 'Success',
            description: 'Batch created successfully',
        })
        
        getUnAssignedStudents()
        return true
        
    } catch (error: any) {
        setAssignStudents('')
        setManualAssignmentMethod('unassigned')
        setSelectedRows([])
       
        
        toast.error({
            title: 'Failed',
            description:
                error.response?.data?.message || 'Failed to create batch.',
        })
        console.error('Error creating batch:', error)
        return false
    }
}
    // Rest of the existing useEffect and other functions remain the same
    useEffect(() => {
        if (params.courseId) {
            console.log('Fetching course details for:', params.courseId)
            fetchCourseDetails(params.courseId)
        }
    }, [params.courseId, fetchCourseDetails])

    useEffect(() => {
    console.log('CourseData updated:', courseData)
}, [courseData])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const getUnAssignedStudents = useCallback(async () => {
        try {
            const res = await api.get(
                `/batch/allUnassignStudent/${params.courseId}?searchTerm=${debouncedSearchStudent}`
            )
            setTotalStudents(res.data.data)
        } catch (err) {
            console.error("Failed to fetch unassigned students:", err)
        }
    }, [debouncedSearchStudent, params.courseId])

    useEffect(() => {
        getUnAssignedStudents()
    }, [getUnAssignedStudents, debouncedSearchStudent, params.courseId])

    const handleSearchStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchStudent(e.target.value)
    }

    const assignLearners = form.watch('assignLearners')
    const capEnrollmentValue = form.watch("capEnrollment");

    const columns = useMemo(() => createColumns(Number(capEnrollmentValue)), [capEnrollmentValue])

    const handleModal = (isOpen: boolean) => {
        setIsCreateModalOpen(isOpen)
        if (!isOpen) {
        // Form completely reset
        form.reset({
            name: '',
            instructorEmail: '',
            bootcampId: courseData?.id.toString() ?? '',
            capEnrollment: '',
            assignLearners: 'all',
            
        })
        
        // All states reset
        setAssignStudents('')
        setManualAssignmentMethod('unassigned')
        setCsvFile(null)
        setSingleStudentData({ name: '', email: ''})
        setEditingBatch(null)
        setIsEditModalOpen(false)
        setCurrentStep(1) 
        setSelectedRows([]) 
        setStudentData({}) 
    }
    }

    // Render manual assignment method selection
    const renderManualAssignmentMethod = () => {
        return  ( 
        <div className="space-y-2">            
            <RadioGroup 
                value={manualAssignmentMethod} 
                onValueChange={setManualAssignmentMethod}
                className="flex gap-6"
            >
               <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unassigned" id="unassigned" />
                        <Label htmlFor="unassigned" className="font-medium cursor-pointer mt-5">
                            Unassigned Students
                        </Label>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="font-medium cursor-pointer mt-5">
                        Add Single Student
                    </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="font-medium cursor-pointer mt-5">
                        Upload CSV
                    </Label>
                </div>
            </RadioGroup>
        </div>
    )
    }

    // Render the selected assignment method content
    const renderAssignmentMethodContent = () => {
        switch (manualAssignmentMethod) {
            case 'unassigned':
                return (
                    <>
                        <p className="text-sm text-muted-foreground ml-2">
                         Unassigned Students in Records: {courseData?.unassigned_students || 0}
                        </p>
                        <Input
                            type="search"
                            placeholder="Search students"
                            className="w-full"
                            value={searchStudent}
                            onChange={handleSearchStudents}
                        />
                        <DataTable
                            data={totalStudents}
                            columns={columns}
                            setSelectedRows={setSelectedRows}
                            assignStudents={assignStudents}
                        />
                        <p className="pt-2 text-sm">
                            Total Learners Selected: {selectedRows.length}
                        </p>
                        {selectedRows.length === 0 && (
                        <p className="text-sm text-red-500">
                            Please select at least one student
                        </p>
                    )}
                    </>
                )
            
            case 'single':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentName">Student Name *</Label>
                            <Input
                                id="studentName"
                                value={singleStudentData.name}
                                onChange={(e) => handleSingleStudentChange('name', e.target.value)}
                                placeholder="Enter student name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentEmail">Student Email *</Label>
                            <Input
                                id="studentEmail"
                                type="email"
                                value={singleStudentData.email}
                                onChange={(e) => handleSingleStudentChange('email', e.target.value)}
                                placeholder="Enter student email"
                            />
                        </div>
                         {(!singleStudentData.name.trim() || !singleStudentData.email.trim()) && (
                        <p className="text-sm text-red-500">
                            Both name and email are required
                        </p>
                    )}
                    </div>
                )
            
            case 'csv':
                return (

                     <div className="space-y-4">
                    {/* Use Dropzone instead of manual file input */}
                    <Dropzone
                        studentData={studentData}
                        setStudentData={setStudentData}
                        className="px-5 py-2 border-dashed border-2 rounded-[10px] block"
                    />
                    <div className="text-center">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                // Download sample CSV
                                const csvContent = "name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com"
                                const blob = new Blob([csvContent], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = 'sample_students.csv'
                                a.click()
                                window.URL.revokeObjectURL(url)
                            }}
                        >
                            Download Sample CSV
                        </Button>
                    </div>
                </div>
                )
            
            default:
                return null
        }
    }

    const isManualAssignmentValid = () => {
    if (manualAssignmentMethod === 'unassigned') {
        return selectedRows.length > 0
    } else if (manualAssignmentMethod === 'single') {
        return singleStudentData.name.trim() && singleStudentData.email.trim()
    } else if (manualAssignmentMethod === 'csv') {
        return studentData && Array.isArray(studentData) && studentData.length > 0
    }
    return false
}

    const renderModal = (emptyState: boolean) => {

     const shouldShowAddStudentModal = (
        courseData?.unassigned_students === 0 || 
        (!batchData || batchData.length === 0)
    )
   
    if (shouldShowAddStudentModal) {
       
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="lg:max-w-[200px] w-full mt-5 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Batch
                    </Button>
                </DialogTrigger>
                <DialogOverlay />
                <AddStudentsModal
                    message={true}
                    id={courseData?.id || 0}
                    batch={false}
                    batchData={batchData ? batchData?.length > 0 : false}
                    batchId={0}
                    setStudentData={setStudentData}
                    studentData={studentData}
                    modalType="both"
                />
            </Dialog>
        )
    } else {
         
        return (
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                    handleModal(open)
                
            }}>
                <DialogTrigger asChild>
                    <Button className="lg:max-w-[200px] w-full mt-5 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                            // Reset everything before opening
                            form.reset({
                                name: '',
                                instructorEmail: '',
                                bootcampId: courseData?.id.toString() ?? '',
                                capEnrollment: '',
                                assignLearners: 'all',
                            })
                            setAssignStudents('')
                            setManualAssignmentMethod('unassigned')
                            setCsvFile(null)
                            setSingleStudentData({ name: '', email: ''})
                            setSelectedRows([])
                            setStudentData({})
                            setIsCreateModalOpen(true)
                        }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Batch
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            Create New Batch
                        </DialogTitle>
                        <DialogDescription>
                            {assignStudents === 'manually' 
                                ? 'Choose how you want to add students to this batch'
                                : `Unassigned Students in Records: ${courseData?.unassigned_students}`
                            }
                        </DialogDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {assignStudents === 'manually' ? (
                                    <div className="space-y-6">
                                        {/* Assignment Method Selection */}
                                        {renderManualAssignmentMethod()}
                                        
                                        {/* Assignment Method Content */}
                                        <div className="border-t pt-6">
                                            {renderAssignmentMethodContent()}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex justify-between w-full pt-4 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setAssignStudents('')}
                                            >
                                                Back
                                            </Button>
                                            {/* <DialogClose asChild> */}
                                                <Button
                                                    type="button"
                                                    disabled={!form.formState.isValid || !isManualAssignmentValid()}
                                                   onClick={async (e) => {
                                                   e.preventDefault() // Prevent any default form submission
                                                    const formData = form.getValues()
                                                const success = await onSubmit(formData)
                                                 if (success) {
                                                   setIsCreateModalOpen(false)
                                                     }
                                                 }}
                                                >
                                                    Create Batch
                                                </Button>
                                            {/* </DialogClose> */}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Batch Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Batch Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="instructorEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Instructor Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="instructor@navgurukul.org"
                                                            type="email"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="capEnrollment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cap Enrollment</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Cap Enrollment (max: 100,000)"
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value.length <= 6) {
                                                                    field.onChange(e)
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={form.control}
                                            name="assignLearners"
                                            render={({ field }) => (
                                                <FormItem className="text-start">
                                                    <FormLabel>Assign Learners to Batch</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value || ''}
                                                            className="flex gap-4"
                                                        >
                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="all" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">All learners</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="manually" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">Assign manually</FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {assignLearners === 'all' && (
                                            <FormDescription>
                                                {`${courseData?.unassigned_students} ${courseData?.unassigned_students === 1 ? ' student' : ' students'} will be added to
                                                this batch (Maximum current availability)`}
                                            </FormDescription>
                                        )}
                                        
                                        <div className="w-full flex flex-col items-end gap-y-5">
                                            {assignLearners === 'all' ? (
                                                // <DialogClose asChild>
                                                    <Button
                                                        className="w-1/2"
                                                        type="submit"
                                                        disabled={!form.formState.isValid}
                                                        onClick={async (e) => {
                                                        e.preventDefault()
                                                        const formData = form.getValues()
                                                        const success = await onSubmit(formData)
                                                        if (success) {
                                                            setIsCreateModalOpen(false)
                                                        }
                                                    }}
                                                    >
                                                        Create batch
                                                    </Button>
                                                // </DialogClose>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    className="w-1/2"
                                                    onClick={() => setAssignStudents('manually')}
                                                    disabled={!form.formState.isValid}
                                                >
                                                    Next: Assign Learners to Batch
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </form>
                        </Form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }
}

const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen)
        if (!isOpen) {
            setEditingBatch(null)
            form.reset({
                name: '',
                instructorEmail: '',
                bootcampId: courseData?.id.toString() ?? '',
                capEnrollment: '',
                assignLearners: 'all',
            })
        }
    }}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                    Edit Batch - {editingBatch?.name}
                </DialogTitle>
                <DialogDescription>
                    Update batch details and instructor information.
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Batch Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="instructorEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instructor Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="instructor@navgurukul.org"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="capEnrollment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cap Enrollment</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Cap Enrollment (max: 100,000)"
                                            type="number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.formState.isValid}>
                                Update Batch
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogHeader>
        </DialogContent>
    </Dialog>
)

    if (courseData?.id) {
        return (
            <div className="w-full max-w-none space-y-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-left">Batches</h2>
                        <p className="text-muted-foreground">
                            Organize students into batches for better management
                        </p>
                    </div>
                    {renderModal(false)}
                </div>

                {loading ? (
                    <div className="my-5 flex justify-center items-center">
                        <div className="absolute h-screen">
                            <div className="relative top-[70%]">
                                <Spinner className="text-secondary" />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Batch Cards Grid - Updated Design */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(enhancedBatchData?.length ?? 0) > 0 ? (
                            enhancedBatchData?.map((batch: EnhancedBatch) => (
                                <Card key={batch.id} className="hover:shadow-lg transition-all duration-200 flex flex-col w-[380px]">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 text-left">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CardTitle className="text-lg font-semibold mb-2 cursor-pointer">
                                                                {batch.name.length > 25
                                                                    ? batch.name.substring(0, 25) + '...'
                                                                    : batch.name}
                                                            </CardTitle>
                                                        </TooltipTrigger>
                                                        {batch.name.length > 25 && (
                                                            <TooltipContent>
                                                                {batch.name}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`capitalize text-xs ${getStatusColor(batch.status)}`}
                                                >
                                                    {batch.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 hover:bg-primary hover:text-white"
                                                    onClick={() => handleEditBatch(batch)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 "
                                                    onClick={() => handleDeleteBatch(batch)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Instructor:</span>
                                            <span className="truncate">{batch.instructorEmail}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Students:</span>
                                            <span>{batch.students_enrolled}/{batch.capEnrollment}</span>
                                        </div>

                                        {batch.createdAt && batch.updatedAt && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="text-xs">{formatDate(batch.createdAt)} - {formatDate(batch.updatedAt)}</span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="pt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewStudents(batch.id, batch.name)}
                                            className="w-full"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Students
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : searchQuery ? (
                            <div className="col-span-full flex flex-col items-center justify-center gap-y-3 py-12">
                                <div className="text-center">
                                    <p className="text-lg font-medium text-gray-600">
                                        {`No batches found for "${searchQuery}"`}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Try adjusting your search or create a new batch
                                    </p>
                                </div>
                                {renderModal(true)}
                            </div>
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center gap-y-3 py-12">
                                <Image
                                    src="/batches.svg"
                                    alt="create batch"
                                    width={100}
                                    height={100}
                                />
                                <p className="text-center text-gray-600">
                                    Start by creating the first batch for the course. Learners will get added
                                    automatically based on enrollment cap
                                </p>
                                {renderModal(true)}
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Modal */}
                {renderEditModal()}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false)
                        setBatchToDelete(null)
                    }}
                    onConfirm={batchDeleteHandler}
                    modalText="Type the batch name to confirm deletion"
                    modalText2="Batch Name"
                    input={true}
                    buttonText="Delete Batch"
                    instructorInfo={batchToDelete}
                />
            </div>
        )
    }

    return null
}

export default Page