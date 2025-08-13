'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { title } from 'process'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {BootcampData,AssignmentStatus,AssignmentDataResponse} from "@/app/admin/courses/[courseId]/submissionAssignments/[assignmentData]/individualStatus/IndividualStatusType"

const Page = ({ params }: { params: any }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [assignmentTitle, setAssignmentTitle] = useState<string>('')
    const [submittedStudents, setSubmittedStudents] = useState<number>(0)
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
            crumb: 'Submission - Assignments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assignmentTitle,
            // href: '',
            isLast: true,
        },
    ]

    // Get search suggestions from existing data - use searchQuery for suggestions
    const searchSuggestions = useMemo(() => {
        if (!searchQuery.trim() || !assignmentData.length) return []

        const query = searchQuery.toLowerCase()
        const suggestions: { name: string; email: string }[] = []

        const seen = new Set()

        assignmentData.forEach((student: any) => {
            const nameMatch = student.name?.toLowerCase().includes(query)
            const emailMatch = student.emailId?.toLowerCase().includes(query)

            if ((nameMatch || emailMatch) && !seen.has(student.emailId)) {
                suggestions.push({ name: student.name, email: student.emailId })
                seen.add(student.emailId)
            }
        })

        return suggestions.slice(0, 5)
    }, [searchQuery, assignmentData])

    // Filter data based on appliedSearchQuery, not searchQuery
    const filteredData = useMemo(() => {
        if (!appliedSearchQuery.trim()) return assignmentData;

        const searchTerm = appliedSearchQuery.toLowerCase();
        return assignmentData.filter((student: any) =>
            student.name?.toLowerCase().includes(searchTerm) ||
            student.emailId?.toLowerCase().includes(searchTerm)
        );
    }, [assignmentData, appliedSearchQuery])

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

        // Show suggestions only if there's actual content and it's more than 0 characters
        setShowSuggestions(value.trim().length > 0)

        // If input is empty, clear search from URL and hide suggestions
        if (!value.trim()) {
            setShowSuggestions(false)
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

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('Error fetching bootcamp data:', error)
        }
    }, [params.courseId])

    const fetchAssignmentDataHandler = useCallback(async () => {
        try {
            await api
                .get(
                    `/submission/assignmentStatus?chapterId=${params.assignmentData}&limit=5&offset=0`
                )
                .then((res) => {
                    const assignmentData: AssignmentDataResponse = res?.data?.data
                    const chapterId = assignmentData?.chapterId
                    assignmentData.data.forEach((data:AssignmentStatus) => {
                        data.chapterId = chapterId
                    })
                    setAssignmentData(assignmentData.data)
                    setSubmittedStudents(res?.data?.data?.data.length)
                    setAssignmentTitle(res?.data?.data?.chapterName)
                })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error Fetching Assignment Data',
            })
        } finally {
        }
    }, [params.assignmentData])

    // Initialize search from URL on component mount
    useEffect(() => {
        const searchFromURL = searchParams.get('search')
        if (searchFromURL) {
            setSearchQuery(searchFromURL)
            setAppliedSearchQuery(searchFromURL) // Also apply it to filter data
        }
    }, [searchParams])

    useEffect(() => {
        Promise.all([getBootcampHandler(), fetchAssignmentDataHandler()])
    }, [getBootcampHandler, fetchAssignmentDataHandler])

    const totalStudents =
       Number(bootcampData?.students_in_bootcamp ?? 0) -
       Number(bootcampData?.unassigned_students ?? 0);


    return (
        <>
            {assignmentData ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {assignmentTitle}
                    </h1>

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {submittedStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received:
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents - submittedStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Not Yet Submitted
                            </p>
                        </div>
                    </div>

                    {/* Search Input with Suggestions */}
                    <div className="relative w-1/3">
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

                        {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                                {searchSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors text-sm text-gray-700 ${index !== searchSuggestions.length - 1 ? 'border-b border-gray-200' : ''
                                            }`}
                                        onClick={() => handleSuggestionClick(suggestion.name)}
                                        onMouseDown={(e) => e.preventDefault()} // To prevent blur before click
                                        type="button"
                                    >
                                        <div className="font-medium">{suggestion.name}</div>
                                        <div className="text-xs text-gray-500">{suggestion.email}</div>
                                    </button>
                                ))}
                            </div>
                        )}


                    </div>
                    <DataTable data={filteredData} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page;