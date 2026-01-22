"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { api } from '@/utils/axios.config'
import { getBatchData, getCourseData, getStoreStudentData, getDeleteStudentStore, getUser } from '@/store/store'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/hooks/useDebounce'
import { fetchStudentData } from '@/utils/students'
import { createColumns } from '@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/batches/columns'
import {
    StudentData,
    BatchSuggestion,
    StudentDataState,
    ParamsType,
    EnhancedBatch,
    PermissionsType,
} from '@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/batches/courseBatchesType'

export default function useBatches(params: ParamsType) {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    const { students } = { students: [] as StudentData[] } // placeholder if needed

    const { courseData, fetchCourseDetails } = getCourseData()
    const { batchData, setBatchData } = getBatchData()
    const { setStoreStudentData } = getStoreStudentData()
    const { setDeleteModalOpen, isDeleteModalOpen } = getDeleteStudentStore()

    const [loading, setLoading] = useState(true)
    const [assignStudents, setAssignStudents] = useState('')
    const [manualAssignmentMethod, setManualAssignmentMethod] = useState('unassigned')
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [totalStudents, setTotalStudents] = useState<StudentData[]>([])
    const [searchStudent, setSearchStudent] = useState('')
    const debouncedSearchStudent = useDebounce(searchStudent, 1000)
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const [isManualValid, setIsManualValid] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [singleStudentData, setSingleStudentData] = useState({ name: '', email: '' })
    const [permissions, setPermissions] = useState<PermissionsType>({
        createBatch: false,
        deleteBatch: false,
        editBatch: false,
        viewBatch: false,
    })

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingBatch, setEditingBatch] = useState<EnhancedBatch | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [totalBatches, setTotalBatches] = useState(0);
    const [batchesPerPage, setBatchesPerPage] = useState(10); // default value

    const [batchToDelete, setBatchToDelete] = useState<EnhancedBatch | null>(null)

    const getStatusColor = (status: string) => {
        const normalizedStatus = status?.toLowerCase()
        switch (normalizedStatus) {
            case 'ongoing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'not_started':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const determineBatchStatus = (batch: any): 'not_started' | 'ongoing' | 'completed' => {
        if (batch.status) return batch.status
        if (batch.students_enrolled === 0) return 'not_started'
        if (batch.students_enrolled >= batch.capEnrollment) return 'completed'
        return 'ongoing'
    }

    const enhancedBatchData: EnhancedBatch[] = useMemo(() => {
        if (!batchData) return []

        return batchData
            .map((batch: any) => ({
                id: batch.id,
                name: batch.name,
                instructorEmail: batch.instructorEmail || 'instructor@example.com',
                capEnrollment: batch.capEnrollment || 30,
                students_enrolled: batch.students_enrolled || 0,
                status: determineBatchStatus(batch),
                startDate: batch.startDate || '2024-01-15',
                endDate: batch.endDate || '2024-04-15',
            }))
            .sort((a, b) => {
                return new Date(a.startDate).getTime() - new Date(b.endDate).getTime()
            })
    }, [batchData])

    const formatDate = (dateString: string): string => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            return date.toISOString().split('T')[0]
        } catch (error) {
            console.error('Date formatting error:', error)
            return dateString.split('T')[0] || dateString.substring(0, 10)
        }
    }

    const fetchSuggestionsApi = useCallback(
        async (query: string): Promise<BatchSuggestion[]> => {
            const response = await api.get(`/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`)
            return response.data || []
        },
        [params.courseId]
    )

    const fetchSearchResultsApi = useCallback(
        async (query: string) => {
            setSearchQuery(query)
            const response = await api.get(`/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`)
            setBatchData(response.data || [])
            return response.data || []
        },
        [params.courseId, setBatchData]
    )

    // const defaultFetchApi = useCallback(async () => {
    //     setSearchQuery('')
    //     const response = await api.get(`/bootcamp/batches/${params.courseId}`)
    //     setBatchData(response.data?.data || [])
    //     setPermissions(response.data?.permissions)
    //     return response.data?.data || []
    // }, [params.courseId, setBatchData])


    const defaultFetchApi = useCallback(
        async (offset: number = 0, limit: number = batchesPerPage) => {
            setLoading(true);
            try {
                const response = await api.get(
                    `/bootcamp/batches/${params.courseId}?limit=${limit}&offset=${offset}`
                );

                setBatchData(response.data?.data || []);
                setTotalBatches(response.data?.totalBatches || 0); // ✅ store total
                setPermissions(response.data?.permissions);

                return response.data?.data || [];
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [params.courseId, batchesPerPage, setBatchData]
    );


    // Create dynamic form schema function that includes current students check
    const createFormSchema = (editingBatch: EnhancedBatch | null) => {
        return z.object({
            name: z.string().min(3, { message: 'Batch name must be at least 3 characters.' }),
            instructorEmail: z.string().email({ message: 'Please enter a valid email address.' }),
            bootcampId: z.string().refine((bootcampId) => !isNaN(parseInt(bootcampId))),
            capEnrollment: z.string()
                .refine((capEnrollment) => {
                    const parsedValue = parseInt(capEnrollment)
                    return !isNaN(parsedValue) && parsedValue > 0 && parsedValue <= 100000
                }, { message: 'Cap Enrollment must be a positive number from 1 to 100000' })
                .superRefine((capEnrollment, ctx) => {
                    // Additional validation for edit mode
                    if (editingBatch) {
                        const parsedValue = parseInt(capEnrollment)
                        const currentStudents = editingBatch.students_enrolled || 0
                        
                        if (parsedValue < currentStudents) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: `Cap enrollment cannot be less than the number of current students (${currentStudents}).`
                            })
                        }
                    }
                }),
            assignLearners: z.string(),
        })
    }

    const formSchema = useMemo(() => createFormSchema(editingBatch), [editingBatch])

    const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            instructorEmail: '',
            bootcampId: courseData?.id?.toString() ?? '',
            capEnrollment: '',
            assignLearners: 'all',
        },
        mode: 'onChange',
    })

    // Update form validation when editingBatch changes
    useEffect(() => {
        if (editingBatch) {
            // Re-validate the form with new schema
            form.trigger('capEnrollment')
        }
    }, [editingBatch, form])

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
        
        // Trigger validation after setting the batch
        setTimeout(() => {
            form.trigger('capEnrollment')
        }, 0)
    }

    const handleDeleteBatch = (batch: EnhancedBatch) => {
        setBatchToDelete(batch)
        setDeleteModalOpen(true)
    }

    const batchDeleteHandler = async () => {
        if (!batchToDelete) return
        try {
            await api.delete(`/batch/${batchToDelete.id}`)
            toast.success({
                title: 'Success',
                description: 'Batch deleted successfully'
            })
            setDeleteModalOpen(false)
            setBatchToDelete(null)
            defaultFetchApi()
        } catch (error) {
            toast.error({
                title: 'Failed',
                description: 'Error deleting batch'
            })
            console.error('Error deleting batch', error)
        }
    }

    const handleUpdateBatch = async (values: z.infer<typeof formSchema>) => {
        if (!editingBatch) return
        try {
            const convertedData = {
                name: values.name,
                instructorEmail: values.instructorEmail,
                capEnrollment: +values.capEnrollment,
            }
            await api.put(`/batch/${editingBatch.id}`, convertedData)
            toast.success({
                title: 'Success',
                description: 'Batch updated successfully'
            })
            defaultFetchApi()
            setIsEditModalOpen(false)
            setEditingBatch(null)
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description: error.response?.data?.message || 'Failed to update batch'
            })
            console.error('Failed to update batch', error)
        }
    }

    const handleViewStudents = (batchId: string | number, batchName: string) => {
        router.push(`/${userRole}/courses/${params.courseId}/batch/${batchId}`)
    }

    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'text/csv') {
            setCsvFile(file)
        }
    }

    const handleSingleStudentChange = (field: string, value: string) => {
        setSingleStudentData((prev) => ({ ...prev, [field]: value }))
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (isEditModalOpen && editingBatch) {
            return handleUpdateBatch(values)
        }

        try {
            let studentIds: number[] = []
            let assignAll = true
            let studentsToAdd: any[] = []

            if (assignStudents === 'manually') {
                assignAll = false
                if (manualAssignmentMethod === 'unassigned') {
                    studentIds = selectedRows.map((student) => student.id)
                    if (studentIds.length === 0) {
                        toast.error({
                            title: 'Error',
                            description: 'Please select at least one student'
                        })
                        return false
                    }
                } else if (manualAssignmentMethod === 'single') {
                    if (!singleStudentData.name.trim() || !singleStudentData.email.trim()) {
                        toast.error({
                            title: 'Error',
                            description: 'Please enter both name and email'
                        })
                        return false
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(singleStudentData.email)) {
                        toast.error({
                            title: 'Error',
                            description: 'Please enter a valid email address'
                        })
                        return false
                    }
                    studentsToAdd = [{ name: singleStudentData.name.trim(), email: singleStudentData.email.trim() }]
                } else if (manualAssignmentMethod === 'csv') {
                    if (!studentData || !Array.isArray(studentData) || studentData.length === 0) {
                        toast.error({
                            title: 'Error',
                            description: 'Please upload a valid CSV file'
                        })
                        return false
                    }
                    studentsToAdd = studentData
                }
            }

            const bootcampId = parseInt(String(params.courseId))
            if (isNaN(bootcampId) || bootcampId <= 0) {
                toast.error({
                    title: 'Error',
                    description: 'Invalid course ID'
                })
                return false
            }

            const batchPayload = {
                name: values.name,
                instructorEmail: values.instructorEmail,
                bootcampId: bootcampId,
                capEnrollment: +values.capEnrollment,
                assignAll: assignAll,
                studentIds: studentIds,
            }

            const convertedName = batchPayload.name.replace(/\s+/g, '').toLowerCase()
            const matchedBatchData = enhancedBatchData?.find((batch) => convertedName === batch.name.replace(/\s+/g, '').toLowerCase())
            if (matchedBatchData) {
                toast.error({
                    title: 'Error',
                    description: 'A batch with this name already exists'
                })
                return false
            }

            const batchResponse = await api.post(`/batch`, batchPayload)
            const newBatchId = batchResponse.data.data?.id || batchResponse.data.id

            if (studentsToAdd.length > 0) {
                try {
                    const studentsPayload = { students: studentsToAdd }
                    await api.post(`/bootcamp/students/${params.courseId}?batch_id=${newBatchId}`, studentsPayload)
                } catch (error) {
                    toast.warning({
                        title: 'Partial Success',
                        description: 'Batch created but some students could not be added'
                    })
                    console.warn('Partial success: batch created but students not added', error)
                }
            }

            setAssignStudents('')
            setManualAssignmentMethod('unassigned')
            setSelectedRows([])
            setStudentData({})
            setSingleStudentData({ name: '', email: '' })

            if (params.courseId) {
                fetchStudentData(params.courseId, setStoreStudentData)
                fetchCourseDetails(params.courseId)
                defaultFetchApi()
            }

            toast.success({
                title: 'Success',
                description: 'Batch created successfully'
            })
            getUnAssignedStudents()
            return true
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description: error.response?.data?.message || 'Failed to create batch'
            })
            setAssignStudents('')
            setManualAssignmentMethod('unassigned')
            setSelectedRows([])
            console.error('Error creating batch:', error)
            return false
        }
    }
    useEffect(() => {
        if (params.courseId) fetchCourseDetails(params.courseId)
    }, [params.courseId, fetchCourseDetails])

    useEffect(() => {
        if (courseData?.id) {
            defaultFetchApi();
        }
    }, [courseData?.id]);



    const getUnAssignedStudents = useCallback(async () => {
        try {
            const res = await api.get(`/batch/allUnassignStudent/${params.courseId}?searchTerm=${debouncedSearchStudent}`)
            setTotalStudents(res.data.data)
        } catch (err) {
            console.error('Failed to fetch unassigned students:', err)
        }
    }, [debouncedSearchStudent, params.courseId])

    useEffect(() => {
        getUnAssignedStudents()
    }, [getUnAssignedStudents, debouncedSearchStudent, params.courseId])

    const handleSearchStudents = (e: React.ChangeEvent<HTMLInputElement>) => setSearchStudent(e.target.value)

    const assignLearners = form.watch('assignLearners')
    const capEnrollmentValue = form.watch('capEnrollment')

    const columns = useMemo(() => createColumns(Number(capEnrollmentValue)), [capEnrollmentValue])

    return {
        courseData,
        enhancedBatchData,
        loading,
        permissions,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        editingBatch,
        setEditingBatch,
        currentStep,
        setCurrentStep,
        batchToDelete,
        setBatchToDelete,
        assignStudents,
        setAssignStudents,
        manualAssignmentMethod,
        setManualAssignmentMethod,
        selectedRows,
        setSelectedRows,
        totalStudents,
        searchStudent,
        handleSearchStudents,
        studentData,
        setStudentData,
        isManualValid,
        setIsManualValid,
        searchQuery,
        csvFile,
        setCsvFile,
        singleStudentData,
        setSingleStudentData,
        handleSingleStudentChange,
        fetchSuggestionsApi,
        fetchSearchResultsApi,
        defaultFetchApi,
        handleEditBatch,
        handleDeleteBatch,
        batchDeleteHandler,
        handleUpdateBatch,
        handleViewStudents,
        handleCsvFileChange,
        onSubmit,
        columns,
        getStatusColor,
        formatDate,
        assignLearners,
        form,
        getUnAssignedStudents,
        isDeleteModalOpen,
        setDeleteModalOpen,
        totalBatches,
        batchesPerPage,
        setBatchesPerPage,
    }
}

