import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { getBatchData } from '@/store/store'
import { getStoreStudentDataNew } from '@/store/store'
import { fetchStudentsHandler } from '@/utils/admin'
import { useSearchParams, useRouter } from 'next/navigation'
import { POSITION, OFFSET } from '@/utils/constant'

export const useStudentData = (courseId: any) => {
    const {
        students,
        setStudents,
        totalPages,
        setTotalPages,
        loading,
        setLoading,
        // offset,
        setOffset,
        totalStudents,
        setTotalStudents,
        currentPage,
        setCurrentPage,
        // limit,
        setLimit,
        search,
        setSearch,
    } = getStoreStudentDataNew()

    const { fetchBatches, batchData } = getBatchData()
    const searchParams = useSearchParams()
    const router = useRouter()
    const prevCourseId = useRef<any>(null)
    const limit = useMemo(() => parseInt(searchParams.get('limit') || POSITION), [searchParams])
    const offset = useMemo(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page) : OFFSET;
    }, [searchParams]);

    // Clear data immediately when courseId changes
    useEffect(() => {
        if (prevCourseId.current !== null && prevCourseId.current !== courseId) {
            // Course changed - force clear everything
            setSearch('')
            setOffset(0)
            setCurrentPage(1)
            setStudents([]) // Clear students data immediately
            setTotalPages(0)
            setTotalStudents(0)
        }
        prevCourseId.current = courseId
    }, [courseId, setStudents, setTotalPages, setTotalStudents, setSearch, setOffset, setCurrentPage])

    // Fetch data when courseId is ready
    useEffect(() => {
        if (courseId !== undefined) {
            // Get search from URL params
            const urlSearchQuery = searchParams.get('search') || ''
            
            // Clear existing data first
            setStudents([])
            setTotalPages(0)
            setTotalStudents(0)
            
            // Set the search state from URL
            setSearch(urlSearchQuery)
            
            // Then fetch new data with search if present
            fetchStudentsHandler({
                courseId,
                limit,
                offset: 0, // Always start from 0 when initializing
                searchTerm: urlSearchQuery, // Use search from URL
                setLoading,
                setStudents,
                setTotalPages,
                setTotalStudents,
                setCurrentPage,
                showError: false,
            })
        }
    }, [courseId, limit, searchParams, setLoading, setStudents, setTotalPages, setTotalStudents, setCurrentPage, setSearch])

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
            showError: false,
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

    // Function for DataTablePagination component
    const fetchStudentData = useCallback((offsetValue: number) => {
        fetchStudentsHandler({
            courseId,
            limit,
            offset: offsetValue,
            searchTerm: search,
            setLoading,
            setStudents,
            setTotalPages,
            setTotalStudents,
            setCurrentPage,
        })
    }, [courseId, limit, search, setLoading, setStudents, setTotalPages, setTotalStudents, setCurrentPage])

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
        fetchStudentData,
    }
}