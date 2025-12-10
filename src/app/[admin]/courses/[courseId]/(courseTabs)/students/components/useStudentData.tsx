import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { getBatchData } from '@/store/store'
import { getStoreStudentDataNew } from '@/store/store'
import { fetchStudentsHandler } from '@/utils/admin'
import { useSearchParams, useRouter } from 'next/navigation'
import { POSITION } from '@/utils/constant'

export const useStudentData = (courseId: any) => {
    const {
        students,
        setStudents,
        totalPages,
        setTotalPages,
        loading,
        setLoading,
        setOffset,
        offset,
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
    const prevCourseId = useRef<any>(null)
    const searchParams = useSearchParams()
    
    const queryLimit = useMemo(() => parseInt(searchParams.get('limit') || POSITION), [searchParams])
    const queryPage = parseInt(searchParams.get("page") || "1")
    const querySearch = searchParams.get("search") || ""
    const calculatedOffset = useMemo(() => (queryPage - 1) * queryLimit, [queryPage, queryLimit])

    // Clear data when course changes
    useEffect(() => {
      if (prevCourseId.current !== null && prevCourseId.current !== courseId) {
        setSearch('')
        setOffset(0)
        setCurrentPage(1)
        setStudents([])
        setTotalPages(0)
        setTotalStudents(0)
      }
      prevCourseId.current = courseId
    }, [courseId, setStudents, setTotalPages, setTotalStudents, setSearch, setOffset, setCurrentPage])

    // Fetch batches once
    useEffect(() => {
      fetchBatches(courseId)
    }, [courseId, fetchBatches])
    
    // Reset page on search change
    useEffect(() => {
      if (search !== querySearch) {
        setCurrentPage(1)
        setOffset(0)
        setSearch(querySearch)
      }
    }, [querySearch, search, setCurrentPage, setOffset, setSearch])

    // Pagination handlers
    const nextPageHandler = useCallback(() => {
      if (currentPage < totalPages) {
        const newOffset = offset + queryLimit
        setOffset(newOffset)
        setCurrentPage(currentPage + 1)
      }
    }, [currentPage, totalPages, offset, queryLimit, setOffset, setCurrentPage])

    const previousPageHandler = useCallback(() => {
      if (currentPage > 1) {
        const newOffset = offset - queryLimit
        setOffset(newOffset)
        setCurrentPage(currentPage - 1)
      }
    }, [currentPage, offset, queryLimit, setOffset, setCurrentPage])

    const firstPageHandler = useCallback(() => {
      setOffset(0)
      setCurrentPage(1)
    }, [setOffset, setCurrentPage])

    const lastPageHandler = useCallback(() => {
      const newOffset = (totalPages - 1) * queryLimit
      setOffset(newOffset)
      setCurrentPage(totalPages)
    }, [totalPages, queryLimit, setOffset, setCurrentPage])

    const onLimitChange = useCallback((newLimit: number) => {
      setLimit(newLimit)
      setOffset(0)
      setCurrentPage(1)
    }, [setLimit, setOffset, setCurrentPage])

    const fetchStudentData = useCallback((offsetValue: number) => {
      setOffset(offsetValue)
    }, [setOffset])

    return {
        students,
        totalPages,
        loading,
        offset,
        totalStudents,
        currentPage,
        limit: queryLimit,
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