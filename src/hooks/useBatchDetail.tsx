"use client"
import React, { useCallback, useEffect, useMemo, useState ,useRef} from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { api } from '@/utils/axios.config'
import { getUser, getDeleteStudentStore, getStoreStudentData, getStoreStudentDataNew } from '@/store/store'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/hooks/useDebounce'
import { useBatchList } from '@/hooks/useBatchList'
import { POSITION } from '@/utils/constant'
import type { StudentDataState, BatchOption, SelecteItem } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/batch/[batchId]/CourseBatchesType'
import type { StudentDataPage } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/students/studentComponentTypes'
import { PermissionsType } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/batches/courseBatchesType'
import { createColumns } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/batch/[batchId]/columns'

export default function useBatchDetail(params: { courseId: string; batchId: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId;

    const { students, setStudents } = getStoreStudentDataNew()
    const { studentsData, setStoreStudentData } = getStoreStudentData()

    const [studentData, setStudentData] = useState<StudentDataPage[]>([])
    const [bootcamp, setBootcamp] = useState<any>([])
    const [search, setSearch] = useState(searchParams?.get('search') || '')
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

    const urlSearch = searchParams?.get('search') || ''
    useEffect(() => {
        setSearch(urlSearch)
    }, [urlSearch])

    const [loading, setLoading] = useState(true)
    const [selectedRows, setSelectedRows] = useState<StudentDataPage[]>([])
    const [studentDataTable, setStudentDataTable] = useState<StudentDataState | any>({})

    // useBatchList handles the /bootcamp/batches/${courseId} call.
    // We keep the redirect-on-delete error handling here since it's specific to this hook.
    const {
        batchData,
        permissions: batchPermissions,
        error: batchError,
    } = useBatchList(params.courseId)

    // Map raw batch data to {value, label} shape expected by the batch switcher
    const allBatches: BatchOption[] = batchData.map((b) => ({ value: String(b.id), label: b.name }))

    // Permissions come from the same API response via useBatchList
    const permissions: PermissionsType = batchPermissions ?? {
        createBatch: false,
        deleteBatch: false,
        editBatch: false,
        viewBatch: false,
    }

    // Handle course-deleted redirect — mirrors the original fetchBatches error handling
    useEffect(() => {
        if (!batchError) return
        if (axios.isAxiosError(batchError)) {
            if (batchError?.response?.data?.message === 'Bootcamp not found!') {
                router.push(`/${userRole}/organizations/${orgId}/courses`)
                toast.info({ title: 'Caution', description: 'The Course has been deleted by another Admin' })
            }
        }
    }, [batchError, router, userRole, orgId])

    const lastFetchedStudentsRef = useRef<{ courseId?: string; batchId?: string; limit?: any; offset?: number; search?: string }>({})
    const lastFetchedBatchesRef = useRef<string | null>(null)
    const lastFetchedInstructorRef = useRef<string | null>(null)

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

    const fetchInstructorInfo = useCallback(
        async (batchId: string, force = false) => {
            if (batchId) {
                if (!force && lastFetchedInstructorRef.current === batchId) return
                lastFetchedInstructorRef.current = batchId
                try {
                    const response = await api.get(`/batch/${batchId}`)
                    const batchData = response.data.batch
                    setInstructorInfo(batchData)
                } catch (error: any) {
                    // router.push('/not-found')
                    console.error('Error fetching instructor info:', error.message)
                }
            }
        },
        [router]
    )

    useEffect(() => {
        fetchInstructorInfo(params.batchId)
    }, [fetchInstructorInfo, params.batchId])

    const batchDeleteHandler = async () => {
        try {
            await api.delete(`/batch/${params.batchId}`)
            toast.success({ title: 'Batch Deleted Successfully' })
            setDeleteModalOpen(false)
            router.push(`/${userRole}/organizations/${orgId}/courses/${params.courseId}/batches`)
        } catch (error) {
            toast.error({ title: 'Batch not Deleted' })
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const previousInstructorEmail = instructorsInfo?.instructorEmail || ''
        const updatedInstructorEmail = values.instructorEmail || ''
        const hasInstructorEmailChanged =
            previousInstructorEmail.trim().toLowerCase() !==
            updatedInstructorEmail.trim().toLowerCase()

        const convertedData = {
            ...values,
            name: values.name,
            instructorEmail: values.instructorEmail,
            capEnrollment: +values.capEnrollment,
            ...(hasInstructorEmailChanged && { previousInstructorEmail }),
        }
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
                fetchInstructorInfo(params.batchId, true)
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
            const searchKey = debouncedValue || '';
            if (
                lastFetchedStudentsRef.current.courseId === params.courseId &&
                lastFetchedStudentsRef.current.batchId === params.batchId &&
                lastFetchedStudentsRef.current.limit === position &&
                lastFetchedStudentsRef.current.offset === offset &&
                lastFetchedStudentsRef.current.search === searchKey
            ) {
                return;
            }
            lastFetchedStudentsRef.current = {
                courseId: params.courseId,
                batchId: params.batchId,
                limit: position,
                offset: offset,
                search: searchKey,
            };

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
        [params.courseId, params.batchId, position, setStoreStudentData, setStudents, debouncedValue]
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
    const columns = useMemo(
        () =>
            createColumns(permissions, {
                userRole,
                orgId: Number(orgId || 0),
                courseId: params.courseId,
                batchId: params.batchId,
                courseName: bootcamp?.name || '',
                batchName: studentData?.[0]?.batchName || '',
            }),
        [
            permissions,
            userRole,
            orgId,
            params.courseId,
            params.batchId,
            bootcamp?.name,
            studentData,
        ]
    )

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
