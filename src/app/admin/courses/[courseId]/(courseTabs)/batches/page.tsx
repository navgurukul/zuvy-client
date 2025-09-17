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
import { getBatchData, getCourseData, getStoreStudentData } from '@/store/store'
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
    UserPlus
} from 'lucide-react'
import { StudentData, BatchSuggestion, StudentDataState, ParamsType } from "@/app/admin/courses/[courseId]/(courseTabs)/batches/courseBatchesType"
import { SearchBox } from '@/utils/searchBox'

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

    // Other states
    const [loading, setLoading] = useState(true)
    const [assignStudents, setAssignStudents] = useState('')
    const [manualAssignmentMethod, setManualAssignmentMethod] = useState('unassigned') // New state for assignment method
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [totalStudents, setTotalStudents] = useState([...students])
    const [searchStudent, setSearchStudent] = useState('')
    const debouncedSearchStudent = useDebounce(searchStudent, 1000)
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [singleStudentData, setSingleStudentData] = useState({
        name: '',
        email: '',
        phone: ''
    })
    
    // New states for edit functionality
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingBatch, setEditingBatch] = useState<EnhancedBatch | null>(null)
    const [currentStep, setCurrentStep] = useState(1)

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
        instructorEmail: z.string().email(),
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
        values: {
            name: '',
            instructorEmail: '',
            bootcampId: courseData?.id.toString() ?? '',
            capEnrollment: '',
            assignLearners: 'all',
        },
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
        // Navigate to students tab with batch pre-selected
        
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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // If editing, use update handler
        if (isEditModalOpen && editingBatch) {
            return handleUpdateBatch(values)
        }

        // Original create logic
        try {
            let studentIds: number[] = []
            let assignAll = true

            // Handle different assignment methods
            if (assignStudents === 'manually') {
                if (manualAssignmentMethod === 'unassigned') {
                    studentIds = selectedRows.map((student) => student.id)
                    assignAll = studentIds.length === 0
                } else if (manualAssignmentMethod === 'single') {
                    // Handle single student creation logic here
                    // You might need to create the student first, then get their ID
                    assignAll = false
                    // This would require additional API call to create student first
                } else if (manualAssignmentMethod === 'csv') {
                    // Handle CSV upload logic here
                    assignAll = false
                    // Parse CSV and extract student IDs or create students
                }
            }

            const convertedData = {
                name: values.name,
                instructorEmail: values.instructorEmail,
                bootcampId: +values.bootcampId,
                capEnrollment: +values.capEnrollment,
                assignAll: assignAll,
                studentIds: studentIds,
            }

            const convertedName: string = convertedData.name
                .replace(/\s+/g, '')
                .toLowerCase()
            const matchedBatchData = enhancedBatchData?.find(
                (batchDataItem) =>
                    convertedName === batchDataItem.name.toLowerCase()
            )

            if (matchedBatchData) {
                toast.error({
                    title: 'Cannot Create New Batch',
                    description: 'This Batch Name Already Exists',
                })
            } else {
                const res = await api.post(`/batch`, convertedData)
                setAssignStudents('')
                setManualAssignmentMethod('unassigned')
                if (params.courseId) {
                    defaultFetchApi()
                    fetchStudentData(params.courseId, setStoreStudentData)
                    fetchCourseDetails(params.courseId)
                }
                toast.success({
                    title: res.data.status,
                    description: res.data.message,
                })
                getUnAssignedStudents()
                return true
            }
        } catch (error: any) {
            setAssignStudents('')
            setManualAssignmentMethod('unassigned')
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
            console.error('Error creating batch:', error)
            return false
        }
    }

    // Rest of the existing useEffect and other functions remain the same
    useEffect(() => {
        if (params.courseId) {
            fetchCourseDetails(params.courseId)
        }
    }, [params.courseId, fetchCourseDetails])

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
        if (!isOpen) {
            form.reset()
            setAssignStudents('')
            setManualAssignmentMethod('unassigned')
            setCsvFile(null)
            setSingleStudentData({ name: '', email: '', phone: '' })
            setEditingBatch(null)
            setIsEditModalOpen(false)
        }
    }

    // Render manual assignment method selection
    const renderManualAssignmentMethod = () => {
        return (
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-medium">Choose Assignment Method</Label>
                    <p className="text-sm text-muted-foreground">Select how you want to add students to this batch</p>
                </div>
                
                <RadioGroup 
                    value={manualAssignmentMethod} 
                    onValueChange={setManualAssignmentMethod}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="unassigned" id="unassigned" />
                        <div className="flex-1">
                            <Label htmlFor="unassigned" className="font-medium cursor-pointer">
                                Select from Unassigned Students
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Choose from existing unassigned students in the course
                            </p>
                        </div>
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="single" id="single" />
                        <div className="flex-1">
                            <Label htmlFor="single" className="font-medium cursor-pointer">
                                Add Single Student
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Add a new student by entering their details manually
                            </p>
                        </div>
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="csv" id="csv" />
                        <div className="flex-1">
                            <Label htmlFor="csv" className="font-medium cursor-pointer">
                                Upload CSV File
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Bulk upload students using a CSV file
                            </p>
                        </div>
                        <Upload className="h-5 w-5 text-muted-foreground" />
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
                        <div className="space-y-2">
                            <Label htmlFor="studentPhone">Student Phone</Label>
                            <Input
                                id="studentPhone"
                                type="tel"
                                value={singleStudentData.phone}
                                onChange={(e) => handleSingleStudentChange('phone', e.target.value)}
                                placeholder="Enter student phone number"
                            />
                        </div>
                    </div>
                )
            
            case 'csv':
                return (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Upload a CSV file with student information
                            </p>
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleCsvFileChange}
                                className="max-w-xs mx-auto"
                            />
                            {csvFile && (
                                <p className="text-sm text-green-600 mt-2">
                                    Selected: {csvFile.name}
                                </p>
                            )}
                        </div>
                        <div className="text-center">
                            <Button variant="ghost" size="sm">
                                Download Sample CSV
                            </Button>
                        </div>
                    </div>
                )
            
            default:
                return null
        }
    }
    
    const renderModal = (emptyState: boolean) => {
        if (courseData?.unassigned_students === 0) {
            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="lg:max-w-[200px] w-full mt-5 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            {emptyState ? 'Create New Batch' : 'Create New Batch'}
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
                    />
                </Dialog>
            )
        } else {
            return (
                <Dialog onOpenChange={(isOpen) => handleModal(isOpen)}>
                    <DialogTrigger asChild>
                        <Button className="lg:max-w-[200px] w-full mt-5 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            {emptyState ? 'Create New Batch' : 'Create New Batch'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                {isEditModalOpen ? `Edit Batch - ${editingBatch?.name}` : 'Create New Batch'}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditModalOpen 
                                    ? 'Update batch details and instructor information.'
                                    : assignStudents === 'manually' 
                                        ? 'Choose how you want to add students to this batch'
                                        : `Unassigned Students in Records: ${courseData?.unassigned_students}`
                                }
                            </DialogDescription>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-8"
                                >
                                    {assignStudents === 'manually' && !isEditModalOpen ? (
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
                                                <DialogClose asChild>
                                                    <Button
                                                        type="submit"
                                                        disabled={!form.formState.isValid}
                                                    >
                                                        Create Batch
                                                    </Button>
                                                </DialogClose>
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
                                            
                                            {!isEditModalOpen && (
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
                                            )}

                                            {assignLearners === 'all' && !isEditModalOpen && (
                                                <FormDescription>
                                                    {`${courseData?.unassigned_students} ${courseData?.unassigned_students === 1 ? ' student' : ' students'} will be added to
                                                    this batch (Maximum current availability)`}
                                                </FormDescription>
                                            )}
                                            
                                            <div className="w-full flex flex-col items-end gap-y-5">
                                                {isEditModalOpen ? (
                                                    <DialogClose asChild>
                                                        <Button
                                                            className="w-1/2"
                                                            type="submit"
                                                            disabled={!form.formState.isValid}
                                                        >
                                                            Update Batch
                                                        </Button>
                                                    </DialogClose>
                                                ) : assignLearners === 'all' ? (
                                                    <DialogClose asChild>
                                                        <Button
                                                            className="w-1/2"
                                                            type="submit"
                                                            disabled={!form.formState.isValid}
                                                        >
                                                            Create batch
                                                        </Button>
                                                    </DialogClose>
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

    // Edit Modal
    const renderEditModal = () => (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
                                <Card key={batch.id} className="hover:shadow-lg transition-all duration-200 flex flex-col w-[450px]">
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 hover:bg-primary hover:text-white"
                                                onClick={() => handleEditBatch(batch)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
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
            </div>
        )
    }
}

export default Page