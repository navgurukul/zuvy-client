'use client'

// External imports
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// Internal imports
import { Input } from '@/components/ui/input'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import useDebounce from '@/hooks/useDebounce'
import { getIsReattemptApproved, getOffset, getPosition } from '@/store/store'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { fetchStudentAssessments } from '@/utils/admin'

type Props = {}

interface PageParams {
    courseId: string;
    assessment_Id: string;
}

interface Suggestion {
    id: string;
    name: string;
    email?: string;
}

const Page = ({ params }: any) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [assesmentData, setAssessmentData] = useState<any>()
    const [searchInputValue, setSearchInputValue] = useState<string>('')
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

    const suggestionsRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { isReattemptApproved } = getIsReattemptApproved()
    const { position, setPosition } = getPosition()
    const { offset, setOffset } = getOffset()
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalStudents, setTotalStudents] = useState(0)

    // Get search query from URL
    const searchQuery = searchParams.get('search') || ''

    // Debounced value for suggestions only
    const debouncedInputValue = useDebounce(searchInputValue, 300)

    const [dataTableAssesment, setDataTableAssessments] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [passPercentage, setPassPercentage] = useState<number>(0)

    const crumbs = [
        {
            crumb: 'My Courses',
            href: `/admin/courses`,
            isLast: false,
        },
        {
            crumb: bootcampData?.name,
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: 'Submission - Assesments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assesmentData?.title,
            // href: '',
            isLast: false,
        },
    ]

    // Initialize search input with URL parameter
    useEffect(() => {
        setSearchInputValue(searchQuery)
    }, [searchQuery])

    // Generate suggestions from existing data - MODIFIED to show names by default and emails when @ is present
    const generateSuggestions = useCallback((query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        // Don't show suggestions if query is same as current search
        if (query.trim() === searchQuery.trim()) {
            setShowSuggestions(false)
            return
        }

        setIsLoadingSuggestions(true)

        const hasAtSymbol = query.includes('@')

        // Filter from existing table data
        const filteredSuggestions = dataTableAssesment
            .filter((student: any) => {
                const name = student.name || student.studentName || student.student?.name || ''
                const email = student.email || student.studentEmail || student.student?.email || ''

                if (hasAtSymbol) {
                    // Only search emails when @ is present
                    return email.toLowerCase().includes(query.toLowerCase())
                } else {
                    // Search names by default
                    return name.toLowerCase().includes(query.toLowerCase())
                }
            })
            .slice(0, 5) // Limit to 10 suggestions
            .map((student: any) => ({
                id: student.id || student.studentId || student.student?.id || Math.random().toString(),
                name: student.name || student.studentName || student.student?.name || '',
                email: student.email || student.studentEmail || student.student?.email || ''
            }))
            .filter((suggestion: Suggestion) =>
                hasAtSymbol ? suggestion.email : suggestion.name
            ) // Filter based on search type

        setSuggestions(filteredSuggestions)

        // Show suggestions if we have results and input is focused
        if (filteredSuggestions.length > 0 && document.activeElement === inputRef.current) {
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }

        setIsLoadingSuggestions(false)
    }, [dataTableAssesment, searchQuery])

    // Generate suggestions when debounced input changes
    useEffect(() => {
        if (debouncedInputValue && debouncedInputValue.length >= 2) {
            generateSuggestions(debouncedInputValue)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [debouncedInputValue, generateSuggestions])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getStudentAssesmentDataHandler = useCallback(
        async (offset: number) => {
            if (offset >= 0) {
                const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
                    params?.assessment_Id,
                    params?.courseId,
                    offset,
                    position,
                    searchQuery,
                    setTotalPages,
                    setLastPage
                )
                setDataTableAssessments(assessments)
                setAssessmentData(moduleAssessment)
                setPassPercentage(passPercentage)
                setTotalStudents(moduleAssessment?.totalStudents)
            }
        },
        [params.assessment_Id, params.courseId, position, searchQuery]
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    // getStudentAssesmentDataHandler(offset),
                    getBootcampHandler(),
                ])
            } catch (error) {
                console.error('Error in fetching data:', error)
            }
        }

        fetchData()
    }, [isReattemptApproved, getBootcampHandler])

    useEffect(() => {
        getStudentAssesmentDataHandler(offset)
    }, [offset, getStudentAssesmentDataHandler,
        position,
        setLastPage,
        setTotalPages,
        searchQuery])

    // Handle input change
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchInputValue(value)

        // If user manually clears the input (empty value)
        if (value === '' && searchQuery !== '') {
            // Clear the search immediately
            const params = new URLSearchParams(searchParams.toString())
            params.delete('search')
            router.push(`${pathname}?${params.toString()}`)
            setShowSuggestions(false)
            setSuggestions([])
            return
        }

        // Show suggestions if we have them and input has content
        if (value.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true)
        } else if (value.length < 2) {
            setShowSuggestions(false)
            setSuggestions([])
        }
    }

    // Handle search submission (Enter key)
    const handleSearchSubmit = (query: string) => {
        const searchTerm = query.trim()

        // Update URL with search parameter
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm) {
            params.set('search', searchTerm)
        } else {
            params.delete('search')
        }

        // Navigate and hide suggestions
        router.push(`${pathname}?${params.toString()}`)
        setShowSuggestions(false)
        setSuggestions([])
        inputRef.current?.blur()
    }

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearchSubmit(searchInputValue)
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
            inputRef.current?.blur()
        }
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: Suggestion) => {
        const searchTerm = searchInputValue.includes('@') ? suggestion.email || '' : suggestion.name
        setSearchInputValue(searchTerm || '')
        setShowSuggestions(false)
        setSuggestions([])

        // Update URL and trigger search
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm?.trim()) {
            params.set('search', searchTerm.trim())
        } else {
            params.delete('search')
        }

        // Navigate to update URL
        router.push(`${pathname}?${params.toString()}`)

        // Blur input
        inputRef.current?.blur()
    }

    // Handle clear search
    const handleClearSearch = () => {
        setSearchInputValue('')
        setShowSuggestions(false)
        setSuggestions([])

        // Clear URL search parameter
        const params = new URLSearchParams(searchParams.toString())
        params.delete('search')

        router.push(`${pathname}?${params.toString()}`)
        inputRef.current?.focus()
    }

    // Handle input focus
    const handleInputFocus = () => {
        // Show suggestions if we have them and input has content
        if (searchInputValue.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true)
        } else if (searchInputValue.length >= 2) {
            // Generate suggestions if input has content but no suggestions
            generateSuggestions(searchInputValue)
        }
    }

    // Handle input blur - but with a small delay to allow suggestion clicks
    const handleInputBlur = () => {
        // Delay hiding suggestions to allow for suggestion clicks
        setTimeout(() => {
            setShowSuggestions(false)
        }, 150)
    }

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-700">
                        {assesmentData?.title}
                    </h1>

                    {
                        <div className="text-start flex gap-x-3">
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalStudents}
                                </h1>
                                <p className="text-gray-500 ">Total Students</p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalSubmitedStudents}
                                </h1>
                                <p className="text-gray-500 ">
                                    Submissions Received
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {(
                                        assesmentData?.totalStudents -
                                        assesmentData?.totalSubmitedStudents
                                    ).toString()}
                                </h1>
                                <p className="text-gray-500 ">
                                    Not Yet Submitted
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {passPercentage}%
                                </h1>
                                <p className="text-gray-500 ">
                                    Pass Percentage
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalQualifiedStudents}
                                </h1>
                                <p className="text-gray-500 ">Total Qualified Students</p>
                            </div>
                        </div>
                    }
                    <div className="relative w-1/3 my-6">
                        <div className="relative">
                            <Input
                                ref={inputRef}
                                placeholder="Search by name or email"
                                className="input-with-icon pl-8 pr-8"
                                value={searchInputValue}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                            {(searchInputValue || searchQuery) && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                            <div
                                ref={suggestionsRef}
                                className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
                            >
                                {isLoadingSuggestions ? (
                                    <div className="p-3 text-center text-gray-500">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            <span>Loading suggestions...</span>
                                        </div>
                                    </div>
                                ) :
                                    suggestions.length > 0 ? (
                                        suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                onMouseDown={(e) => {
                                                    // Prevent input blur
                                                    e.preventDefault()
                                                    handleSuggestionClick(suggestion)
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100 transition-colors"
                                            >
                                                {searchInputValue.includes('@') ? (
                                                    <div className="font-medium text-sm">
                                                        {suggestion.email}
                                                    </div>
                                                ) : (
                                                    <div className="font-medium text-sm">
                                                        {suggestion.name}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : searchInputValue.length >= 2 && !isLoadingSuggestions ? (
                                        <div className="p-3 text-center text-gray-500">
                                            No {searchInputValue.includes('@') ? 'email' : 'name'} matches found for {searchInputValue}
                                        </div>
                                    ) : null}
                            </div>
                        )}
                    </div>
                    <DataTable data={dataTableAssesment} columns={columns} />
                    <DataTablePagination
                        totalStudents={totalStudents}
                        pages={totalPages}
                        lastPage={lastPage}
                        fetchStudentData={getStudentAssesmentDataHandler}
                    />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page 
