import { useCallback, useEffect } from 'react'

import { getBatchData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { getStoreStudentDataNew } from '@/store/store'
import { fetchStudentsHandler } from '@/utils/admin'

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
    const debouncedSearch = useDebounce(search, 500)
    const { fetchBatches, batchData } = getBatchData()

    const fetchData = useCallback(() => {
        fetchStudentsHandler({
            courseId,
            limit,
            offset,
            searchTerm: debouncedSearch,
            setLoading,
            setStudents,
            setTotalPages,
            setTotalStudents,
            setCurrentPage,
            showError: false,
        })
    }, [
        courseId,
        limit,
        offset,
        debouncedSearch,
        setLoading,
        setStudents,
        setTotalPages,
        setTotalStudents,
        setCurrentPage,
    ])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        fetchBatches(courseId)
    }, [courseId, fetchBatches])

    const nextPageHandler = useCallback(() => {
        if (currentPage < totalPages) {
            setOffset((prevValue: any) => prevValue + limit)
        }
    }, [currentPage, totalPages, limit, setOffset])

    const previousPageHandler = useCallback(() => {
        if (currentPage > 1) {
            setOffset((prevValue: any) => prevValue - limit)
        }
    }, [currentPage, limit, setOffset])

    const firstPageHandler = useCallback(() => {
        setOffset(0)
    }, [setOffset])

    const lastPageHandler = useCallback(() => {
        setOffset((totalPages - 1) * limit)
    }, [totalPages, limit, setOffset])

    const onLimitChange = useCallback(
        (newLimit: any) => {
            setLimit(Number(newLimit))
            setOffset(0)
        },
        [setLimit, setOffset]
    )

    const handleSetSearch = useCallback(
        (e: any) => {
            setSearch(e.target.value)
        },
        [setSearch]
    )

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
        nextPageHandler,
        previousPageHandler,
        firstPageHandler,
        lastPageHandler,
        onLimitChange,
        handleSetSearch,
    }
}
