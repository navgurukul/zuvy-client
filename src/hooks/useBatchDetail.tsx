"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { api } from '@/utils/axios.config'
import { getUser, getDeleteStudentStore, getStoreStudentData } from '@/store/store'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/hooks/useDebounce'
import { POSITION } from '@/utils/constant'
import { useStudentData } from '@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/students/components/useStudentData'
import type { StudentDataState, BatchOption, SelecteItem } from '@/app/[admin]/[organization]/courses/[courseId]/batch/[batchId]/CourseBatchesType'
import type { StudentDataPage } from '@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/students/studentComponentTypes'
import { PermissionsType } from '@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/batches/courseBatchesType'
import { createColumns } from '@/app/[admin]/[organization]/courses/[courseId]/batch/[batchId]/columns'

export default function useBatchDetail(params: { courseId: string; batchId: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const location = usePathname()

    const { students, setStudents } = useStudentData(params.courseId)
    const { studentsData, setStoreStudentData } = getStoreStudentData()

    const [allBatches, setAllBatches] = useState<any>([])
    const [studentData, setStudentData] = useState<StudentDataPage[]>([])
    const [bootcamp, setBootcamp] = useState<any>([])
    const [search, setSearch] = useState('')
    const { setDeleteModalOpen, isDeleteModalOpen } = getDeleteStudentStore()
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
    const [instructorsInfo, setInstructorInfo] = useState<any>([])
    const [pages, setPages] = useState<number>()
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const [offset, setOffset] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [error, setError] = useState(true)
    const debouncedValue = useDebounce(search, 1000)
    const [loading, setLoading] = useState(true)
    const [selectedRows, setSelectedRows] = useState<StudentDataPage[]>([])
    const [studentDataTable, setStudentDataTable] = useState<StudentDataState | any>({})
    const [permissions, setPermissions] = useState<PermissionsType>({
        createBatch: false,
        deleteBatch: false,
        editBatch: false,
        viewBatch: false,
    })

    const formSchema = z.object({
        name: z.string().min(2, { message: 'Batch name must be at least 2 characters.' }),
        instructorEmail: z.string().min(2, { message: 'Instructor email must be at least 2 characters.' }),
        capEnrollment: z.string().refine(
            (capEnrollment) => {
                const capEnrollmentValue = parseInt(capEnrollment)
                return !isNaN(capEnrollmentValue) && capEnrollmentValue >= 1 && capEnrollmentValue >= studentsData.length && capEnrollmentValue <= 100000
            },
            (val) => {
                const capEnrollmentValue = parseInt(val)
                if (capEnrollmentValue > 100000) {
                    return { message: 'Cap Enrollment cannot exceed 100000.' }
                }
                return { message: `Cap Enrollment must be at least 1 and not less than the number of current students (${studentsData?.length}).` }
            }
        ),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: instructorsInfo.name || '',
            instructorEmail: instructorsInfo.instructorEmail || '',
            capEnrollment: instructorsInfo.capEnrollment || '',
        },
        mode: 'onChange',
    })

    useEffect(() => {
        form.setValue('name', instructorsInfo?.name || '')
        form.setValue('instructorEmail', `${instructorsInfo?.instructorEmail || ''}`)
        form.setValue('capEnrollment', `${instructorsInfo?.capEnrollment || ''}`)
    }, [instructorsInfo, form])

    const toggleForm = () => {
        setIsFormOpen(!isFormOpen)
        form.clearErrors()
    }

    const fetchBatches = useCallback(
        async (courseId: string) => {
            try {
                const response = await api.get(`/bootcamp/batches/${courseId}`)
                const batchData: BatchOption[] = response.data.data?.map((data: any) => ({ value: data.id, label: data.name }))
                setAllBatches(batchData)
                setPermissions(response.data?.permissions)
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    if (error?.response?.data.message === 'Bootcamp not found!') {
                        router.push(`/${userRole}/courses`)
                        toast.info({ title: 'Caution', description: 'The Course has been deleted by another Admin' })
                    }
                }
                console.error('Error fetching batches', error)
            }
        },
        [router, userRole]
    )

    useEffect(() => {
        fetchBatches(params?.courseId)
    }, [params.courseId, fetchBatches])

    const fetchInstructorInfo = useCallback(
        async (batchId: string) => {
            if (batchId) {
                try {
                    const response = await api.get(`/batch/${batchId}`)
                    const batchData = response.data.batch
                    setInstructorInfo(batchData)
                } catch (error: any) {
                    router.push('/not-found')
                    console.error('Error fetching instructor info:', error.message)
                }
            }
        },
        [router]
    )

    useEffect(() => {
        fetchInstructorInfo(params.batchId)
    }, [isFormOpen, fetchInstructorInfo, params.batchId])

    useEffect(() => {
        if (params.batchId) {
            fetchInstructorInfo(params.batchId)
        }
    }, [params.batchId, router, fetchInstructorInfo])

    const batchDeleteHandler = async () => {
        try {
            await api.delete(`/batch/${params.batchId}`)
            toast.success({ title: 'Batch Deleted Successfully' })
            setDeleteModalOpen(false)
            router.push(`/${userRole}/courses/${params.courseId}/batches`)
        } catch (error) {
            toast.error({ title: 'Batch not Deleted' })
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const convertedData = { ...values, name: values.name, instructorEmail: values.instructorEmail, capEnrollment: +values.capEnrollment }
        try {
            await api.patch(`/batch/${params.batchId}`, convertedData).then((res) => {
                toast.success({ title: res.data.status, description: res.data.message })
                const fetchBatchesInfo = async () => {
                    try {
                        const response = await api.get(`/bootcamp/students/${params.courseId}?batch_id=${params.batchId}`)
                        setStudentData(response.data.modifiedStudentInfo)
                    } catch (error) {}
                }
                fetchBatchesInfo()
                fetchInstructorInfo(params.batchId)
            })
        } catch (error) {
            toast.error({ title: "Batches Didn't Update Succesfully" })
        }
    }

    useEffect(() => {
        const getBootCamp = async () => {
            await api.get(`/bootcamp/${params.courseId}`).then((response) => setBootcamp(response.data.bootcamp))
        }
        getBootCamp()
    }, [params.courseId])

    const fetchStudentData = useCallback(
        async (offset: number) => {
            let endpoint = `/bootcamp/students/${params.courseId}?batch_id=${params.batchId}&limit=${position}&offset=${offset}`
            if (debouncedValue) endpoint += `&searchTerm=${debouncedValue}`
            await api.get(endpoint).then((response) => {
                setStudentData(response.data.modifiedStudentInfo)
                setStoreStudentData(response.data.modifiedStudentInfo)
                setStudents(response.data.modifiedStudentInfo)
                setLastPage(response.data.totalPages)
                setPages(response.data.totalPages)
                setTotalStudents(response.data.totalStudentsCount)
                setLoading(false)
            })
        },
        [params, position, setStoreStudentData, setStudents, setLastPage, setPages, setTotalStudents, debouncedValue]
    )

    useEffect(() => {
        fetchStudentData(offset)
    }, [offset, position, fetchStudentData])

    const fetchStudentSuggestions = useCallback(
        async (query: string) => {
            try {
                const endpoint = `/bootcamp/students/${params.courseId}?batch_id=${params.batchId}&searchTerm=${query}`
                const response = await api.get(endpoint)
                return (
                    response.data.modifiedStudentInfo?.map((student: StudentDataPage) => ({ ...student, id: student.userId })) || []
                )
            } catch (error) {
                console.error('Error fetching student suggestions:', error)
                return []
            }
        },
        [params.courseId, params.batchId]
    )

    const performStudentSearch = useCallback(async (query: string) => {
        setSearch(query)
        return []
    }, [])

    const loadDefaultStudents = useCallback(async () => {
        setSearch('')
        fetchStudentData(0)
        return []
    }, [fetchStudentData])

    const userIds = selectedRows.map((item: SelecteItem) => item.userId)
    const columns = useMemo(() => createColumns(permissions), [permissions])

    return {
        router,
        userRole,
        students,
        setStudents,
        permissions,
        columns,
        studentsData,
        setStoreStudentData,
        allBatches,
        studentData,
        setStudentData,
        bootcamp,
        setBootcamp,
        search,
        setSearch,
        setDeleteModalOpen,
        isDeleteModalOpen,
        isAddStudentModalOpen,
        setIsAddStudentModalOpen,
        instructorsInfo,
        setInstructorInfo,
        pages,
        position,
        offset,
        setOffset,
        currentPage,
        setCurrentPage,
        totalStudents,
        setTotalStudents,
        lastPage,
        setLastPage,
        isFormOpen,
        setIsFormOpen,
        error,
        setError,
        debouncedValue,
        loading,
        setLoading,
        selectedRows,
        setSelectedRows,
        studentDataTable,
        setStudentDataTable,
        formSchema,
        form,
        toggleForm,
        fetchBatches,
        fetchInstructorInfo,
        batchDeleteHandler,
        onSubmit,
        fetchStudentData,
        fetchStudentSuggestions,
        performStudentSearch,
        loadDefaultStudents,
        userIds,
    }
}
