'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
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
    DialogClose,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { api } from '@/utils/axios.config'
import { getBatchData, getCourseData, getStoreStudentData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { fetchStudentData } from '@/utils/students'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Users, Plus, Eye, Mail, Calendar, Edit } from 'lucide-react'
import { StudentData, ParamsType } from "@/app/admin/courses/[courseId]/(courseTabs)/batches/courseBatchesType"

// Helper Functions
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()
const getStatusColor = (status: string) => {
    switch (status) {
        case 'not_started': return 'bg-gray-200 text-gray-800'
        case 'ongoing': return 'bg-green-200 text-green-800'
        case 'completed': return 'bg-blue-200 text-blue-800'
        default: return 'bg-gray-200 text-gray-800'
    }
}

const Page = ({ params }: { params: ParamsType }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const storeStudentData = getStoreStudentData()
    const { courseData, fetchCourseDetails } = getCourseData()
    const { batchData, setBatchData } = getBatchData()
    const { setStoreStudentData } = getStoreStudentData()

    // State
    const [loading, setLoading] = useState(true)
    const [assignStudents, setAssignStudents] = useState('')
    const [manualAssignmentMethod, setManualAssignmentMethod] = useState('unassigned')
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [totalStudents, setTotalStudents] = useState<StudentData[]>([])
    const [searchStudent, setSearchStudent] = useState('')
    const debouncedSearchStudent = useDebounce(searchStudent, 1000)
    const [studentData, setStudentData] = useState<any>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBatch, setEditingBatch] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [singleStudentData, setSingleStudentData] = useState<any>({})
    const [currentStep, setCurrentStep] = useState(1)

    const enhancedBatchData = batchData ?? []

    // API Callbacks
    const defaultFetchApi = useCallback(async () => {
        setSearchQuery('')
        const response = await api.get(`/bootcamp/batches/${params.courseId}`);
        setBatchData(response.data?.data || [])
        return response.data?.data || []
    }, [params.courseId, setBatchData])

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        const response = await api.get(`/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`)
        return response.data || []
    }, [params.courseId])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setSearchQuery(query)
        const response = await api.get(`/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`)
        setBatchData(response.data || [])
        return response.data || []
    }, [params.courseId, setBatchData])

    // Form Schema
    const formSchema = z.object({
        name: z.string().min(3),
        instructorEmail: z.string().email(),
        bootcampId: z.string().refine((id) => !isNaN(parseInt(id))),
        capEnrollment: z.string().refine(val => {
            const num = parseInt(val)
            return !isNaN(num) && num > 0 && num <= 100000
        }),
        assignLearners: z.string(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
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

    // Effects
    useEffect(() => {
        if (params.courseId) fetchCourseDetails(params.courseId)
    }, [params.courseId, fetchCourseDetails])

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const getUnAssignedStudents = useCallback(async () => {
        try {
            const res = await api.get(`/batch/allUnassignStudent/${params.courseId}?searchTerm=${debouncedSearchStudent}`)
            setTotalStudents(res.data.data)
        } catch (err) {
            console.error(err)
        }
    }, [debouncedSearchStudent, params.courseId])

    useEffect(() => { getUnAssignedStudents() }, [getUnAssignedStudents])

    // Handlers
    const handleEditBatch = (batch: any) => {
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

    const handleUpdateBatch = async (values: z.infer<typeof formSchema>) => {
        if (!editingBatch) return
        try {
            await api.put(`/batch/${editingBatch.id}`, {
                name: values.name,
                instructorEmail: values.instructorEmail,
                capEnrollment: +values.capEnrollment,
            })
            defaultFetchApi()
            setIsEditModalOpen(false)
            setEditingBatch(null)
            toast.success({ title: 'Success', description: 'Batch updated successfully' })
        } catch (error: any) {
            toast.error({ title: 'Failed', description: error.response?.data?.message || 'Failed to update batch' })
        }
    }

    const handleViewStudents = (batchId: string | number) => {
        router.push(`/admin/courses/${params.courseId}/students?batch=${batchId}`)
    }

    const handleSearchStudents = (e: React.ChangeEvent<HTMLInputElement>) => setSearchStudent(e.target.value)
    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'text/csv') setCsvFile(file)
        else toast.error({ title: 'Invalid File', description: 'Please select a valid CSV file' })
    }

    const handleManualSubmit = async () => {
        const isValid = await form.trigger()
        if (isValid) {
            const values = form.getValues()
            const success = await onSubmit(values)
            if (success) setIsDialogOpen(false)
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (isEditModalOpen && editingBatch) return handleUpdateBatch(values)
        try {
            const convertedData = {
                name: values.name,
                instructorEmail: values.instructorEmail,
                bootcampId: +values.bootcampId,
                capEnrollment: +values.capEnrollment,
                assignAll: values.assignLearners === 'all',
                studentIds: selectedRows.map(s => s.id),
            }
            await api.post(`/batch`, convertedData)
            form.reset()
            setSelectedRows([])
            defaultFetchApi()
            fetchStudentData(params.courseId, setStoreStudentData)
            toast.success({ title: 'Success', description: 'Batch created successfully' })
            return true
        } catch (error: any) {
            toast.error({ title: 'Failed', description: error.response?.data?.message || 'Error creating batch' })
            return false
        }
    }

    const columns = useMemo(() => [], []) // Replace with createColumns logic if needed

    const handleModal = (isOpen: boolean) => {
        setIsDialogOpen(isOpen)
        if (isOpen) form.reset()
        else { setAssignStudents(''); setSelectedRows([]); setSearchStudent('') }
    }

    const renderManualAssignmentMethod = () => <div>Manual Assignment Placeholder</div>
    const renderAssignmentMethodContent = () => <div>Assignment Content Placeholder</div>

    // Modal JSX
    const renderModal = () => (
        <Dialog open={isDialogOpen} onOpenChange={handleModal}>
            <DialogTrigger asChild>
                <Button className="lg:max-w-[200px] w-full mt-5 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Batch
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditModalOpen ? `Edit Batch` : 'Create New Batch'}</DialogTitle>
                    <DialogDescription>
                        {isEditModalOpen ? 'Update batch details' : 'Add learners to the batch'}
                    </DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="instructorEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instructor Email</FormLabel>
                                    <FormControl><Input type="email" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="capEnrollment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cap Enrollment</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={!form.formState.isValid}>{isEditModalOpen ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )

    if (!courseData?.id) return null

    return (
        <div className="w-full space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-left">Batches</h2>
                    <p className="text-muted-foreground">Organize students into batches</p>
                </div>
                {renderModal()}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner className="text-secondary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enhancedBatchData.length > 0 ? enhancedBatchData.map(batch => (
                        <Card key={batch.id} className="hover:shadow-lg flex flex-col w-[450px]">
                            <CardHeader className="pb-3 flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-semibold">{batch.name}</CardTitle>
                                    <Badge className={`capitalize text-xs ${getStatusColor(batch.status)}`}>{batch.status.replace('_', ' ')}</Badge>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleEditBatch(batch)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>Instructor: {batch.instructorEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>Students: {batch.students_enrolled}/{batch.capEnrollment}</span>
                                </div>
                                {batch.createdAt && batch.updatedAt && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Duration: {formatDate(batch.createdAt)} - {formatDate(batch.updatedAt)}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewStudents(batch.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Students
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <div className="col-span-full flex flex-col items-center py-12">
                            <Image src="/batches.svg" alt="create batch" width={100} height={100} />
                            <p className="text-center text-gray-600 mt-3">Start by creating the first batch for the course.</p>
                            {renderModal()}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Page
