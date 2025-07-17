import { useCallback, useEffect, useState, useRef } from 'react'
import { getBatchData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { getStoreStudentDataNew } from '@/store/store'
import { fetchStudentsHandler } from '@/utils/admin'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/utils/axios.config'

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
    const prevCourseId = useRef<any>(null)

    const [internalSearch, setInternalSearch] = useState('') // for suggestions
    const [suggestions, setSuggestions] = useState<any[]>([]) // separate state for suggestions
    const [isInitialized, setIsInitialized] = useState(false) // Track if we've initialized from URL
    const debouncedInternalSearch = useDebounce(internalSearch, 300)

    // Clear search immediately when courseId changes
    useEffect(() => {
        if (prevCourseId.current !== null && prevCourseId.current !== courseId) {
            // Course changed - force clear everything
            setSearch('')
            setInternalSearch('')
            setSuggestions([])
            setOffset(0)
            setCurrentPage(1)
            setStudents([]) // Clear students data immediately
            setTotalPages(0)
            setTotalStudents(0)
            setIsInitialized(false) // Reset initialization flag
            
            // Clear URL immediately
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.delete('search')
            window.history.replaceState({}, '', currentUrl.toString())
        }
        prevCourseId.current = courseId
    }, [courseId, setStudents, setTotalPages, setTotalStudents, setSearch, setInternalSearch, setOffset, setCurrentPage])

    // Initialize search from URL params first
    useEffect(() => {
        if (courseId !== undefined && !isInitialized) {
            const searchQuery = searchParams.get('search') || ''
            setSearch(searchQuery)
            setInternalSearch(searchQuery)
            setIsInitialized(true)
        }
    }, [courseId, searchParams, isInitialized, setSearch])

    // Fetch data when courseId and search are ready
    useEffect(() => {
        if (courseId !== undefined && isInitialized) {
            // Clear existing data first
            setStudents([])
            setTotalPages(0)
            setTotalStudents(0)
            
            // Then fetch new data with the correct search term
            fetchStudentsHandler({
                courseId,
                limit,
                offset: 0, // Always start from 0 when initializing
                searchTerm: search, // Use the search term from URL
                setLoading,
                setStudents,
                setTotalPages,
                setTotalStudents,
                setCurrentPage,
                showError: false,
            })
        }
    }, [courseId, isInitialized, search, limit, setLoading, setStudents, setTotalPages, setTotalStudents, setCurrentPage])

    // Fetch suggestions separately from main data
    useEffect(() => {
        if (debouncedInternalSearch.trim() && courseId) {
            fetchSuggestions(debouncedInternalSearch.trim())
        } else {
            setSuggestions([])
        }
    }, [debouncedInternalSearch, courseId])

    const fetchSuggestions = useCallback(async (searchTerm: string) => {
        try {
            const response = await api.get(
                `/bootcamp/students/${courseId}?limit=50&offset=0&search=${searchTerm}`
            )
            setSuggestions(response.data.modifiedStudentInfo || [])
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            setSuggestions([])
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

    const handleSetSearch = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value
        setInternalSearch(value)
    }, [])

    const commitSearch = useCallback((value: string) => {
        setSearch(value)
        // Only reset to page 1 if we're actually searching, not clearing
        if (value.trim()) {
            setOffset(0)
            setCurrentPage(1)
        }

        const params = new URLSearchParams(window.location.search)
        if (value) {
            params.set('search', value)
        } else {
            params.delete('search')
        }
        router.replace(`?${params.toString()}`)
    }, [setSearch, setOffset, setCurrentPage, router])

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
        suggestions, // return suggestions instead of students for autocomplete
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
        fetchStudentData, // Added this for DataTablePagination
    }
}