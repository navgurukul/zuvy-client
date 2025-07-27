'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Props = {}

const Page = ({ params }: any) => {
    const moduleId =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('moduleId')
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    // const moduleId = searchParams.get('moduleId')
    const [assesmentData, setAssesmentData] = useState<any>()
    const [studentStatus, setStudentStatus] = useState<any>()
    const [totalSubmission, setTotalSubmission] = useState<any>()
    const [notSubmitted, setNotSubmitted] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<any>()
    
    const [searchQuery, setSearchQuery] = useState<string>('') // What user types
    const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>('') // What actually filters the data
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

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
            crumb: 'Submission - Forms',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: chapterDetails?.title,
            href: '',
            isLast: true,
        },
    ]

    // Get search suggestions from existing data - use searchQuery for suggestions
    const searchSuggestions = useMemo(() => {
        if (!searchQuery.trim() || !studentStatus?.length) return []

        const suggestions = new Set<string>()
        const query = searchQuery.toLowerCase()
        const hasAtSymbol = query.includes('@')

        studentStatus.forEach((student: any) => {
            if (hasAtSymbol) {
                // Show email suggestions only if @ is present
                if (student.email && student.email.toLowerCase().includes(query)) {
                    suggestions.add(student.email)
                }
            } else {
                // Show only name suggestions if no @ symbol
                if (student.name && student.name.toLowerCase().includes(query)) {
                    suggestions.add(student.name)
                }
            }
        })

        return Array.from(suggestions).slice(0, 5)
    }, [searchQuery, studentStatus])

    // Filter data based on appliedSearchQuery, not searchQuery
    const filteredData = useMemo(() => {
        if (!appliedSearchQuery.trim() || !studentStatus) {
            return studentStatus || []
        }

        const searchTerm = appliedSearchQuery.toLowerCase()
        return studentStatus.filter((student: any) => {
            const nameMatch = student.name && student.name.toLowerCase().includes(searchTerm)
            const emailMatch = student.email && student.email.toLowerCase().includes(searchTerm)
            return nameMatch || emailMatch
        })
    }, [studentStatus, appliedSearchQuery])

    // Update URL with search parameter
    const updateSearchInURL = useCallback((query: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (query.trim()) {
            params.set('search', query)
        } else {
            params.delete('search')
        }

        router.push(pathname + '?' + params.toString())
    }, [searchParams, router, pathname])

    // Handle search input change - only update searchQuery, not appliedSearchQuery
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        setShowSuggestions(value.trim().length > 0)

        // If input is empty, clear search from URL and applied query
        if (!value.trim()) {
            setAppliedSearchQuery('') // Clear applied search when input is empty
            updateSearchInURL('')
        }
    }

    // Handle search submission - apply the search query
    const handleSearchSubmit = (query?: string) => {
        const searchTerm = query || searchQuery
        setAppliedSearchQuery(searchTerm) // Apply the search to filter data
        setShowSuggestions(false)
        updateSearchInURL(searchTerm)
    }

    // Handle suggestion click - apply the selected suggestion
    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion)
        setAppliedSearchQuery(suggestion) // Apply the selected suggestion to filter data
        setShowSuggestions(false)
        updateSearchInURL(suggestion)
    }

    // Handle clear search - clear both search queries
    const handleClearSearch = () => {
        setSearchQuery('')
        setAppliedSearchQuery('') // Clear applied search
        setShowSuggestions(false)
        updateSearchInURL('')
    }

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    // Initialize search from URL on component mount
    useEffect(() => {
        const searchFromURL = searchParams.get('search')
        if (searchFromURL) {
            setSearchQuery(searchFromURL)
            setAppliedSearchQuery(searchFromURL) // Also apply it to filter data
        }
    }, [searchParams])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching bootcamps:',
            })
        }
    }, [params.courseId])

    const getStudentFormDataHandler = useCallback(async () => {
        try {
            const res = await api.get(
                `submission/formsStatus/${params.courseId}/${moduleId}?chapterId=${params.StudentForm}&limit=10&offset=0`
            )
            const data = res.data.combinedData.map((student: any) => {
                return {
                    ...student,
                    bootcampId: params.courseId,
                    moduleId: res.data.moduleId,
                    chapterId: res.data.chapterId,
                    userId: student.id,
                    email: student.emailId,
                }
            })
            const submitted = res.data.combinedData.filter(
                (student: any) => student.status === 'Submitted'
            )
            const notSubmitted = res.data.combinedData.filter(
                (student: any) => student.status !== 'Submitted'
            )
            setStudentStatus(data)
            setTotalSubmission(submitted)
            setNotSubmitted(notSubmitted)
        } catch (err) {
            toast.error({
                title: 'Error',
                description: 'Error fetching Submissions:',
            })
        }

        try {
            const res = await api.get(`/tracking/getChapterDetailsWithStatus/${params.StudentForm}`)
            setChapterDetails(res.data.trackingData)
        } catch (err) {
            toast.error({
                title: 'Error',
                description: 'Error fetching Chapter details:',
            })
        }
    }, [params.StudentForm, moduleId])

    useEffect(() => {
        if (moduleId) {
            getStudentFormDataHandler()
            getBootcampHandler()
        }
    }, [getStudentFormDataHandler, getBootcampHandler, moduleId])

    return (
        <>
            {chapterDetails ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {chapterDetails?.title}
                    </h1>

                    {studentStatus ? (
                        <div className="text-start flex gap-x-3">
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {studentStatus?.length}
                                </h1>
                                <p className="text-gray-500 ">Total Students</p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {totalSubmission?.length}
                                </h1>
                                <p className="text-gray-500 ">
                                    Submissions Received
                                    </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {notSubmitted?.length}
                                </h1>
                                <p className="text-gray-500 ">
                                    Not Yet Submitted
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-x-20  ">
                            <div className="gap-y-4">
                                <Skeleton className="h-4 my-3 w-[300px]" />
                                <div className="space-y-2 ">
                                    <Skeleton className="h-[125px] w-[600px] rounded-xl" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Input with Suggestions */}
                    <div className="relative w-1/3 my-6">
                        <div className="relative">
                            <Input
                                placeholder="Search for Name, Email..."
                                className="input-with-icon pl-8 pr-10"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyPress}
                                onFocus={() => {
                                    if (searchQuery.trim().length > 0) {
                                        setShowSuggestions(true)
                                    }
                                }}
                                onBlur={() => {
                                    // Small delay to allow suggestion clicks to work
                                    setTimeout(() => setShowSuggestions(false), 150)
                                }}
                            />
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center hover:text-gray-600 transition-colors"
                                    type="button"
                                >
                                    <X className="text-gray-400 hover:text-gray-600" size={20} />
                                </button>
                            )}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                                {searchSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors text-sm text-gray-700"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        onMouseDown={(e) => e.preventDefault()} // Prevents onBlur from firing before onClick
                                        type="button"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <DataTable data={filteredData} columns={columns} />
                </div>
            </MaxWidthWrapper>

            {/* Click outside to close suggestions */}
            {showSuggestions && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSuggestions(false)}
                />
            )}
        </>
    )
}

export default Page