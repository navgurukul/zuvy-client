import { useCallback, useEffect, useState } from 'react'
import { getBatchData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { getStoreStudentDataNew } from '@/store/store'
import { fetchStudentsHandler } from '@/utils/admin'
import { useSearchParams, useRouter } from 'next/navigation'

export const useStudentData = (courseId: any) => {
    const {
        students,
        setStudents,
        totalPages,
        setTotalPages,
        loading,
        setLoading,
        offset,
        setOffset,
        totalStudents,
        setTotalStudents,
        currentPage,
        setCurrentPage,
        limit,
        setLimit,
        search,
        setSearch,
    } = getStoreStudentDataNew()

    const { fetchBatches, batchData } = getBatchData()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [initialSearch, setInitialSearch] = useState<string | null>(null)
    const [internalSearch, setInternalSearch] = useState('') // for suggestions
    const debouncedInternalSearch = useDebounce(internalSearch, 300)

    useEffect(() => {
        const searchQuery = searchParams.get('search') || ''
        setSearch(searchQuery)
        setInternalSearch(searchQuery)
        setInitialSearch(searchQuery)
    }, [searchParams, setSearch])

    useEffect(() => {
        if (courseId !== undefined && initialSearch !== null && search === initialSearch) {
            fetchData()
            setInitialSearch(null)
        }
    }, [courseId, search, initialSearch])

    useEffect(() => {
        if (!searchParams.get('search')) {
            setSearch('')
            setInternalSearch('')
            setCurrentPage(1)
            setOffset(0)
            setLoading(true)
        }
    }, [courseId])

    const fetchData = useCallback(() => {
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
    }, [courseId, limit, offset, search, setLoading, setStudents, setTotalPages, setTotalStudents, setCurrentPage])

    useEffect(() => {
        fetchBatches(courseId)
    }, [courseId, fetchBatches])

    const nextPageHandler = useCallback(() => {
        if (currentPage < totalPages) {
            setOffset((prev) => prev + limit)
        }
    }, [currentPage, totalPages, limit])

    const previousPageHandler = useCallback(() => {
        if (currentPage > 1) {
            setOffset((prev) => prev - limit)
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

    const handleSetSearch = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value
        setInternalSearch(value)
    }, [])

    const commitSearch = useCallback((value: string) => {
        setSearch(value)
        setOffset(0)
        setCurrentPage(1)

        const params = new URLSearchParams(window.location.search)
        if (value) {
            params.set('search', value)
        } else {
            params.delete('search')
        }
        router.replace(`?${params.toString()}`)
    }, [setSearch, setOffset, setCurrentPage, router])

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
        setLoading,
        setTotalPages,
        setCurrentPage,
        setTotalStudents,
        setOffset,
        setStudents,
        setSearch,
        nextPageHandler,
        previousPageHandler,
        firstPageHandler,
        lastPageHandler,
        onLimitChange,
        handleSetSearch,
        commitSearch,
        internalSearch,
        debouncedInternalSearch,
    }
}