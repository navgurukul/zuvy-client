import { useState, useCallback, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { getBatchData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'

export const useStudentData = (courseId: any) => {
    const [students, setStudents] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [offset, setOffset] = useState<number>(0)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [search, setSearch] = useState<string>('')
    const debouncedSearch = useDebounce(search, 1000)
    const { fetchBatches, batchData } = getBatchData()

    const fetchStudentsHandler = useCallback(async () => {
        setLoading(true)

        const endpoint = debouncedSearch
            ? `/bootcamp/students/${courseId}?searchTerm=${debouncedSearch}`
            : `/bootcamp/students/${courseId}?limit=${limit}&offset=${offset}`

        try {
            const res = await api.get(endpoint)
            setStudents(res.data.modifiedStudentInfo || [])
            setTotalPages(res.data.totalPages || 0)
            setTotalStudents(res.data.totalStudentsCount || 0)
            setCurrentPage(res.data.currentPage || 1)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch the data',
            })
        } finally {
            setLoading(false)
        }
    }, [courseId, limit, offset, debouncedSearch])

    useEffect(() => {
        fetchStudentsHandler()
    }, [fetchStudentsHandler])

    useEffect(() => {
        fetchBatches(courseId)
    }, [courseId, fetchBatches])

    const nextPageHandler = useCallback(() => {
        if (currentPage < totalPages) {
            setOffset((prevValue) => prevValue + limit)
        }
    }, [currentPage, totalPages, limit])

    const previousPageHandler = useCallback(() => {
        if (currentPage > 1) {
            setOffset((prevValue) => prevValue - limit)
        }
    }, [currentPage, limit])

    const firstPageHandler = useCallback(() => {
        setOffset(0)
    }, [])

    const lastPageHandler = useCallback(() => {
        setOffset((totalPages - 1) * limit)
    }, [totalPages, limit])

    const onLimitChange = useCallback((newLimit: any) => {
        setLimit(Number(newLimit))
        setOffset(0)
    }, [])

    const handleSetSearch = useCallback((e: any) => {
        setSearch(e.target.value)
    }, [])

    return {
        students,
        totalPages,
        loading,
        offset,
        totalStudents,
        currentPage,
        limit,
        search,
        batchData,
        setOffset,
        setStudents,
        nextPageHandler,
        previousPageHandler,
        firstPageHandler,
        lastPageHandler,
        onLimitChange,
        handleSetSearch,
    }
}
